import mongoose from 'mongoose';
import AwsS3Service from './aws-s3-serv';
import { BaseService } from './base-serv';
import config from '../config/app-config';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { LoggerUtil } from '../utils/logger-util';
import { User } from '../models/user';
import { Vender } from '../models/vender';



export class VenderService extends BaseService {
	private awsS3Service: AwsS3Service;
	constructor() {
		super(Vender);
		this.awsS3Service = new AwsS3Service();
	}

	async find(id: string, headers: any = null) {
		try {
			const vender = await Vender.findById(id).populate('user_id');
			if (!vender) {
				return Promise.reject(new AppError('vender not found', null, 404));
			}
			return vender;
		} catch (error) {
			return Promise.reject(new AppError('Error finding category', error, 500));
		}
	}
	async findByUserId(id: string, headers: any = null) {
		try {
			const vender = await Vender.findOne({ user_id: id }).populate('user_id');
			if (!vender) {
				return Promise.reject(new AppError('vender not found', null, 404));
			}
			return vender;
		} catch (error) {
			return Promise.reject(new AppError('Error finding category', error, 500));
		}
	}

	async findAll(data: any, headers: any = null) {
		const { queryPageIndex = 1, queryPageSize = constants.MAX_PAGED_RECORDS_TO_LOAD, queryPageFilter, queryPageSortBy = [{ id: '_id', desc: false }] ,is_show} = data;
		let where: any = {};
		let sortBy: any = queryPageSortBy[0].id;
		let sortOrder: any = queryPageSortBy[0].desc ? -1 : 1;
		if (queryPageFilter) {
			let searchRegex = new RegExp(queryPageFilter, 'i');
			where = {
				$or: [{ firm_name: searchRegex }],
			};
		}
		 if (is_show !== undefined) {
				where.is_show = is_show;
			}
		try {
			let getVenders;

			getVenders = await Vender.find(where)
				.populate('user_id')
				.sort({ [sortBy]: sortOrder })
				.limit(parseInt(queryPageSize))
				.skip((parseInt(queryPageIndex) - 1) * parseInt(queryPageSize))
				.exec();
			const totalCount = await Vender.countDocuments(where);
			const totalPages = Math.ceil(totalCount / queryPageSize);
			return { getVenders, totalPages, queryPageIndex };
		} catch (error) {
			return Promise.reject(new AppError('Error finding vender', error, 500));
		}
	}
	async showVender (data:any,headers:any =null){
			data.is_show = true;

			return await this.findAll(data, headers);
	}
	async applyVender(data: any, headers: any = null) {
		try {
			const vender = new Vender();
			vender.GST = data.GST;
			vender.is_show = false;
			vender.is_active = true;
			vender.city = data.city;
			vender.state = data.state;
			vender.phone = data.phone;
			vender.email = data.email;
			vender.country = data.country;
			vender.pinCode = data.pinCode;
			vender.firm_name = data.firm_name;
			vender.created_at = data.created_at;
			vender.user_id = headers.loggeduserid;
			vender.firm_address = data.firm_address;
			vender.unique_id = this.genericUtil.getUniqueId();
			const checkUniqueness = await Vender.findOne({ firm_name: data.firm_name });
			if (checkUniqueness) {
				Promise.reject(new AppError(constants.MESSAGES.ERRORS.ALREADY_EXIST, null, 400));
			}

			return await Vender.create(vender);
		} catch (error) {
			return Promise.reject(new AppError('Error Applying vender', error, 500));
		}
	}

	async updateVender(id: string, data: any, headers: any) {
		try {
			if (!id || !data) {
				throw new AppError('Invalid input data', null, 400);
			}

			const vender = await Vender.findById(id);
			if (!vender) {
				return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			if (data.status === 'SUCCESS') {
				await User.findOneAndUpdate({ _id: vender.user_id }, { user_type: constants.USER_TYPES.VENDER, deliveredBy: vender.deliveredBy }, { new: true });
			} else if (data.status === 'REJECTED') {
				await User.findOneAndUpdate({ _id: vender.user_id }, { user_type: constants.USER_TYPES.USER }, { new: true });
			}

			await Vender.findByIdAndUpdate({ _id: id }, { status: data.status }, { new: true });

			return vender;
		} catch (error) {
			console.error(error);
			return Promise.reject(new AppError('Error updating wishlist', error, 500));
		}
	}

	async checkStatus(headers: any = null) {
		try {
			const applyDetails = await Vender.findOne({ user_id: headers.loggeduserid }).select({ status: 1, id: 1 });
			if (!applyDetails) {
				return Promise.reject(new AppError(' registration data not found', null, 404));
			}
			return applyDetails;
		} catch (error) {
			console.log(error);
			return Promise.reject(new AppError('Error checking vendor status', error, 500));
		}
	}
	async updateImage(data: any, headers: any = null) {
		if (!data.image) {
			return Promise.reject(new AppError('Image not uploaded', 'vender-serv => updateImage', constants.HTTP_STATUS.BAD_REQUEST));
		}

		let vender: any = Vender.findById({ _id: data.vender_id });

		if (vender) {
			if (data.image) {
				let file_name = data.image.file_name;
				let saved_file_name = this.dateUtil.getCurrentEpoch() + '_' + file_name;

				const base64Data = data.image.base64.replace(/^data:image\/\w+;base64,/, '');
				let fileContent = Buffer.from(base64Data, 'base64');
				let uploadResponse: any = await this.awsS3Service.uploadFile('vender-image/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

				if (uploadResponse) {
					try {
						await Vender.updateOne({ _id: data.vender_id }, { image_file: saved_file_name });

						LoggerUtil.log('info', { message: `vender logo image added.` });

						return {
							success: true,
						};
					} catch (error) {
						LoggerUtil.log('error', { message: 'Error in adding vender image:' + error?.toString(), location: 'user-sev => updateImage' });
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
	async updateBannerImage(data: any, headers: any = null) {
		if (!data.image) {
			return Promise.reject(new AppError('Image not uploaded', 'vender-serv => updateBannerImage', constants.HTTP_STATUS.BAD_REQUEST));
		}

		let vender: any = Vender.findById({ _id: data.vender_id });

		if (vender) {
			if (data.image) {
				let file_name = data.image.file_name;
				let saved_file_name = this.dateUtil.getCurrentEpoch() + '_' + file_name;

				const base64Data = data.image.base64.replace(/^data:image\/\w+;base64,/, '');
				let fileContent = Buffer.from(base64Data, 'base64');
				let uploadResponse: any = await this.awsS3Service.uploadFile('vender-image/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

				if (uploadResponse) {
					try {
						await Vender.updateOne({ _id: data.vender_id }, { banner_file: saved_file_name });

						LoggerUtil.log('info', { message: `vender logo image added.` });

						return {
							success: true,
						};
					} catch (error) {
						LoggerUtil.log('error', { message: 'Error in adding vender image:' + error?.toString(), location: 'user-sev => updateImage' });
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
	async update(id: any, data: any, headers: any = null) {
		try {
			const vender = await Vender.findById(id);
			if (!vender) {
				return Promise.reject(new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404));
			}

			if (data.city) vender.city = data.city;
			if (data.state) vender.state = data.state;
			if (data.phone) vender.phone = data.phone;
			if (data.email) vender.email = data.email;
			if(data.aboutUs) vender.aboutUs = data.aboutUs;
			if (data.country) vender.country = data.country;
			if (data.pinCode) vender.pinCode = data.pinCode;
			if (data.firm_name) vender.firm_name = data.firm_name;
			if (data.firm_address) vender.firm_address = data.firm_address;

			if (data.hasOwnProperty('is_show')) vender.is_show = data.is_show;
			if (data.hasOwnProperty('is_active')) vender.is_active = data.is_active;

			vender.updated_at = new Date();
			const checkUniqueness = await Vender.findOne({ firm_name: data.firm_name, _id: { $ne: id } });
			if (checkUniqueness) {
				return Promise.reject(new AppError(constants.MESSAGES.ERRORS.ALREADY_EXIST, null, 400));
			}
			return await vender.save();
		} catch (error) {
			return Promise.reject(new AppError('Error updating vendor', error, 500));
		}
	}
}