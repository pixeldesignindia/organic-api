import AwsS3Service from './aws-s3-serv';
import { BaseService } from './base-serv';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';

import { FAQ, IFaq } from '../models/faq';

export class FAQService extends BaseService {
	private awsS3Service: AwsS3Service;
	constructor() {
		super(FAQ);
		this.awsS3Service = new AwsS3Service();
	}
	async find(id: string, headers: any = null) {
		try {
			const faq = await FAQ.findById(id);
			if (!faq) {
				throw new AppError('faq not found', null, 404);
			}
			return faq;
		} catch (error) {
			throw new AppError('Error finding faq', error, 500);
		}
	}
	async findAll(data: any, headers: any = null) {
		try {
			// Fetch the latest 5 banners, sorted by creation date in descending order
			const banners = await FAQ.find().sort({ createdAt: -1 })
			if (!banners || banners.length === 0) {
				throw new AppError('No faqs found', null, 404);
			}
			return banners;
		} catch (error) {
			throw new AppError('Error finding banners', error, 500);
		}
	}

	async create(data: any, headers: any = null) {
		try {
			const faq = new FAQ();
			faq.is_active = true;
			faq.answer = data.answer;
			faq.question = data.question;

			return await FAQ.create(faq);
		} catch (error) {
			return error;
		}
	}

	async update(id: any, data: any, headers: any = null) {
		try {
			const faq = await this.find(id);

			if (faq) {
				const faqToUpdate = this.getUpdatedFaq(faq, data);
				await FAQ.updateOne({ _id: id }, faqToUpdate);
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

	getUpdatedFaq(faq: IFaq, data: any) {
		const updatedFaq: any = {};

		if (faq.hasOwnProperty('answer') && data.hasOwnProperty('answer')) {
			updatedFaq.answer = data.answer;
		}
		if (faq.hasOwnProperty('question') && data.hasOwnProperty('question')) {
			updatedFaq.question = data.question;
		}
		

		if (faq.hasOwnProperty('is_active') && data.hasOwnProperty('is_active')) {
			updatedFaq.is_active = data.is_active;
		}
		if (faq.hasOwnProperty('is_deleted') && data.hasOwnProperty('is_deleted')) {
			updatedFaq.is_deleted = data.is_deleted;
		}

		return updatedFaq;
	}

	async delete(id: string, headers: any = null) {
		try {
			const faq = await FAQ.findByIdAndDelete(id);
			if (!faq) {
				throw new AppError('faq not found', null, 404);
			}
			return faq;
		} catch (error) {
			throw new AppError('Error deleting faq', error, 500);
		}
	}

}