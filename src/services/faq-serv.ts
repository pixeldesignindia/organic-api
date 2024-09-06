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
			const faqs = await FAQ.find({ is_active: true }).sort({ createAt: -1 });

			return faqs;
		} catch (error) {
			return new AppError('Error finding FAQ', error, 500);
		}
	}

	async create(data: any, headers: any = null) {
		try {
			const faq = new FAQ();
			faq.is_active = true;
			faq.is_deleted = false;
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
				const faqToUpdate = await this.getUpdatedFaq(faq, data);

				await FAQ.updateOne({ _id: id }, faqToUpdate);
				return {
					success: true,
				};
			} else {
				return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}
		} catch (error) {
			return new AppError('Error updating FAQ', error, 500);
		}
	}

	async getUpdatedFaq(faq: IFaq, data: any) {
		const updatedFaq: any = {};

		if (data.hasOwnProperty('answer') && faq.answer !== data.answer) {
			updatedFaq.answer = data.answer;
		}
		if (data.hasOwnProperty('question') && faq.question !== data.question) {
			updatedFaq.question = data.question;
		}
		if (data.hasOwnProperty('is_active') && faq.is_active !== data.is_active) {
			updatedFaq.is_active = data.is_active;
		}

		if (data.hasOwnProperty('is_deleted') && faq.is_deleted !== data.is_deleted) {
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