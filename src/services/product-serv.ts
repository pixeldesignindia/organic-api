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
						_id: new mongoose.Types.ObjectId(id),
					}, // Match the product by ID
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
													input: '$likes',
													as: 'like',
													cond: {
														$and: [{ $eq: ['$$like.is_active', true] }, { $eq: ['$$like.user_id', new mongoose.Types.ObjectId(headers.loggeduserid)] }],
													},
												},
											},
										},
										0,
									],
								},
								else: false,
							},
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
													input: '$bookmarks',
													as: 'bookmark',
													cond: {
														$and: [{ $eq: ['$$bookmark.is_active', true] }, { $eq: ['$$bookmark.user_id', new mongoose.Types.ObjectId(headers.loggeduserid)] }],
													},
												},
											},
										},
										0,
									],
								},
								else: false,
							},
						},
					},
				},
				{
					$project: {
						skus: 1,
						name: 1,
						liked: 1,
						isGlobal: 1,
						category: 1,
						is_active: 1,
						is_deleted: 1,
						is_private: 1,
						created_at: 1,
						bookmarked: 1,
						deliveredBy: 1,
						description: 1,
						availablePinCode: 1,
						// Filter nested arrays where is_active is true
						images: {
							$filter: {
								input: '$images',
								as: 'image',
								cond: {
									$and: [{ $eq: ['$$image.is_active', true] }],
								},
							},
						},
						bookmarkCount: {
							$size: {
								$filter: {
									input: '$bookmarks',
									as: 'bookmark',
									cond: {
										$and: [{ $eq: ['$$bookmark.is_active', true] }],
									},
								},
							},
						},
						likeCount: {
							$size: {
								$filter: {
									input: '$likes',
									as: 'like',
									cond: {
										$and: [{ $eq: ['$$like.is_active', true] }],
									},
								},
							},
						},
						commentCount: {
							$size: {
								$filter: {
									input: '$comments',
									as: 'comment',
									cond: {
										$and: [{ $eq: ['$$comment.is_active', true] }],
									},
								},
							},
						},
						tags: {
							$filter: {
								input: '$tags',
								as: 'tag',
								cond: {
									$and: [{ $eq: ['$$tag.is_active', true] }],
								},
							},
						},
					},
				},
			]);

			// Since $match is used with an ID, assume at most one document should match
			return products[0]; // Return the first (and presumably only) document
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error reading product', location: 'product-serv => find', error: error.toString() });
			return Promise.reject({
				success: false,
				message: error ? error.toString() : 'Cannot find product',
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
				message: error ? error.toString() : 'Error in finding product',
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
					user_id: data.user_id,
					created_at: data.created_at,
					unique_id: this.genericUtil.getUniqueId(),
				});
			});
		} else {
			product.tags = [];
		}

		if (data.skus && Array.isArray(data.skus) && data.skus.length > 0) {
			product.skus = data.skus.map((skuData: any) => ({
				name: skuData.name,
				size: skuData.size,
				stock: skuData.stock,
				originalPrice: skuData.originalPrice,
				discountPrice: skuData.discountPrice,
				commissionAmount: skuData.commissionAmount,
			}));
		} else {
			return Promise.reject({
				message: constants.MESSAGES.ERRORS.NOT_FOUND,
			});
		}

		if (data.availablePinCode.length === 0) {
			product.isGlobal = true;
			product.availablePinCode = [];
		} else if (Array.isArray(data.availablePinCode)) {
			product.isGlobal = false;
			product.availablePinCode = data.availablePinCode;
		} else {
			return Promise.reject({
				message: 'Invalid available pin code data',
			});
		}

		product.images = [];
		product.is_active = true;
		product.name = data.name;
		product.is_deleted = false;
		product.user_id = data.user_id;
		product.category = data.category;
		product.is_private = data.is_private;
		product.created_at = data.created_at;
		product.description = data.description;
		product.deliveredBy = data.deliveredBy;
		product.unique_id = this.genericUtil.getUniqueId();

		try {
			return await Product.create(product);
		} catch (err) {
			return Promise.reject({
				success: false,
				message: err ? err.toString() : 'Cannot create product',
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
			if (data.skus && Array.isArray(data.skus)) {
				productDataToUpdate.skus = product.skus.map((existingSKU: any) => {
					let updatedSKU = data.skus.find((newSKU: any) => newSKU.name === existingSKU.name);

					if (updatedSKU) {
						// Update existing SKU with new data
						return {
							...existingSKU,
							size: updatedSKU.size,
							stock: updatedSKU.stock,
							updated_at: data.updated_at,
							originalPrice: updatedSKU.originalPrice,
							discountPrice: updatedSKU.discountPrice,
							commissionAmount: updatedSKU.commissionAmount,
						};
					}

					// Return existing SKU if no update found
					return existingSKU;
				});

				// Add new SKUs that are not in the existing list
				data.skus.forEach((newSKU: any) => {
					if (!product.skus.find((existingSKU: any) => existingSKU.name === newSKU.name)) {
						productDataToUpdate.skus.push({
							name: newSKU.name,
							size: newSKU.size,
							stock: newSKU.stock,
							originalPrice: newSKU.originalPrice,
							discountPrice: newSKU.discountPrice,
							commissionAmount: newSKU.commissionAmount,
						});
					}
				});
			}
			if (!Array.isArray(product.availablePinCode)) {
				product.availablePinCode = [];
			}

			if (Array.isArray(data.availablePinCode)) {
				console.log(data.availablePinCode);
				if (data.availablePinCode.length === 0) {
					console.log(true);
					productDataToUpdate.isGlobal = true;
					productDataToUpdate.availablePinCode = [];
				} else {
					productDataToUpdate.isGlobal = false;
					const uniquePinCodes = [...new Set(data.availablePinCode)];
					productDataToUpdate.availablePinCode = product.availablePinCode.filter((pincode: string) => uniquePinCodes.includes(pincode));
					uniquePinCodes.forEach((pincode: string) => {
						if (!productDataToUpdate.availablePinCode.includes(pincode)) {
							productDataToUpdate.availablePinCode.push(pincode);
						}
					});
				}
			} else if (data.hasOwnProperty('availablePinCode')) {
				return Promise.reject({
					message: 'Invalid available pin code data',
				});
			}

			await Product.updateOne({ _id: new mongoose.Types.ObjectId(id) }, productDataToUpdate);
			return {
				success: true,
			};
		} else {
			return Promise.reject({
				message: constants.MESSAGES.ERRORS.NOT_FOUND,
			});
		}
	}

	getUpdatedProduct(data: any, user_id: string) {
		let productDataToUpdate: any = {};
		if (data.hasOwnProperty('name')) productDataToUpdate.name = data.name;
		if (data.hasOwnProperty('is_active')) productDataToUpdate.is_active = data.is_active;
		if (data.hasOwnProperty('isVerified')) productDataToUpdate.isVerified = data.isVerified;
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
					unique_id: this.genericUtil.getUniqueId(),
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
		where.isVerified = true;

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

		if (data.brand) {
			where.brand = data.brand;
		}
		if (data.category) {
			where.category = new mongoose.Types.ObjectId(data.category);
		}

		if (data.user_id) {
			where.user_id = new mongoose.Types.ObjectId(data.user_id);
		}
		if (data.hasOwnProperty('isVerified')) {
			where.isVerified = false;
		}

		let sort: any = { name: 1 };
		if (data.latest) {
			sort = { created_at: -1 };
		}

		const pipeline: any[] = [{ $match: where }, { $unwind: '$skus' }];

		const priceRangeMatch: any = {};
		if (data.minPrice) {
			priceRangeMatch['skus.originalPrice'] = { $gte: parseFloat(data.minPrice) };
		}
		if (data.maxPrice) {
			if (priceRangeMatch['skus.originalPrice']) {
				priceRangeMatch['skus.originalPrice']['$lte'] = parseFloat(data.maxPrice);
			} else {
				priceRangeMatch['skus.originalPrice'] = { $lte: parseFloat(data.maxPrice) };
			}
		}

		console.log(priceRangeMatch);

		if (data.minPrice || data.maxPrice) {
			pipeline.push({ $match: priceRangeMatch });
		}

		pipeline.push(
			{ $sort: sort },
			{ $skip: skip },
			{ $limit: pageSize },
			{
				$group: {
					_id: '$_id',
					brand: { $first: '$brand' },
					name: { $first: '$name' },
					user_id: { $first: '$user_id' },
					made_for: { $first: '$made_for' },
					isGlobal: { $first: '$isGlobal' },
					category: { $first: '$category' },
					description: { $first: '$description' },
					availablePinCode: { $first: '$availablePinCode' },
					product_image_name: { $first: '$product_image_name' },
					product_image_saved_name: { $first: '$product_image_saved_name' },
					deliveredBy: { $first: '$deliveredBy' },
					end_date: { $first: '$end_date' },
					start_date: { $first: '$start_date' },
					isVerified: { $first: '$isVerified' },
					is_private: { $first: '$is_private' },
					liked: { $first: '$liked' },
					bookmarked: { $first: '$bookmarked' },
					slip: { $first: '$slip' },
					template: { $first: '$template' },
					tags: { $first: '$tags' },
					likes: { $first: '$likes' },
					ratings: { $first: '$ratings' },
					comments: { $first: '$comments' },
					bookmarks: { $first: '$bookmarks' },
					images: { $first: '$images' },
					skus: { $push: '$skus' },
				},
			},
			{
				$addFields: {
					liked: {
						$cond: {
							if: data.user_id,
							then: {
								$gt: [
									{
										$size: {
											$filter: {
												input: '$likes',
												as: 'like',
												cond: {
													$and: [{ $eq: ['$$like.is_active', true] }, { $eq: ['$$like.user_id', new mongoose.Types.ObjectId(data.user_id)] }],
												},
											},
										},
									},
									0,
								],
							},
							else: false,
						},
					},
					bookmarked: {
						$cond: {
							if: data.user_id,
							then: {
								$gt: [
									{
										$size: {
											$filter: {
												input: '$bookmarks',
												as: 'bookmark',
												cond: {
													$and: [{ $eq: ['$$bookmark.is_active', true] }, { $eq: ['$$bookmark.user_id', new mongoose.Types.ObjectId(data.user_id)] }],
												},
											},
										},
									},
									0,
								],
							},
							else: false,
						},
					},
				},
			},
			{
				$project: {
					brand: 1,
					name: 1,
					skus: 1,
					user_id: 1,
					isGlobal: 1,
					category: 1,
					is_active: 1,
					isVerified: 1,
					is_deleted: 1,
					is_private: 1,
					created_at: 1,
					deliveredBy: 1,
					description: 1,
					availablePinCode: 1,
					liked: 1,
					bookmarked: 1,
					images: {
						$filter: {
							input: '$images',
							as: 'image',
							cond: {
								$and: [{ $eq: ['$$image.is_active', true] }],
							},
						},
					},
					bookmarkCount: {
						$size: {
							$filter: {
								input: '$bookmarks',
								as: 'bookmark',
								cond: {
									$and: [{ $eq: ['$$bookmark.is_active', true] }],
								},
							},
						},
					},
					commentCount: {
						$size: {
							$filter: {
								input: '$comments',
								as: 'comment',
								cond: {
									$and: [{ $eq: ['$$comment.is_active', true] }],
								},
							},
						},
					},
					likeCount: {
						$size: {
							$filter: {
								input: '$likes',
								as: 'likes',
								cond: {
									$and: [{ $eq: ['$$likes.is_active', true] }],
								},
							},
						},
					},
					tags: {
						$filter: {
							input: '$tags',
							as: 'tag',
							cond: {
								$and: [{ $eq: ['$$tag.is_active', true] }],
							},
						},
					},
				},
			}
		);

		const products = await Product.aggregate(pipeline);
		return products;
	}

	async getRecentProducts(data: any, headers: any = null) {
		data.latest = true;

		return await this.filter(data, headers);
	}
	async getUnVerifiedProducts(data: any, headers: any) {
		data.isVerified = false;
		return await this.filter(data, headers);
	}

	async removeSku(data: any, headers: any) {
		try {
			let product: any = await this.find(data.id, headers);

			if (product) {
				const skuIndex = product.skus.findIndex((sku: any) => sku.name === data.skuName);

				if (skuIndex !== -1) {
					product.skus[skuIndex].is_deleted = true;
					product.skus[skuIndex].updated_at = new Date();

					await Product.updateOne({ _id: new mongoose.Types.ObjectId(data.id) }, { skus: product.skus });

					return {
						success: true,
						message: 'SKU removed successfully.',
					};
				} else {
					return {
						success: false,
						message: 'SKU not found in product.',
					};
				}
			} else {
				return {
					success: false,
					message: 'Product not found.',
				};
			}
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: err ? err.toString() : 'Error removing SKU.',
			};
		}
	}

	async feed(data: any, headers: any) {
		const user = await this.userService.find(data.user_id, headers);
		if (!user) {
			return [];
		}
		const relevantUserIds = [...user.following, ...user.followers].filter((value, index, self) => self.indexOf(value) === index);
		const products = await Product.find({
			user_id: { $in: relevantUserIds },
		}).populate('user_id', 'first_name', 'last_name');

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
			is_private: false,
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
			is_private: false,
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
					$match: { _id: new mongoose.Types.ObjectId(data.id) }, // Ensure you match the specific product
				},
				{
					$unwind: '$bookmarks', // Unwind the bookmarks array
				},
				{
					$match: { 'bookmarks.is_active': true }, // Filter only active comments
				},
				// Optional: match specific bookmarks if there are conditions
				{
					$sort: { 'bookmarks.created_at': -1 }, // Sort the bookmarks by created_at or any other field
				},
				{
					$skip: skip, // Pagination: skip documents
				},
				{
					$limit: pageSize, // Pagination: limit number of documents
				},
				{
					$lookup: {
						// Join with the users collection
						from: 'users', // The collection to join
						localField: 'bookmarks.user_id', // Field from the bookmarks documents
						foreignField: '_id', // Field from the users documents
						as: 'bookmark_user_info', // The array to put the joined documents
					},
				},
				{
					$unwind: '$bookmark_user_info', // Unwind the result to simplify
				},
				{
					$addFields: {
						// Add the user_name field
						'bookmarks.user_name': {
							$concat: ['$bookmark_user_info.first_name', ' ', '$bookmark_user_info.last_name'], // Concatenate first_name and last_name
						},
					},
				},
				{
					$group: {
						// Group the bookmarks back into a single document
						_id: '$_id', // Group by the original product ID
						bookmarks: { $push: '$bookmarks' }, // Push the bookmarks back into an array
						total: { $sum: 1 }, // Count the total bookmarks after filtering and before pagination
					},
				},
			];

			return await Product.aggregate(bookmarksPipeline);
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error reading product bookmarks', location: 'product-serv => getBookmarks', error: error.toString() });
			return Promise.reject({
				message: error ? error.toString() : 'Cannot ',
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
					$match: { _id: new mongoose.Types.ObjectId(data.id) }, // Ensure you match the specific product
				},
				{
					$unwind: '$comments', // Unwind the comments array
				},
				{
					$match: { 'comments.is_active': true }, // Filter only active comments
				},
				// Calculate total review count and average rating for the product
				{
					$group: {
						_id: '$_id', // Group by the original product ID
						totalReviews: { $sum: 1 }, // Count the total reviews
						averageRating: { $avg: '$comments.rating' }, // Calculate the average rating
						comments: { $push: '$comments' }, // Push all comments into an array
					},
				},
				{
					$unwind: '$comments', // Unwind the comments array again for pagination
				},
				{
					$sort: { 'comments.created_at': -1 }, // Sort the comments by created_at or any other field
				},
				{
					$skip: skip, // Pagination: skip documents
				},
				{
					$limit: pageSize, // Pagination: limit number of documents
				},
				{
					$lookup: {
						from: 'users', // The collection to join
						localField: 'comments.user_id', // Field from the comments documents
						foreignField: '_id', // Field from the users documents
						as: 'comment_user_info', // The array to put the joined documents
					},
				},
				{
					$unwind: '$comment_user_info', // Unwind the result to simplify
				},
				{
					$addFields: {
						// Add the user_name field
						'comments.user_name': {
							$concat: ['$comment_user_info.first_name', ' ', '$comment_user_info.last_name'], // Concatenate first_name and last_name
						},
					},
				},
				{
					$group: {
						// Group the comments back into a single document
						_id: '$_id', // Group by the original product ID
						comments: { $push: '$comments' }, // Push the comments back into an array
						totalReviews: { $first: '$totalReviews' }, // Get the total reviews
						averageRating: { $first: '$averageRating' }, // Get the average rating
					},
				},
			];

			return await Product.aggregate(commentsPipeline);
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error reading product comments', location: 'product-serv => getComments', error: error.toString() });
			return Promise.reject({
				message: error ? error.toString() : 'Cannot read product comments',
			});
		}
	}

	async hasLiked(data: any, headers: any) {
		try {
			let product = await Product.findOne({
				_id: new mongoose.Types.ObjectId(data.product_id),
				likes: {
					$elemMatch: {
						user_id: new mongoose.Types.ObjectId(headers.loggeduserid),
					},
				},
			});

			if (product) {
				return {
					data: true,
				};
			} else {
				return {
					data: false,
				};
			}
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error in checking liked product', location: 'product-serv => hasLiked', error: error.toString() });
			return Promise.reject({
				message: error ? error.toString() : 'Cannot check liked',
			});
		}
	}

	async hasBookmarked(data: any, headers: any) {
		try {
			let product = await Product.findOne({
				_id: new mongoose.Types.ObjectId(data.product_id),
				bookmarks: {
					$elemMatch: {
						user_id: new mongoose.Types.ObjectId(headers.loggeduserid),
					},
				},
			});

			if (product) {
				return {
					data: true,
				};
			} else {
				return {
					data: false,
				};
			}
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error in checking bookmarked product', location: 'product-serv => hasBookmarked', error: error.toString() });
			return Promise.reject({
				message: error ? error.toString() : 'Cannot check bookmarked',
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
					$match: { _id: new mongoose.Types.ObjectId(data.id) }, // Ensure you match the specific product
				},
				{
					$unwind: '$likes', // Unwind the likes array
				},
				{
					$match: { 'likes.is_active': true }, // Filter only active comments
				},
				{
					$sort: { 'likes.created_at': -1 }, // Sort the likes by created_at or any other field
				},
				{
					$skip: skip, // Pagination: skip documents
				},
				{
					$limit: pageSize, // Pagination: limit number of documents
				},
				{
					$lookup: {
						// Join with the users collection
						from: 'users', // The collection to join
						localField: 'likes.user_id', // Field from the likes documents
						foreignField: '_id', // Field from the users documents
						as: 'like_user_info', // The array to put the joined documents
					},
				},
				{
					$unwind: '$like_user_info', // Unwind the result to simplify
				},
				{
					$addFields: {
						// Add the user_name field
						'likes.user_name': {
							$concat: ['$like_user_info.first_name', ' ', '$like_user_info.last_name'], // Concatenate first_name and last_name
						},
					},
				},
				// Optional: match specific likes if there are conditions
				{
					$group: {
						// Group the likes back into a single document
						_id: '$_id', // Group by the original product ID
						likes: { $push: '$likes' }, // Push the likes back into an array
						total: { $sum: 1 }, // Count the total likes after filtering and before pagination
					},
				},
			];

			return await Product.aggregate(likesPipeline);
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error reading product likes', location: 'product-serv => getLikes', error: error.toString() });
			return Promise.reject({
				message: error ? error.toString() : 'Cannot read product likes',
			});
		}
	}

	async remove(id: string, headers: any = null) {
		try {
			await Product.deleteOne({ _id: id });
			return {
				success: true,
			};
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error in removing product', location: 'product-serv => remove', error: error.toString() });
			return Promise.reject({
				message: error ? error.toString() : 'Cannot remove product',
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
					success: true,
				};
			} catch (error) {
				LoggerUtil.log('error', { message: 'Error in adding product image:' + error?.toString(), location: 'product-sev => addImages' });
				return Promise.reject({
					message: error ? error : 'Error in adding product image',
				});
			}
		} else {
			return null;
		}
	}

	async uploadImage(image: any, productId: string) {
		let file_name = image.file_name;
		let saved_file_name = this.dateUtil.getCurrentEpoch() + '_' + file_name;

		const base64Data = image.base64.replace(/^data:image\/\w+;base64,/, '');
		let fileContent = Buffer.from(base64Data, 'base64');
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
				unique_id: this.genericUtil.getUniqueId(),
			};

			const result: any = await Product.updateOne(
				{ _id: new mongoose.Types.ObjectId(productId) },
				{
					$push: {
						images: productImage,
					},
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
						_id: new mongoose.Types.ObjectId(data.product_id),
					},
					{
						$push: {
							tags: {
								name: data.name,
								is_active: true,
								is_deleted: false,
								created_at: data.created_at,
							},
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in adding tag to product',
			});
		}
	}

	async removeTagFromProduct(data: any, headers: any) {
		try {
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
					},
					{
						$pull: {
							tags: {
								_id: data.tag_id,
							},
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					error: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in removing tag from product',
			});
		}
	}

	async addLike(data: any, headers: any) {
		try {
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
					},
					{
						$push: {
							likes: {
								is_active: true,
								is_deleted: false,
								created_at: data.created_at,
								user_id: headers.loggeduserid,
							},
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in adding like',
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
					[
						{
							$set: {
								likes: {
									$map: {
										input: '$likes',
										as: 'like',
										in: {
											$cond: {
												if: {
													$and: [{ $eq: ['$$like.is_active', true] }, { $eq: ['$$like.user_id', new mongoose.Types.ObjectId(headers.loggeduserid)] }],
												},
												then: {
													$mergeObjects: [
														'$$like',
														{
															is_deleted: true,
															is_active: false,
															updated_at: data.updated_at,
														},
													],
												},
												else: '$$like',
											},
										},
									},
								},
							},
						},
					]
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in removing like',
			});
		}
	}

	async addComment(data: any, headers: any) {
		try {
			if (!headers.loggeduserid)
				Promise.reject({
					message: 'Invalid product',
				});
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{ _id: new mongoose.Types.ObjectId(data.product_id) },
					{
						$push: {
							comments: {
								is_active: true,
								is_deleted: false,
								rating: data.rating,
								comment: data.comment,
								created_at: data.created_at,
								user_id: headers.loggeduserid,
							},
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in adding comment',
			});
		}
	}

	async updateComment(data: any, headers: any) {
		try {
			let comment;
			if (data.comment) {
				comment = data.comment;
			}

			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
						'comments._id': new mongoose.Types.ObjectId(data.comment_id),
					},
					{
						$set: {
							'comments.$.comment': comment,
							'comments.$.rating': data.rating,

							'comments.$.updated_at': data.updated_at,
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in updating comment',
			});
		}
	}

	async removeComment(data: any, headers: any) {
		try {
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{
						'comments.is_active': true,
						_id: new mongoose.Types.ObjectId(data.product_id),
						'comments._id': new mongoose.Types.ObjectId(data.comment_id),
					},
					{
						$set: {
							'comments.$.is_deleted': true,
							'comments.$.is_active': false,
							'comments.$.updated_at': data.updated_at,
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in removing comment',
			});
		}
	}

	async addBookmark(data: any, headers: any) {
		try {
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
					},
					{
						$push: {
							bookmarks: {
								is_active: true,
								is_deleted: false,
								created_at: data.created_at,
								user_id: headers.loggeduserid,
							},
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in adding bookmark',
			});
		}
	}

	async removeBookmark(data: any, headers: any) {
		try {
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{
						'bookmarks.is_active': true,
						_id: new mongoose.Types.ObjectId(data.product_id),
						'bookmarks.user_id': new mongoose.Types.ObjectId(headers.loggeduserid),
					},
					{
						$set: {
							'bookmarks.$.is_deleted': true,
							'bookmarks.$.is_active': false,
							'bookmarks.$.updated_at': data.updated_at,
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in removing bookmark',
			});
		}
	}

	async setDefaultImage(data: any, headers: any) {
		try {
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
					},
					{
						$set: {
							'images.$[].is_default': false,
						},
					}
				);

				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
						'images._id': new mongoose.Types.ObjectId(data.image_id),
					},
					{
						$set: {
							'images.$.is_default': true,
							'images.$.updated_at': data.updated_at,
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in set default image',
			});
		}
	}

	async removeImage(data: any, headers: any) {
		try {
			let product: any = await Product.findOne({
				_id: new mongoose.Types.ObjectId(data.product_id),
			});

			if (product) {
				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
						'images._id': new mongoose.Types.ObjectId(data.image_id),
					},
					{
						$set: {
							'images.$.is_deleted': true,
							'images.$.is_active': false,
							'images.$.updated_at': data.updated_at,
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err : 'Error in removing image',
			});
		}
	}

	async addRating(data: any, headers: any) {
		try {
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
					},
					{
						$push: {
							ratings: {
								is_active: true,
								is_deleted: false,
								rating: data.rating,
								created_at: data.created_at,
								user_id: headers.loggeduserid,
							},
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in adding rating',
			});
		}
	}
	async updateRating(data: any, headers: any) {
		try {
			let product: any = await this.find(data.product_id, headers);

			if (product) {
				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
						'ratings._id': new mongoose.Types.ObjectId(data.rating_id),
					},
					{
						$set: {
							'ratings.$.rating': data.rating,
							'ratings.$.updated_at': data.updated_at,
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					return {
						success: true,
					};
				} else {
					return {
						success: false,
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			return Promise.reject({
				message: err ? err.toString() : 'Error in updating rating',
			});
		}
	}
	async hasRating(data: any, headers: any) {
		try {
			let product = await Product.findById({
				_id: new mongoose.Types.ObjectId(data.product_id),
			});
			if (product) {
				const rating = product.ratings.find((rating) => rating.user_id.toString() === headers.loggeduserid.toString());
				if (!rating) {
					return Promise.reject({
						message: 'rating not found',
					});
				}

				return rating;
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error in checking rating product', location: 'product-serv => hasRating', error: error.toString() });
			return Promise.reject({
				message: error ? error.toString() : 'Cannot check rating',
			});
		}
	}
	async getRatings(data: any, headers: any) {
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

			const ratingsPipeline: any = [
				{
					$match: { _id: new mongoose.Types.ObjectId(data.id) }, // Ensure you match the specific product
				},
				{
					$unwind: '$ratings', // Unwind the ratings array
				},
				{
					$match: { 'ratings.is_active': true }, // Filter only active ratings
				},
				{
					$sort: { 'ratings.created_at': -1 }, // Sort the ratings by created_at or any other field
				},
				{
					$skip: skip, // Pagination: skip documents
				},
				{
					$limit: pageSize, // Pagination: limit number of documents
				},
				{
					$lookup: {
						// Join with the users collection
						from: 'users', // The collection to join
						localField: 'ratings.user_id', // Field from the ratings documents
						foreignField: '_id', // Field from the users documents
						as: 'rating_user_info', // The array to put the joined documents
					},
				},
				{
					$unwind: '$rating_user_info', // Unwind the result to simplify
				},
				{
					$addFields: {
						// Add the user_name field
						'ratings.user_name': {
							$concat: ['$rating_user_info.first_name', ' ', '$rating_user_info.last_name'], // Concatenate first_name and last_name
						},
					},
				},
				// Optional: match specific ratings if there are conditions
				{
					$group: {
						// Group the ratings back into a single document
						_id: '$_id', // Group by the original product ID
						ratings: { $push: '$ratings' }, // Push the ratings back into an array
						total: { $sum: 1 }, // Count the total ratings after filtering and before pagination
					},
				},
			];

			return await Product.aggregate(ratingsPipeline);
		} catch (error: any) {
			LoggerUtil.log('error', { message: 'Error reading product ratings', location: 'product-serv => getRatings', error: error.toString() });
			return Promise.reject({
				message: error ? error.toString() : 'Cannot read product ratings',
			});
		}
	}
	async addVideo(data: any, headers: any = null) {
		if (!data.video) {
			return Promise.reject(new AppError('video not uploaded', 'production-serv => addVideo', constants.HTTP_STATUS.BAD_REQUEST));
		}

		let product: any = Product.findById({ _id: data.product_id });

		if (product) {
			if (data.video) {
				let file_name = data.video.file_name;
				let saved_file_name = this.dateUtil.getCurrentEpoch() + '_' + file_name;

				const base64Data = data.video.base64.replace(/^data:video\/\w+;base64,/, '');
				let fileContent = Buffer.from(base64Data, 'base64');
				let uploadResponse: any = await this.awsS3Service.uploadFile('product-video/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

				if (uploadResponse) {
					try {
						await Product.updateOne({ _id: data.product_id }, { video_file: saved_file_name });

						LoggerUtil.log('info', { message: ` product video  added.` });

						return {
							success: true,
						};
					} catch (error) {
						LoggerUtil.log('error', { message: 'Error in adding product video:' + error?.toString(), location: 'user-sev => updateImage' });
						return {
							error: true,
							success: false,
							message: error ? error.toString() : null,
						};
					}
				} else {
					return {
						error: true,
						success: false,
						message: 'Could not upload prodcut video to storage',
					};
				}
			} else {
				return {
					error: true,
					success: false,
					message: 'Product video not provided',
				};
			}
		} else {
			return null;
		}
	}
	async removeVideo(data: any, headers: any = null) {
		try {
			let product: any = await Product.findOne({
				_id: new mongoose.Types.ObjectId(data.product_id),
			});

			if (product) {
				let result: any = await Product.updateOne(
					{
						_id: new mongoose.Types.ObjectId(data.product_id),
					},
					{
						$set: {
							video_file: '', // Set the video_file field to an empty string
							updated_at: data.updated_at, // Update the updated_at field
						},
					}
				);

				if (result && result.modifiedCount == 1) {
					LoggerUtil.log('info', { message: 'Product video removed.' });
					return {
						success: true,
					};
				} else {
					return {
						success: false,
						message: 'Failed to remove product video',
					};
				}
			} else {
				return Promise.reject({
					message: 'Invalid product',
				});
			}
		} catch (err) {
			LoggerUtil.log('error', { message: 'Error in removing product video: ' + err?.toString(), location: 'product-serv => removeVideo' });
			return Promise.reject({
				message: err ? err.toString() : 'Error in removing video',
			});
		}
	}
}