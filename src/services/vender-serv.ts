import mongoose from 'mongoose';
import { User } from '../models/user';
import { BaseService } from './base-serv';
import { Vender } from '../models/vender';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';


export class VenderService extends BaseService {
	constructor() {
		super(Vender);
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

	async findAll( data:any, headers: any = null) {
          const { queryPageIndex = 1, queryPageSize = constants.MAX_PAGED_RECORDS_TO_LOAD, queryPageFilter, queryPageSortBy = [{ id: '_id', desc: false }] } = data;
		    let where: any = {};
            let sortBy: any= queryPageSortBy[0].id;
			let sortOrder :any= queryPageSortBy[0].desc ? -1 : 1;
            if (queryPageFilter) {
								let searchRegex = new RegExp(queryPageFilter, 'i');
										where = {
											$or: [{ firm_name: searchRegex }],
										};
								}
		try {
			    let getVenders;

					getVenders = await Vender.find(where)
						.populate('user_id')
						.sort({ [sortBy]: sortOrder })
						.limit(parseInt(queryPageSize))
						.skip((parseInt(queryPageIndex) - 1) * parseInt(queryPageSize))
						.exec();
			return getVenders;
		} catch (error) {
			return Promise.reject(new AppError('Error finding vender', error, 500));
		}
	}
	async applyVender(data: any, headers: any = null) {
		try {
			const vender = new Vender();
            vender.GST = data.GST;
			vender.is_active = true;
            vender.city = data.city;
            vender.state = data.state;
            vender.phone = data.phone;
            vender.email = data.email;
            vender.country =data.country;
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

			const  vender= await Vender.findById(id);
			if (!vender) {
				return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			 if (data.status === 'SUCCESS') {
					await User.findOneAndUpdate({ _id: vender.user_id }, { user_type: constants.USER_TYPES.VENDER }, { new: true });
				} else if (data.status === 'REJECTED') {
					await User.findOneAndUpdate({ _id: vender.user_id }, {user_type :constants.USER_TYPES.USER }, { new: true });
				}

				await Vender.findByIdAndUpdate({ _id:id}, { status: data.status }, { new: true });


			return vender;
		} catch (error) {
			console.error(error);
			return Promise.reject(new AppError('Error updating wishlist', error, 500));
		}
	}

	async checkStatus(id: string, headers: any = null) {
		try {
			const applyDetails = await Vender.findOne({ user_id:headers.loggeduserid }).select({ status: 1, id: 1 });
			if (!applyDetails) {
				return Promise.reject(new AppError(' registration data not found', null, 404));
			}
			return applyDetails;
		} catch (error) {
			return Promise.reject(new AppError('Error deleting wishlist', error, 500));
		}
	}
}