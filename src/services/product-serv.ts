import mongoose from 'mongoose';
import { AppError } from '../models/app-error';
import { IProductImage, Product } from '../models/product';

import AwsS3Service from './aws-s3-serv';
import { UserService } from './user-serv';

import config from '../config/app-config';
import constants from '../utils/constants';
import { DateUtil } from '../utils/date-util';
import { LoggerUtil } from '../utils/logger-util';
import { GenericUtil } from '../utils/generic-util';

export class ProductService {
    private dateUtil: DateUtil;
    private genericUtil: GenericUtil;
    private userService: UserService;
    private awsS3Service: AwsS3Service;

    constructor() {
        this.dateUtil = new DateUtil();
        this.genericUtil = new GenericUtil();

        this.userService = new UserService();
        this.awsS3Service = new AwsS3Service();
    }

    async find(id: string, headers: any = null) {
        try {
            const products = await Product.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    } // Match the product by ID
                },
                {
                    $addFields: {
                        // check if passed user liked the product
                        liked: {
                            $cond: {
                                if: { $ifNull: [headers.loggeduserid, false] }, // Explicitly check for null or absence
                                then: {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: "$likes",
                                                    as: "like",
                                                    cond: {
                                                        $and: [
                                                            { $eq: ["$$like.is_active", true] },
                                                            { $eq: ["$$like.user_id", new mongoose.Types.ObjectId(headers.loggeduserid)] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                else: false
                            }
                        },
                        // check if passed user bookmarked the product
                        bookmarked: {
                            $cond: {
                                if: { $ifNull: [headers.loggeduserid, false] }, // Explicitly check for null or absence
                                then: {
                                    $gt: [
                                        {
                                            $size: {
                                                $filter: {
                                                    input: "$bookmarks",
                                                    as: "bookmark",
                                                    cond: {
                                                        $and: [
                                                            { $eq: ["$$bookmark.is_active", true] },
                                                            { $eq: ["$$bookmark.user_id", new mongoose.Types.ObjectId(headers.loggeduserid)] }
                                                        ]
                                                    }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                else: false
                            }
                        },
                    }
                },
                {
                    $project: {
                        // Specify fields to include
                        name: 1, // Example: Including the product name
                        category: 1,
                        is_active: 1,
                        is_deleted: 1,
                        is_private: 1,
                        created_at: 1,
                        description: 1,

                        liked: 1,
                        bookmarked: 1,
                        // Filter nested arrays where is_active is true
                        images: {
                            $filter: {
                                input: '$images',
                                as: 'image',
                                cond: {
                                    $and: [
                                        { $eq: ['$$image.is_active', true] }
                                    ]
                                }
                            }
                        },
                        bookmarkCount: {
                            $size: {
                                $filter: {
                                    input: "$bookmarks",
                                    as: "bookmark",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$bookmark.is_active", true] }
                                        ]
                                    }
                                }
                            }
                        },
                        likeCount: {
                            $size: {
                                $filter: {
                                    input: "$likes",
                                    as: "like",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$like.is_active", true] }
                                        ]
                                    }
                                }
                            }
                        },
                        commentCount: {
                            $size: {
                                $filter: {
                                    input: "$comments",
                                    as: "comment",
                                    cond: {
                                        $and: [
                                            { $eq: ["$$comment.is_active", true] }
                                        ]
                                    }
                                }
                            }
                        },
                        tags: {
                            $filter: {
                                input: '$tags',
                                as: 'tag',
                                cond: {
                                    $and: [
                                        { $eq: ['$$tag.is_active', true] }
                                    ]
                                }
                            }
                        },
                    }
                }
            ]);

            // Since $match is used with an ID, assume at most one document should match
            return products[0]; // Return the first (and presumably only) document
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error reading product', location: 'product-serv => find', error: error.toString() });
            return Promise.reject({
                success: false,
                message: error ? error.toString() : 'Cannot find product'
            });
        }
    }

    async findOne(filter: any, headers: any = null) {
        try {
            let result: any = this.filter(filter, headers);
            if (result && result.length > 0) {
                return result[0];
            } else {
                return null;
            }
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error reading product', location: 'product-serv => find', error: error.toString() });
            return Promise.reject({
                success: false,
                message: error ? error.toString() : 'Error in finding product'
            });
        }
    }

    async store(data: any, headers: any = null) {
        let product = new Product();

        if (data.tags) {
            product.tags = [];

            data.tags.forEach((tagName: string) => {
                product.tags.push({
                    name: tagName,
                    is_active: true,
                    updated_at: null,
                    is_deleted: false,
                    created_at: data.created_at,
                    user_id: headers.loggeduserid,
                    unique_id: this.genericUtil.getUniqueId()
                });
            });
        } else {
            product.tags = [];
        }

        product.images = [];
        product.is_active = true;
        product.name = data.name;
        product.is_deleted = false;
        product.is_private = data.is_private;
        product.created_at = data.created_at;
        product.user_id = headers.loggeduserid;
        product.description = data.description;
        product.unique_id = this.genericUtil.getUniqueId();

        try {
            return await Product.create(product);
        } catch (err) {
            return Promise.reject({
                success: false,
                message: err ? err.toString() : 'Cannot create product'
            });
        }
    }

    async update(id: any, data: any, headers: any = null) {
        let product: any = await this.find(id, headers);

        if (product) {
            let productDataToUpdate: any = this.getUpdatedProduct(data, headers.loggeduserid);
            productDataToUpdate.updated_at = data.updated_at;

            if (data.removeImage) {
                product.product_image_name = constants.DEFAULTS.PRODUCT_IMAGE;
                product.product_image_saved_name = constants.DEFAULTS.PRODUCT_IMAGE;
            }

            await Product.updateOne({ _id: new mongoose.Types.ObjectId(id) }, productDataToUpdate);
            return {
                success: true
            };
        } else {
            return Promise.reject({
                message: constants.MESSAGES.ERRORS.NOT_FOUND
            });
        }
    }

    getUpdatedProduct(data: any, user_id: string) {
        let productDataToUpdate: any = {};

        if (data.hasOwnProperty('name')) productDataToUpdate.name = data.name;
        if (data.hasOwnProperty('is_active')) productDataToUpdate.is_active = data.is_active;
        if (data.hasOwnProperty('is_private')) productDataToUpdate.is_private = data.is_private;
        if (data.hasOwnProperty('description')) productDataToUpdate.description = data.description;

        if (data.hasOwnProperty('product_stage')) {
            data.product_stage.updated_at = null;
            data.product_stage.user_id = user_id;
            data.product_stage.is_deleted = false;
            data.product_stage.created_at = data.updated_at;
            data.product_stage.is_active = data.product_stage.is_active;
            data.product_stage.unique_id = this.genericUtil.getUniqueId();

            productDataToUpdate.product_stage = data.product_stage;
        }

        if (data.hasOwnProperty('tags')) {
            productDataToUpdate.tags = [];

            data.tags.forEach((tagName: string) => {
                productDataToUpdate.tags.push({
                    name: tagName,
                    is_active: true,
                    updated_at: null,
                    user_id: user_id,
                    is_deleted: false,
                    created_at: data.updated_at,
                    unique_id: this.genericUtil.getUniqueId()
                });
            });
        } else {
            productDataToUpdate.tags = [];
        }

        if (data.hasOwnProperty('glazes')) {
            data.glazes.forEach((item: any) => {
                item.is_active = true;
                item.user_id = user_id;
                item.created_at = data.updated_at;
                item.unique_id = this.genericUtil.getUniqueId();
            });

            productDataToUpdate.glazes = data.glazes;
        } else {
            productDataToUpdate.glazes = [];
        }

        if (data.hasOwnProperty('templates')) {
            data.templates.forEach((item: any) => {
                item.is_active = true;
                item.user_id = user_id;
                item.created_at = data.updated_at;
                item.unique_id = this.genericUtil.getUniqueId();
            });

            productDataToUpdate.templates = data.templates;
        } else {
            productDataToUpdate.templates = [];
        }

        if (data.hasOwnProperty('trim_decors')) {
            data.trim_decors.forEach((item: any) => {
                item.is_active = true;
                item.user_id = user_id;
                item.created_at = data.updated_at;
                item.unique_id = this.genericUtil.getUniqueId();
            });

            productDataToUpdate.trim_decors = data.trim_decors;
        } else {
            productDataToUpdate.trim_decors = [];
        }

        if (data.hasOwnProperty('form_types')) {
            data.form_types.forEach((item: any) => {
                item.is_active = true;
                item.user_id = user_id;
                item.created_at = data.updated_at;
                item.unique_id = this.genericUtil.getUniqueId();
            });

            productDataToUpdate.form_types = data.form_types;
        } else {
            productDataToUpdate.form_types = [];
        }

        if (data.hasOwnProperty('build_methods')) {
            data.build_methods.forEach((item: any) => {
                item.is_active = true;
                item.user_id = user_id;
                item.created_at = data.updated_at;
                item.unique_id = this.genericUtil.getUniqueId();
            });

            productDataToUpdate.build_methods = data.build_methods;
        } else {
            productDataToUpdate.build_methods = [];
        }

        return productDataToUpdate;
    }

    async filter(data: any, headers: any = null) {
        let where: any = {};

        let pageNumber = 1;
        let pageSize = constants.MAX_PAGED_RECORDS_TO_LOAD;

        if (data.pageNumber) {
            pageNumber = data.pageNumber;
        }
        if (data.pageSize) {
            pageSize = data.pageSize;
        }

        const skip = (pageNumber - 1) * pageSize;

        if (data.hasOwnProperty('is_active')) {
            where.is_active = data.is_active;
        } else {
            where.is_active = true;
        }

        if (data.hasOwnProperty('is_private')) {
            where.is_private = data.is_private;
        }

        if (data.name) {
            where.name = data.name;
        }

        if (data.user_id) {
            where.user_id = new mongoose.Types.ObjectId(data.user_id);
        }

        let sort: any = { 'name': 1 };
        if (data.latest) {
            sort = { 'created_at': -1 };
        }

        const products = await Product.aggregate([
            {
                $match: where
            },
            {
                $sort: sort
            },
            {
                $skip: skip
            },
            {
                $limit: pageSize
            },
            {
                $addFields: {
                    // check if passed user liked the product
                    liked: {
                        $cond: {
                            if: data.user_id,
                            then: {
                                $gt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$likes",
                                                as: "like",
                                                cond: {
                                                    $and: [
                                                        { $eq: ["$$like.is_active", true] },
                                                        { $eq: ["$$like.user_id", new mongoose.Types.ObjectId(data.user_id)] }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    0
                                ]
                            },
                            else: false
                        }
                    },
                    // check if passed user bookmarked the product
                    bookmarked: {
                        $cond: {
                            if: data.user_id,
                            then: {
                                $gt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$bookmarks",
                                                as: "bookmark",
                                                cond: {
                                                    $and: [
                                                        { $eq: ["$$bookmark.is_active", true] },
                                                        { $eq: ["$$bookmark.user_id", new mongoose.Types.ObjectId(data.user_id)] }
                                                    ]
                                                }
                                            }
                                        }
                                    },
                                    0
                                ]
                            },
                            else: false
                        }
                    },
                }
            },
            {
                $project: {
                    // Specify fields to include
                    name: 1, // Example: Including the product name
                    user_id: 1,
                    is_active: 1,
                    is_deleted: 1,
                    is_private: 1,
                    created_at: 1,
                    description: 1,

                    liked: 1,
                    bookmarked: 1,
                    // Filter nested arrays where is_active is true
                    images: {
                        $filter: {
                            input: '$images',
                            as: 'image',
                            cond: {
                                $and: [
                                    { $eq: ['$$image.is_active', true] }
                                ]
                            }
                        }
                    },
                    bookmarkCount: {
                        $size: {
                            $filter: {
                                input: "$bookmarks",
                                as: "bookmark",
                                cond: {
                                    $and: [
                                        { $eq: ["$$bookmark.is_active", true] }
                                    ]
                                }
                            }
                        }
                    },
                    commentCount: {
                        $size: {
                            $filter: {
                                input: "$comments",
                                as: "comment",
                                cond: {
                                    $and: [
                                        { $eq: ["$$comment.is_active", true] }
                                    ]
                                }
                            }
                        }
                    },
                    likeCount: {
                        $size: {
                            $filter: {
                                input: "$likes",
                                as: "likes",
                                cond: {
                                    $and: [
                                        { $eq: ["$$likes.is_active", true] }
                                    ]
                                }
                            }
                        }
                    },
                    tags: {
                        $filter: {
                            input: '$tags',
                            as: 'tag',
                            cond: {
                                $and: [
                                    { $eq: ['$$tag.is_active', true] }
                                ]
                            }
                        }
                    },
                }
            }
        ]);

        return products;
    }

    async getRecentProducts(data: any, headers: any = null) {
        data.latest = true;
        data.is_private = false;

        return await this.filter(data, headers);
    }

    async feed(data: any, headers: any) {
        const user = await this.userService.find(data.user_id, headers);
        if (!user) {
            return []; // User not found
        }

        // Combine following and followers into a single list of unique user IDs
        const relevantUserIds = [...user.following, ...user.followers].filter((value, index, self) => self.indexOf(value) === index);

        // Fetch products created by users in the combined list
        const products = await Product.find({
            user_id: { $in: relevantUserIds }
        }).populate('user_id', 'first_name', 'last_name'); // Example of populating the username of the creator

        return products;
    }

    async getFollowingProducts(data: any, headers: any) {
        const user = await this.userService.find(data.user_id, headers);
        if (!user) {
            return []; // User not found
        }

        // Combine following and followers into a single list of unique user IDs
        const relevantUserIds = [...user.following].filter((value, index, self) => self.indexOf(value) === index);

        // Fetch products created by users in the combined list
        const products = await Product.find({
            user_id: { $in: relevantUserIds },
            is_private: false
        }).populate('user_id', 'first_name', 'last_name'); // Example of populating the username of the creator

        return products;
    }

    async getFollowersProducts(data: any, headers: any) {
        const user = await this.userService.find(data.user_id, headers);
        if (!user) {
            return []; // User not found
        }

        // Combine following and followers into a single list of unique user IDs
        const relevantUserIds = [...user.followers].filter((value, index, self) => self.indexOf(value) === index);

        // Fetch products created by users in the combined list
        const products = await Product.find({
            user_id: { $in: relevantUserIds },
            is_private: false
        }).populate('user_id', 'first_name', 'last_name'); // Example of populating the username of the creator

        return products;
    }

    async getBookmarks(data: any, headers: any) {
        try {
            let pageNumber = 1;
            let pageSize = constants.MAX_PAGED_RECORDS_TO_LOAD;

            if (data.pageNumber) {
                pageNumber = +data.pageNumber;
            }

            if (data.pageSize) {
                pageSize = +data.pageSize;
            }

            const skip = (pageNumber - 1) * pageSize;

            const bookmarksPipeline: any = [
                {
                    $match: { _id: new mongoose.Types.ObjectId(data.id) } // Ensure you match the specific product
                },
                {
                    $unwind: "$bookmarks" // Unwind the bookmarks array
                },
                {
                    $match: { "bookmarks.is_active": true } // Filter only active comments
                },
                // Optional: match specific bookmarks if there are conditions
                {
                    $sort: { "bookmarks.created_at": -1 } // Sort the bookmarks by created_at or any other field
                },
                {
                    $skip: skip // Pagination: skip documents
                },
                {
                    $limit: pageSize // Pagination: limit number of documents
                },
                {
                    $lookup: { // Join with the users collection
                        from: "users", // The collection to join
                        localField: "bookmarks.user_id", // Field from the bookmarks documents
                        foreignField: "_id", // Field from the users documents
                        as: "bookmark_user_info" // The array to put the joined documents
                    }
                },
                {
                    $unwind: "$bookmark_user_info" // Unwind the result to simplify
                },
                {
                    $addFields: { // Add the user_name field
                        "bookmarks.user_name": {
                            $concat: ["$bookmark_user_info.first_name", " ", "$bookmark_user_info.last_name"] // Concatenate first_name and last_name
                        }
                    }
                },
                {
                    $group: { // Group the bookmarks back into a single document
                        _id: "$_id", // Group by the original product ID
                        bookmarks: { $push: "$bookmarks" }, // Push the bookmarks back into an array
                        total: { $sum: 1 } // Count the total bookmarks after filtering and before pagination
                    }
                },
            ];

            return await Product.aggregate(bookmarksPipeline);
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error reading product bookmarks', location: 'product-serv => getBookmarks', error: error.toString() });
            return Promise.reject({
                message: error ? error.toString() : 'Cannot '
            });
        }
    }

    async getComments(data: any, headers: any) {
        try {
            let pageNumber = 1;
            let pageSize = constants.MAX_PAGED_RECORDS_TO_LOAD;

            if (data.pageNumber) {
                pageNumber = +data.pageNumber;
            }

            if (data.pageSize) {
                pageSize = +data.pageSize;
            }

            const skip = (pageNumber - 1) * pageSize;

            const commentsPipeline: any = [
                {
                    $match: { _id: new mongoose.Types.ObjectId(data.id) } // Ensure you match the specific product
                },
                {
                    $unwind: "$comments" // Unwind the comments array
                },
                {
                    $match: { "comments.is_active": true } // Filter only active comments
                },
                // Optional: match specific comments if there are conditions
                {
                    $sort: { "comments.created_at": -1 } // Sort the comments by created_at or any other field
                },
                {
                    $skip: skip // Pagination: skip documents
                },
                {
                    $limit: pageSize // Pagination: limit number of documents
                },
                {
                    $lookup: {
                        from: "users", // The collection to join
                        localField: "comments.user_id", // Field from the comments documents
                        foreignField: "_id", // Field from the users documents
                        as: "comment_user_info" // The array to put the joined documents
                    }
                },
                {
                    $unwind: "$comment_user_info" // Unwind the result to simplify
                },
                {
                    $addFields: { // Add the user_name field
                        "comments.user_name": {
                            $concat: ["$comment_user_info.first_name", " ", "$comment_user_info.last_name"] // Concatenate first_name and last_name
                        }
                    }
                },
                {
                    $group: { // Group the comments back into a single document
                        _id: "$_id", // Group by the original product ID
                        comments: { $push: "$comments" }, // Push the comments back into an array
                        total: { $sum: 1 } // Count the total comments after filtering and before pagination
                    }
                },
            ];

            return await Product.aggregate(commentsPipeline);
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error reading product comments', location: 'product-serv => getComments', error: error.toString() });
            return Promise.reject({
                message: error ? error.toString() : 'Cannot read product comments'
            });
        }
    }

    async hasLiked(data: any, headers: any) {
        try {
            let product = await Product.findOne({
                _id: new mongoose.Types.ObjectId(data.product_id),
                likes: {
                    $elemMatch: {
                        user_id: new mongoose.Types.ObjectId(headers.loggeduserid)
                    }
                }
            });

            if (product) {
                return {
                    data: true
                };
            } else {
                return {
                    data: false
                };
            }
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error in checking liked product', location: 'product-serv => hasLiked', error: error.toString() });
            return Promise.reject({
                message: error ? error.toString() : 'Cannot check liked'
            });
        }
    }

    async hasBookmarked(data: any, headers: any) {
        try {
            let product = await Product.findOne({
                _id: new mongoose.Types.ObjectId(data.product_id),
                bookmarks: {
                    $elemMatch: {
                        user_id: new mongoose.Types.ObjectId(headers.loggeduserid)
                    }
                }
            });

            if (product) {
                return {
                    data: true
                };
            } else {
                return {
                    data: false
                };
            }
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error in checking bookmarked product', location: 'product-serv => hasBookmarked', error: error.toString() });
            return Promise.reject({
                message: error ? error.toString() : 'Cannot check bookmarked'
            });
        }
    }

    async getLikes(data: any, headers: any) {
        try {
            let pageNumber = 1;
            let pageSize = constants.MAX_PAGED_RECORDS_TO_LOAD;

            if (data.pageNumber) {
                pageNumber = +data.pageNumber;
            }

            if (data.pageSize) {
                pageSize = +data.pageSize;
            }

            const skip = (pageNumber - 1) * pageSize;

            const likesPipeline: any = [
                {
                    $match: { _id: new mongoose.Types.ObjectId(data.id) } // Ensure you match the specific product
                },
                {
                    $unwind: "$likes" // Unwind the likes array
                },
                {
                    $match: { "likes.is_active": true } // Filter only active comments
                },
                {
                    $sort: { "likes.created_at": -1 } // Sort the likes by created_at or any other field
                },
                {
                    $skip: skip // Pagination: skip documents
                },
                {
                    $limit: pageSize // Pagination: limit number of documents
                },
                {
                    $lookup: { // Join with the users collection
                        from: "users", // The collection to join
                        localField: "likes.user_id", // Field from the likes documents
                        foreignField: "_id", // Field from the users documents
                        as: "like_user_info" // The array to put the joined documents
                    }
                },
                {
                    $unwind: "$like_user_info" // Unwind the result to simplify
                },
                {
                    $addFields: { // Add the user_name field
                        "likes.user_name": {
                            $concat: ["$like_user_info.first_name", " ", "$like_user_info.last_name"] // Concatenate first_name and last_name
                        }
                    }
                },
                // Optional: match specific likes if there are conditions
                {
                    $group: { // Group the likes back into a single document
                        _id: "$_id", // Group by the original product ID
                        likes: { $push: "$likes" }, // Push the likes back into an array
                        total: { $sum: 1 } // Count the total likes after filtering and before pagination
                    }
                },
            ];

            return await Product.aggregate(likesPipeline);
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error reading product likes', location: 'product-serv => getLikes', error: error.toString() });
            return Promise.reject({
                message: error ? error.toString() : 'Cannot read product likes'
            });
        }
    }

    async remove(id: string, headers: any = null) {
        try {
            await Product.deleteOne({ _id: id });
            return {
                success: true
            };
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error in removing product', location: 'product-serv => remove', error: error.toString() });
            return Promise.reject({
                message: error ? error.toString() : 'Cannot remove product'
            });
        }
    }

    async addImages(data: any, headers: any = null) {
        if (!data.images || data.images.length == 0) {
            return Promise.reject(new AppError('Image not uploaded', 'product-serv => addImages', constants.HTTP_STATUS.BAD_REQUEST));
        }

        let product: any = await Product.findById({ _id: new mongoose.Types.ObjectId(data.product_id) });

        if (product && data.images) {
            try {
                for (let image of data.images) {
                    await this.uploadImage(image, product._id);
                }

                return {
                    success: true
                };
            } catch (error) {
                LoggerUtil.log('error', { message: 'Error in adding product image:' + error?.toString(), 'location': 'product-sev => addImages' });
                return Promise.reject({
                    message: error ? error : 'Error in adding product image'
                });
            }
        } else {
            return null;
        }
    }

    async uploadImage(image: any, productId: string) {
        let file_name = image.file_name;
        let saved_file_name = this.dateUtil.getCurrentEpoch() + "_" + file_name;

        let fileContent = Buffer.from(image.base64, 'base64');
        let uploadResponse: any = await this.awsS3Service.uploadFile('product-image/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

        if (uploadResponse) {
            let productImage: IProductImage = {
                name: image.name,
                file_name: file_name,
                file_type: image.file_type,
                description: image.description,
                file_extension: image.extension,
                saved_file_name: saved_file_name,

                tags: [],
                likes: [],
                ratings: [],
                comments: [],
                bookmarks: [],

                created_at: image.created_at,
                updated_at: null,
                is_active: true,
                is_default: false,
                is_deleted: false,
                unique_id: this.genericUtil.getUniqueId()
            };

            const result: any = await Product.updateOne(
                { _id: new mongoose.Types.ObjectId(productId) },
                {
                    $push: {
                        images: productImage
                    }
                }
            );

            LoggerUtil.log('info', { message: `${result.nModified} image added.` });
        }
    }

    async addTagToProduct(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result: any = await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id)
                    },
                    {
                        $push: {
                            tags: {
                                name: data.name,
                                is_active: true,
                                is_deleted: false,
                                created_at: data.created_at
                            }
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in adding tag to product'
            });
        }
    }

    async removeTagFromProduct(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result: any = await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id)
                    },
                    {
                        $pull: {
                            tags: {
                                _id: data.tag_id
                            }
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    error: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in removing tag from product'
            });
        }
    }

    async addLike(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result: any = await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id)
                    },
                    {
                        $push: {
                            likes: {
                                is_active: true,
                                is_deleted: false,
                                created_at: data.created_at,
                                user_id: headers.loggeduserid
                            }
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in adding like'
            });
        }
    }

    async removeLike(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result = await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id),
                    },
                    [{
                        $set: {
                            likes: {
                                $map: {
                                    input: "$likes",
                                    as: "like",
                                    in: {
                                        $cond: {
                                            if: {
                                                $and: [
                                                    { $eq: ["$$like.is_active", true] },
                                                    { $eq: ["$$like.user_id", new mongoose.Types.ObjectId(headers.loggeduserid)] }
                                                ]
                                            },
                                            then: {
                                                $mergeObjects: [
                                                    "$$like",
                                                    {
                                                        is_deleted: true,
                                                        is_active: false,
                                                        updated_at: data.updated_at
                                                    }
                                                ]
                                            },
                                            else: "$$like"
                                        }
                                    }
                                }
                            }
                        }
                    }]
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in removing like'
            });
        }
    }

    async addComment(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result: any = await Product.updateOne(
                    { _id: new mongoose.Types.ObjectId(data.product_id) },
                    {
                        $push: {
                            comments: {
                                is_active: true,
                                is_deleted: false,
                                comment: data.comment,
                                created_at: data.created_at,
                                user_id: headers.loggeduserid
                            }
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in adding comment'
            });
        }
    }

    async updateComment(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result: any = await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id),
                        "comments._id": new mongoose.Types.ObjectId(data.comment_id)
                    },
                    {
                        $set: {
                            "comments.$.comment": data.comment,
                            "comments.$.updated_at": data.updated_at
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in updating comment'
            });
        }
    }

    async removeComment(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result: any = await Product.updateOne(
                    {
                        "comments.is_active": true,
                        _id: new mongoose.Types.ObjectId(data.product_id),
                        "comments._id": new mongoose.Types.ObjectId(data.comment_id)
                    },
                    {
                        $set: {
                            "comments.$.is_deleted": true,
                            "comments.$.is_active": false,
                            "comments.$.updated_at": data.updated_at
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in removing comment'
            });
        }
    }

    async addBookmark(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result: any = await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id)
                    },
                    {
                        $push: {
                            bookmarks: {
                                is_active: true,
                                is_deleted: false,
                                created_at: data.created_at,
                                user_id: headers.loggeduserid
                            }
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in adding bookmark'
            });
        }
    }

    async removeBookmark(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                let result: any = await Product.updateOne(
                    {
                        "bookmarks.is_active": true,
                        _id: new mongoose.Types.ObjectId(data.product_id),
                        "bookmarks.user_id": new mongoose.Types.ObjectId(headers.loggeduserid)
                    },
                    {
                        $set: {
                            "bookmarks.$.is_deleted": true,
                            "bookmarks.$.is_active": false,
                            "bookmarks.$.updated_at": data.updated_at
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in removing bookmark'
            });
        }
    }

    async setDefaultImage(data: any, headers: any) {
        try {
            let product: any = await this.find(data.product_id, headers);

            if (product) {
                await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id)
                    },
                    {
                        $set: {
                            "images.$[].is_default": false
                        }
                    }
                );

                let result: any = await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id),
                        "images._id": new mongoose.Types.ObjectId(data.image_id)
                    },
                    {
                        $set: {
                            "images.$.is_default": true,
                            "images.$.updated_at": data.updated_at
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err.toString() : 'Error in set default image'
            });
        }
    }

    async removeImage(data: any, headers: any) {
        try {
            let product: any = await Product.findOne({
                _id: new mongoose.Types.ObjectId(data.product_id)
            });

            if (product) {
                let result: any = await Product.updateOne(
                    {
                        _id: new mongoose.Types.ObjectId(data.product_id),
                        "images._id": new mongoose.Types.ObjectId(data.image_id)
                    },
                    {
                        $set: {
                            "images.$.is_deleted": true,
                            "images.$.is_active": false,
                            "images.$.updated_at": data.updated_at
                        }
                    }
                );

                if (result && result.modifiedCount == 1) {
                    return {
                        success: true
                    };
                } else {
                    return {
                        success: false
                    };
                }
            } else {
                return Promise.reject({
                    message: 'Invalid product'
                });
            }
        } catch (err) {
            return Promise.reject({
                message: err ? err : 'Error in removing image'
            });
        }
    }
}