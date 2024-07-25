import AwsS3Service from './aws-s3-serv';
import { BaseService } from './base-serv';
import config from '../config/app-config';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { LoggerUtil } from '../utils/logger-util';
import { Banner, IBanner } from '../models/banner';


export class BannerService extends BaseService {
	private awsS3Service: AwsS3Service;
	constructor() {
		super(Banner);
		this.awsS3Service = new AwsS3Service();
	}
	async find(id: string, headers: any = null) {
		try {
			const banner = await Banner.findById(id);
			if (!banner) {
				throw new AppError('banner not found', null, 404);
			}
			return banner;
		} catch (error) {
			throw new AppError('Error finding category', error, 500);
		}
	}
	async findAll(data: any, headers: any = null) {
		try {
			// Fetch the latest 5 banners, sorted by creation date in descending order
			const banners = await Banner.find().sort({ createdAt: -1 }).limit(5);
			if (!banners || banners.length === 0) {
				throw new AppError('No banners found', null, 404);
			}
			return banners;
		} catch (error) {
			throw new AppError('Error finding banners', error, 500);
		}
	}

	async create(data: any, headers: any = null) {
		try {
			const banner = new Banner();
			banner.is_active = true;
			banner.name = data.name;
			banner.link = data.link;
			banner.description = data.description;
			banner.unique_id = this.genericUtil.getUniqueId();

			const checkUniqueness = await Banner.findOne({ name: data.name });
			if (checkUniqueness) {
				throw new AppError(constants.MESSAGES.ERRORS.ALREADY_EXIST, null, 400);
			}

			return await Banner.create(banner);
		} catch (error) {
			return error;
		}
	}

	async update(id: any, data: any, headers: any = null) {
		try {
			const banner = await this.find(id);

			if (banner) {
				const bannerToUpdate = this.getUpdatedBanner(banner, data);
				await Banner.updateOne({ _id: id }, bannerToUpdate);
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

	getUpdatedBanner(banner: IBanner, data: any) {
		const updatedBanner: any = {};

		if (banner.hasOwnProperty('name') && data.hasOwnProperty('name')) {
			updatedBanner.name = data.name;
		}
		if (banner.hasOwnProperty('link') && data.hasOwnProperty('link')) {
			updatedBanner.link = data.link;
		}
		if (banner.hasOwnProperty('description') && data.hasOwnProperty('description')) {
			updatedBanner.description = data.description;
		}

		if (banner.hasOwnProperty('is_active') && data.hasOwnProperty('is_active')) {
			updatedBanner.is_active = data.is_active;
		}
		if (banner.hasOwnProperty('is_deleted') && data.hasOwnProperty('is_deleted')) {
			updatedBanner.is_deleted = data.is_deleted;
		}

		return updatedBanner;
	}

	async delete(id: string, headers: any = null) {
		try {
			const banner = await Banner.findByIdAndDelete(id);
			if (!banner) {
				throw new AppError('banner not found', null, 404);
			}
			return banner;
		} catch (error) {
			throw new AppError('Error deleting banner', error, 500);
		}
	}

	async updateImage(data: any, headers: any = null) {
		if (!data.image) {
			return Promise.reject(new AppError('Image not uploaded', 'banner-serv => updateImage', constants.HTTP_STATUS.BAD_REQUEST));
		}

		let banner: any = Banner.findById({ _id: data.banner_id });

		if (banner) {
			if (data.image) {
				let file_name = data.image.file_name;
				let saved_file_name = this.dateUtil.getCurrentEpoch() + '_' + file_name;

				const base64Data = data.image.base64.replace(/^data:image\/\w+;base64,/, '');
				let fileContent = Buffer.from(base64Data, 'base64');
				let uploadResponse: any = await this.awsS3Service.uploadFile('banner-image/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

				if (uploadResponse) {
					try {
						await Banner.updateOne({ _id: data.categoryId }, { image_file: saved_file_name });

						LoggerUtil.log('info', { message: `banner image added.` });

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
