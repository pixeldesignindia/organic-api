import { User, IUser, IPasswordReset } from '../models/user';

import * as path from 'path';
import config from '../config/app-config';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';

import AwsS3Service from './aws-s3-serv';
import { RoleService } from './role-serv';
import { EmailService } from './email-serv';
import { DateUtil } from '../utils/date-util';
import { FileUtil } from '../utils/file-util';
import { LoggerUtil } from '../utils/logger-util';
import { GenericUtil } from '../utils/generic-util';
import { EncryptionUtil } from '../utils/encryption-util';
import mongoose from 'mongoose';

export class UserService {
    private dateUtil: DateUtil;
    private fileUtil: FileUtil;
    private genericUtil: GenericUtil;
    private encryptionUtil: EncryptionUtil;

    private roleService: RoleService;
    private emailService: EmailService;
    private awsS3Service: AwsS3Service;

    constructor() {
        this.dateUtil = new DateUtil();
        this.fileUtil = new FileUtil();
        this.genericUtil = new GenericUtil();
        this.encryptionUtil = new EncryptionUtil();

        this.roleService = new RoleService();
        this.awsS3Service = new AwsS3Service();
        this.emailService = new EmailService();
    }

    async find(id: string, headers: any = null) {
        let user: any = await User.findById({ _id: id });

        delete user.password;

        return user;
    }

    async findOne(filter: any, headers: any) {
        return await User.findOne(filter);
    }

    async register(data: any, headers: any = null) {
        if (!data.email) {
            return Promise.reject({
                error: true,
                message: 'Email not provided'
            });
        }

        let result: any = await this.isDuplicateUser(data.email, data.mobile, false, null);
       
        if (!result.duplicate) {
            let createdUser: any;
            try {
                createdUser = await this.createUser(data, headers);
                console.log(createdUser)
            } catch (err) {
                return Promise.reject({
                    error: true,
                    message: 'Cannot register user'
                });
            }

            try {
                await this.sendVerificationEmail(createdUser);
            } catch (err) {
            }

            return {
                success: true
            };
        } else {
            return {
                isDuplicate: true,
                message: result.message
            };
        }
    }

    async createUser(data: any, headers: any) {
        let user = new User();

        let password;
        if (data.password)
            password = data.password;
        else
            password = config.DEFAULT_USER_PASSWORD;

        if (data.email) {
            user.email = data.email;
            user.username = data.email;
        }

        if (data.mobile) {
            user.mobile = data.mobile;
            user.username = data.mobile;
        }

        if (data.fcm_token)
            user.fcm_token = data.fcm_token;

        user.is_active = true;
        user.gender = data.gender;
        user.last_name = data.last_name;
        user.first_name = data.first_name;
        user.user_type = constants.USER_TYPES.USER;
        user.unique_id = this.genericUtil.getUniqueId();
        user.role_id = await this.roleService.getCustomerRoleId();
        user.password = this.encryptionUtil.encryptWithBcrypt(password);

        if (data.imageFile) {
            let file_name = data.image.file_name;
            let saved_file_name = this.dateUtil.getCurrentEpoch() + "_" + file_name;

            let fileContent = Buffer.from(data.image.base64, 'base64');
            let uploadResponse: any = await this.awsS3Service.uploadFile('user-image/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

            if (uploadResponse) {
                user.image_file = saved_file_name;
            } else {
                user.image_file = constants.DEFAULTS.USER_IMAGE;
            }
        }

        try {
            return await User.create(user);
        } catch (err) {
            return Promise.reject({
                error: true,
                message: err ? err.toString() : '-'
            });
        }
    }

    async isDuplicateUser(email: string, mobile: string, forUpdate: boolean, id: any) {
        return new Promise(async (resolve, reject) => {
            let user: any = null;

            if (email && mobile) {
                user = await User.findOne({
                    $or: [
                        { email: email },
                        { mobile: mobile }
                    ],
                    _id: { $ne: id } // Exclude the current user from the check
                });
            }
            else if (email) {
                user = await User.findOne({
                    $or: [
                        { email: email }
                    ],
                    _id: { $ne: id } // Exclude the current user from the check
                });
            }
            else if (mobile) {
                user = await User.findOne({
                    $or: [
                        { mobile: mobile }
                    ],
                    _id: { $ne: id } // Exclude the current user from the check
                });
            }

            if (user) {
                if (user.email == email) {
                    // resolve({
                    //     duplicate: true,
                    //     message: 'Duplicate email'
                    // });
                    return reject(new AppError("Duplicate Email",null, 400));
                } else if (user.mobile == mobile) {
                    resolve({
                        duplicate: true,
                        message: 'Duplicate mobile'
                    });
                } else {
                    resolve({
                        duplicate: true,
                        message: 'Invalid'
                    });
                }
            } else {
                resolve({
                    duplicate: false
                });
            }
        });
    }

    async resetPassword(data: any, headers: any) {
        let user: any = await this.find(data.id, headers);

        if (user) {
            if (this.encryptionUtil.verifyWithBcrypt(data.old_password, user.password)) {
                await this.update(data.id, { password: data.new_password });
                return Promise.resolve({
                    success: true
                });
            } else {
                return Promise.resolve({
                    success: false,
                    message: constants.MESSAGES.ERRORS.OLD_PASSWORD_MISMATCH
                });
            }
        } else {
            return Promise.reject({
                error: true,
                message: constants.MESSAGES.ERRORS.NOT_FOUND
            });
        }
    }

    async update(id: any, data: any, headers: any = null) {
        let user = await this.find(id);

        if (user) {
            let userDataToUpdate: any = this.getUpdatedUser(data);

            // Remove temporary loaded role object
            delete user.role;

            if (data.hasOwnProperty('password')) {
                userDataToUpdate.password = this.encryptionUtil.encryptWithBcrypt(data.password);
            }

            let result: any = await this.isDuplicateUser(user.email, user.mobile, true, id);
            if (result.duplicate) {
                return {
                    isDuplicate: true,
                    message: result.message
                };
            }

            return await User.updateOne({ _id: id }, userDataToUpdate);
        } else {
            return Promise.reject({
                error: true,
                message: constants.MESSAGES.ERRORS.NOT_FOUND
            });
        }
    }

    async addFollowing(data: any, headers: any = null) {
        let followedUser = await this.find(data.followed_user_id, headers);
        let followingUser = await this.find(data.following_user_id, headers);

        if (!followedUser) {
            return Promise.reject({
                error: true,
                message: constants.MESSAGES.ERRORS.FOLLOWED_USER_NOT_FOUND
            });
        }

        if (!followingUser) {
            return Promise.reject({
                error: true,
                message: constants.MESSAGES.ERRORS.FOLLOWING_USER_NOT_FOUND
            });
        }

        const followerExists = await User.findOne({ _id: data.followed_user_id, 'followers.user_id': data.following_user_id });
        const followedExists = await User.findOne({ _id: data.following_user_id, 'following.user_id': data.followed_user_id });
        if (followerExists || followedExists) {
            return Promise.reject({
                error: true,
                message: constants.MESSAGES.ERRORS.FOLLOWER_DATA_ERROR
            });
        }

        const followingEntry: any = {
            is_active: true,
            updated_at: null,
            is_deleted: false,
            created_at: data.created_at,
            user_id: data.followed_user_id,
            unique_id: this.genericUtil.getUniqueId()
        };

        const followerEntry: any = {
            is_active: true,
            updated_at: null,
            is_deleted: false,
            created_at: data.created_at,
            user_id: data.following_user_id,
            unique_id: this.genericUtil.getUniqueId()
        };

        // add entry to following 
        await User.updateOne(
            { _id: data.following_user_id },
            { $push: { following: followingEntry } }
        );

        // add entry as follower
        await User.updateOne(
            { _id: data.followed_user_id },
            { $push: { followers: followerEntry } }
        );

        return {
            success: true
        };
    }

    async removeFollowing(data: any, headers: any = null) {
        try {
            // Mark following as inactive and deleted for the follower's document
            await User.updateOne(
                { _id: data.following_user_id, "following.user_id": data.followed_user_id, is_active: true },
                { $set: { "following.$.is_active": false, "following.$.is_deleted": true } }
            );

            // Mark follower as inactive and deleted for the followed user's document
            await User.updateOne(
                { _id: data.followed_user_id, "followers.user_id": data.following_user_id, is_active: true },
                { $set: { "followers.$.is_active": false, "followers.$.is_deleted": true } }
            );

            return {
                success: true,
                message: "Successfully updated the following/follower status."
            };
        } catch (error) {
            console.error("Error updating following/follower status:", error);
            return Promise.reject({
                error: true,
                message: "Failed to update the following/follower status."
            });
        }
    }

    async getFollowing(data: any, headers: any) {
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

            const pipeline: any = [
                {
                    $match: { _id: new mongoose.Types.ObjectId(data.id) } // Ensure you match the specific product
                },
                {
                    $unwind: "$following" // Unwind the bookmarks array
                },
                {
                    $match: { "following.is_active": true } // Filter only active comments
                },
                // Optional: match specific bookmarks if there are conditions
                {
                    $sort: { "following.created_at": -1 } // Sort the bookmarks by created_at or any other field
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
                        localField: "following.user_id", // Field from the bookmarks documents
                        foreignField: "_id", // Field from the users documents
                        as: "following_user_info" // The array to put the joined documents
                    }
                },
                {
                    $unwind: "$following_user_info" // Unwind the result to simplify
                },
                {
                    $addFields: { // Add the user_name field
                        "following.user_name": {
                            $concat: ["$following_user_info.first_name", " ", "$following_user_info.last_name"] // Concatenate first_name and last_name
                        }
                    }
                },
                {
                    $group: { // Group the following back into a single document
                        _id: "$_id", // Group by the original product ID
                        following: { $push: "$following" }, // Push the bookmarks back into an array
                        total: { $sum: 1 } // Count the total bookmarks after filtering and before pagination
                    }
                },
            ];

            return await User.aggregate(pipeline);
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error reading user following', location: 'user-serv => getFollowing', error: error.toString() });
            return Promise.reject({
                message: error ? error.toString() : 'Cannot '
            });
        }
    }

    async getFollowers(data: any, headers: any) {
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

            const pipeline: any = [
                {
                    $match: { _id: new mongoose.Types.ObjectId(data.id) } // Ensure you match the specific product
                },
                {
                    $unwind: "$followers" // Unwind the bookmarks array
                },
                {
                    $match: { "followers.is_active": true } // Filter only active comments
                },
                // Optional: match specific bookmarks if there are conditions
                {
                    $sort: { "followers.created_at": -1 } // Sort the bookmarks by created_at or any other field
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
                        localField: "followers.user_id", // Field from the bookmarks documents
                        foreignField: "_id", // Field from the users documents
                        as: "follower_user_info" // The array to put the joined documents
                    }
                },
                {
                    $unwind: "$follower_user_info" // Unwind the result to simplify
                },
                {
                    $addFields: { // Add the user_name field
                        "followers.user_name": {
                            $concat: ["$follower_user_info.first_name", " ", "$follower_user_info.last_name"] // Concatenate first_name and last_name
                        }
                    }
                },
                {
                    $group: { // Group the following back into a single document
                        _id: "$_id", // Group by the original follower ID
                        followers: { $push: "$followers" }, // Push the follower back into an array
                        total: { $sum: 1 } // Count the total after filtering and before pagination
                    }
                },
            ];

            return await User.aggregate(pipeline);
        } catch (error: any) {
            LoggerUtil.log('error', { message: 'Error reading user followers', location: 'user-serv => getFollowers', error: error.toString() });
            return Promise.reject({
                message: error ? error.toString() : 'Cannot '
            });
        }
    }

    getUpdatedUser(data: any) {
        let userDataToUpdate: any = {};

        if (data.hasOwnProperty('pin')) userDataToUpdate.pin = data.pin;
        if (data.hasOwnProperty('email')) userDataToUpdate.email = data.email;
        if (data.hasOwnProperty('phone')) userDataToUpdate.mobile = data.mobile;
        if (data.hasOwnProperty('gender')) userDataToUpdate.gender = data.gender;
        if (data.hasOwnProperty('role_id')) userDataToUpdate.role_id = data.role_id;
        if (data.hasOwnProperty('username')) userDataToUpdate.username = data.username;
        if (data.hasOwnProperty('fcm_token')) userDataToUpdate.fcm_token = data.fcm_token;
        if (data.hasOwnProperty('last_name')) userDataToUpdate.last_name = data.last_name;
        if (data.hasOwnProperty('user_type')) userDataToUpdate.user_type = data.user_type;
        if (data.hasOwnProperty('first_name')) userDataToUpdate.first_name = data.first_name;
        if (data.hasOwnProperty('is_test_account')) userDataToUpdate.is_test_account = data.is_test_account;

        if (data.hasOwnProperty('is_active')) userDataToUpdate.is_active = data.is_active;
        if (data.hasOwnProperty('is_deleted')) userDataToUpdate.is_deleted = data.is_deleted;

        return userDataToUpdate;
    }

    async updateImage(data: any, headers: any = null) {
        if (!data.image) {
            return Promise.reject(new AppError('Image not uploaded', 'user-serv => updateImage', constants.HTTP_STATUS.BAD_REQUEST));
        }

        let user: any = User.findById({ _id: data.user_id });

        if (user) {
            if (data.image) {
                let file_name = data.image.file_name;
                let saved_file_name = this.dateUtil.getCurrentEpoch() + "_" + file_name;

                let fileContent = Buffer.from(data.image.base64, 'base64');
                let uploadResponse: any = await this.awsS3Service.uploadFile('user-image/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

                if (uploadResponse) {
                    try {
                        await User.updateOne({ _id: data.user_id }, { image_file: saved_file_name });

                        LoggerUtil.log('info', { message: `User image added.` });

                        return {
                            success: true
                        };
                    } catch (error) {
                        LoggerUtil.log('error', { message: 'Error in adding user image:' + error?.toString(), 'location': 'user-sev => updateImage' });
                        return {
                            error: true,
                            success: false,
                            message: error ? error.toString() : null
                        };
                    }
                } else {
                    return {
                        error: true,
                        success: false,
                        message: 'Could not upload image to storage'
                    };
                }
            } else {
                return {
                    error: true,
                    success: false,
                    message: 'Image not provided'
                };
            }
        } else {
            return null;
        }
    }

    async filter(data: any, headers: any = null) {
        let where: any = {};

        if (data.hasOwnProperty('is_active'))
            where.is_active = data.is_active;

        if (data.user_type)
            where.user_type = data.user_type;
        else
            where.user_type = { '$in': [constants.USER_TYPES.ADMINISTRATOR, constants.USER_TYPES.USER] };

        return await User.find(where);
    }

    async forgotPassword(data: any, headers: any = null) {
        let user = await this.findOne({ email: data.email }, headers);

        if (user) {
            try {
                let token: string = await this.storeForgotPassword(user);

                try {
                    await this.sendForgotPasswordEmail(user, token);
                } catch (err) {
                    LoggerUtil.log('error', { message: 'Cannot send forgot password email', location: 'user-serv => forgotPassword' });
                }

                return {
                    success: true,
                    message: constants.MESSAGES.FORGOT_PASSWORD_EMAIL_SENT
                };
            } catch (err) {
                return Promise.reject({
                    error: err,
                    success: false,
                    message: constants.MESSAGES.FORGOT_PASSWORD_EMAIL_FAILED
                });
            }
        } else {
            return null;
        }
    }

    async storeForgotPassword(user: any): Promise<string> {
        user.password_resets.forEach((reset: IPasswordReset) => {
            reset.is_active = false;
        });

        let token: string = this.genericUtil.getUniqueId();

        const newPasswordReset: IPasswordReset = {
            is_active: true,
            created_at: new Date(),
            forgot_password_token: token,
            expiry_date: Date.now() + constants.PASSWORD_EXPIRY_TIME_HOUR
        };

        user.password_resets.push(newPasswordReset);

        await user.save();

        return token;
    }

    async verifyForgotPassword(data: any, headers: any = null) {
        const user = await User.findOne({
            is_active: true,
            "password_resets.forgot_password_token": data.t,
            "password_resets.expiry_date": { $gt: new Date() }
        });

        if (user) {
            return {
                success: true
            };
        } else {
            return {
                success: false,
                message: constants.MESSAGES.INVALID_RESET_TOKEN
            };
        }
    }

    async sendVerificationEmail(user: any) {
        if (config.DOMAIN_URL) {
            let data: any = {};

            let rootPath = path.normalize(__dirname + '/..');
            let templatePath = rootPath + '/views/email/' + constants.TEMPLATES.WELCOME_EMAIL;
            let templateContentBuffer = this.fileUtil.readFile(templatePath);
            let templateContent = templateContentBuffer.toString()

            templateContent = templateContent.replace('{NAME}', user.first_name);

            let link = config.DOMAIN_URL;
            templateContent = templateContent.replace('{LINK}', link);

            data.email = user.email;
            data.body = templateContent;

            await this.emailService.sendForgotPasswordEmail(data, constants.SUBJECTS.FORGOT_PASSWORD);
        } else {
            LoggerUtil.log('error', { message: 'Domain not specified for reset password link', location: 'user-serv => sendForgotPasswordEmail' });
        }
    }

    async sendForgotPasswordEmail(user: any, forgotPasswordToken: string) {
        if (config.DOMAIN_URL) {
            let data: any = {};

            let rootPath = path.normalize(__dirname + '/..');
            let templatePath = rootPath + '/views/email/' + constants.TEMPLATES.FORGOT_PASSWORD;
            let templateContentBuffer = this.fileUtil.readFile(templatePath);

            let link = config.DOMAIN_URL + '/reset-password/' + forgotPasswordToken;
            let templateContent = templateContentBuffer.toString().replace('{LINK}', link);

            data.email = user.email;
            data.body = templateContent;

            await this.emailService.sendForgotPasswordEmail(data, constants.SUBJECTS.FORGOT_PASSWORD);
        } else {
            LoggerUtil.log('error', { message: 'Domain not specified for reset password link', location: 'user-serv => sendForgotPasswordEmail' });
        }
    }

    async remove(id: any, headers: any = null) {
        return await User.deleteOne({ _id: id });
    }
}