import AwsS3Service from './aws-s3-serv';
import { BaseService } from './base-serv';
import config from '../config/app-config';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { LoggerUtil } from '../utils/logger-util';
import { BusinessReview, IBusiness } from '../models/Business-Customer-Review';


export class BusinessReviewService extends BaseService {
	private awsS3Service: AwsS3Service;
	constructor() {
		super(BusinessReview);
		this.awsS3Service = new AwsS3Service();
	}
	async find(id: string, headers: any = null) {
		try {
			const business = await BusinessReview.findById(id);
			if (!business) {
				throw new AppError('business not found', null, 404);
			}
			return business;
		} catch (error) {
			throw new AppError('Error finding category', error, 500);
		}
	}
	async findAll(data: any, headers: any = null) {
		try {
			// Fetch the latest 5 banners, sorted by creation date in descending order
			const businessReviews = await BusinessReview.find().sort({ createdAt: -1 }).limit(20);
			if (!businessReviews || businessReviews.length === 0) {
				throw new AppError('No businessReviews found', null, 404);
			}
			return businessReviews;
		} catch (error) {
			throw new AppError('Error finding reviews', error, 500);
		}
	}

	async create(data: any, headers: any = null) {
		try {
			const business = new BusinessReview();
			business.is_active = true;
			business.title = data.title;
			business.founder = data.founder;
			business.description = data.description;
			business.founder_Name = data.founder_Name;

			return await BusinessReview.create(business);
		} catch (error) {
			return error;
		}
	}

	async update(id: any, data: any, headers: any = null) {
		try {
			const business = await this.find(id);

			if (business) {
				const businessToUpdate = this.getUpdatedBusinessReview(business, data);
				await BusinessReview.updateOne({ _id: id }, businessToUpdate);
				return {
					success: true,
				};
			} else {
				return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}
		} catch (error) {
			return new AppError('Error updating category', error, 500);
		}
	}

	getUpdatedBusinessReview(business: IBusiness, data: any) {
		const updateBusiness: any = {};

		if (business.hasOwnProperty('title') && data.hasOwnProperty('title')) {
			updateBusiness.title = data.title;
		}
		if (business.hasOwnProperty('founder') && data.hasOwnProperty('founder')) {
			updateBusiness.founder = data.founder;
		}
		if (business.hasOwnProperty('description') && data.hasOwnProperty('description')) {
			updateBusiness.description = data.description;
		}
        if (business.hasOwnProperty('founder_name') && data.hasOwnProperty('founder_name')) {
					updateBusiness.founder_name = data.founder_name;
				}

		if (business.hasOwnProperty('is_active') && data.hasOwnProperty('is_active')) {
			updateBusiness.is_active = data.is_active;
		}
		if (business.hasOwnProperty('is_deleted') && data.hasOwnProperty('is_deleted')) {
			updateBusiness.is_deleted = data.is_deleted;
		}

		return updateBusiness;
	}

	async delete(id: string, headers: any = null) {
		try {
			const business = await BusinessReview.findByIdAndDelete(id);
			if (!business) {
				throw new AppError('business review not found', null, 404);
			}
			return business;
		} catch (error) {
			throw new AppError('Error deleting business review', error, 500);
		}
	}

	async updateImage(data: any, headers: any = null) {
		if (!data.image) {
			return Promise.reject(new AppError('Image not uploaded', 'business-serv => updateImage', constants.HTTP_STATUS.BAD_REQUEST));
		}

		let business: any = BusinessReview.findById({ _id: data.businessReview_id });

		if (business) {
			if (data.image) {
				let file_name = data.image.file_name;
				let saved_file_name = this.dateUtil.getCurrentEpoch() + '_' + file_name;

				const base64Data = data.image.base64.replace(/^data:image\/\w+;base64,/, '');
				let fileContent = Buffer.from(base64Data, 'base64');
				let uploadResponse: any = await this.awsS3Service.uploadFile('business-image/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

				if (uploadResponse) {
					try {
						await BusinessReview.updateOne({ _id: data.businessReview_id }, { file_name: saved_file_name });

						LoggerUtil.log('info', { message: `business image added.` });

						return {
							success: true,
						};
					} catch (error) {
						LoggerUtil.log('error', { message: 'Error in adding user image:' + error?.toString(), location: 'user-sev => updateImage' });
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
						message: 'Could not upload image to storage',
					};
				}
			} else {
				return {
					error: true,
					success: false,
					message: 'Image not provided',
				};
			}
		} else {
			return null;
		}
	}
}
