import AwsS3Service from './aws-s3-serv';
import { BaseService } from './base-serv';
import config from '../config/app-config';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { LoggerUtil } from '../utils/logger-util';
import { Payment } from '../models/payments';

export class BannerService extends BaseService {
	private awsS3Service: AwsS3Service;
	constructor() {
		super(Payment);
		this.awsS3Service = new AwsS3Service();
	}
	async find(id: string, headers: any = null) {
		try {
			const payment = await Payment.findById(id);
			if (!payment) {
				throw new AppError('payment not found', null, 404);
			}
			return payment;
		} catch (error) {
			throw new AppError('Error finding payment', error, 500);
		}
	}
	async findAll(data: any, headers: any = null) {
		try {
		
		} catch (error) {
			throw new AppError('Error finding banners', error, 500);
		}
	}

	async create(data: any, headers: any = null) {
		try {
		
		} catch (error) {
			return error;
		}
	}

	async update(id: any, data: any, headers: any = null) {
		try {
		
				
					} catch (error) {
						LoggerUtil.log('error', { message: 'Error in adding user image:' + error?.toString(), location: 'user-sev => updateImage' });
						return {
							error: true,
							success: false,
							message: error ? error.toString() : null,
						};
					}
	}
}
