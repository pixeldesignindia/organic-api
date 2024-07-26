
import AwsS3Service from './aws-s3-serv';
import { BaseService } from './base-serv';
import config from '../config/app-config';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { LoggerUtil } from '../utils/logger-util';
import { Intro } from '../models/introduction-video';
import mongoose from 'mongoose';


export class IntroService extends BaseService {
	private awsS3Service: AwsS3Service;
	constructor() {
		super(Intro);
		this.awsS3Service = new AwsS3Service();
	}

	async addVideo(data: any, headers: any = null) {
		if (!data.video) {
			return Promise.reject(new AppError('video not uploaded', 'production-serv => addVideo', constants.HTTP_STATUS.BAD_REQUEST));
		}

		if (data.video) {
			let file_name = data.video.file_name;
			let saved_file_name = this.dateUtil.getCurrentEpoch() + '_' + file_name;

			const base64Data = data.video.base64.replace(/^data:video\/\w+;base64,/, '');
			let fileContent = Buffer.from(base64Data, 'base64');
			let uploadResponse: any = await this.awsS3Service.uploadFile('product-video/' + saved_file_name, fileContent, config.AWS.S3_IMAGE_BUCKET);

			if (uploadResponse) {
				try {
					await Intro.create({ video_file: saved_file_name });

					LoggerUtil.log('info', { message: ` Intro video  added.` });

					return {
						success: true,
					};
				} catch (error) {
					LoggerUtil.log('error', { message: 'Error in adding intro video:' + error?.toString(), location: 'intro-video-sev => Intro video create' });
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
					message: 'Could not upload intro video to storage',
				};
			}
		} else {
			return {
				error: true,
				success: false,
				message: ' video not provided',
			};
		}
	}
	async removeVideo(data: any, headers: any = null) {
		try {
			await Intro.findByIdAndDelete({
				_id: new mongoose.Types.ObjectId(data.intro_id),
			});
			return true;
		} catch (err) {
			LoggerUtil.log('error', { message: 'Error in removing p video: ' + err?.toString(), location: 'product-serv => removeVideo' });
			return Promise.reject({
				message: err ? err.toString() : 'Error in  video',
			});
		}
	}
	async getVideo(data: any, headers: any = null) {
		try {
		return await Intro.findOne();
			 
		} catch (err) {
			LoggerUtil.log('error', { message: 'Error in getting  video: ' + err?.toString(), location: 'product-serv => removeVideo' });
			return Promise.reject({
				message: err ? err.toString() : 'Error in  video',
			});
		}
	}
}