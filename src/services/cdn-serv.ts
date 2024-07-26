import config from '../config/app-config';

import AwsS3Service from './aws-s3-serv';
import { BaseService } from './base-serv';

export class CDNService extends BaseService {
	private awsS3Service: AwsS3Service;

	constructor() {
		super();

		this.awsS3Service = new AwsS3Service();
	}

	async getUserImage(data: any, headers: any) {
		data.folder = 'user-image';
		data.bucketName = config.AWS.S3_IMAGE_BUCKET;

		return await this.awsS3Service.getImage(data, headers);
	}
	async getCategoryImage(data: any, headers: any) {
		data.folder = 'category-image';
		data.bucketName = config.AWS.S3_IMAGE_BUCKET;

		return await this.awsS3Service.getImage(data, headers);
	}
	async getBannerImage(data: any, headers: any) {
		data.folder = 'banner-image';
		data.bucketName = config.AWS.S3_IMAGE_BUCKET;

		return await this.awsS3Service.getImage(data, headers);
	}

	async getProductImage(data: any, headers: any) {
		data.folder = 'product-image';
		data.bucketName = config.AWS.S3_IMAGE_BUCKET;

		return await this.awsS3Service.getImage(data, headers);
	}
	async getProductVideo(data: any, headers: any) {
		data.folder = 'product-video';
		data.bucketName = config.AWS.S3_IMAGE_BUCKET;

		return await this.awsS3Service.getImage(data, headers);
	}
}