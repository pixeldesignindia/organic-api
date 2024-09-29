import { BaseService } from './base-serv';
import crypto from 'crypto';
import { AppError } from '../models/app-error';

export class PayUService extends BaseService {
	constructor() {
		super();
	}

	/**
	 * @function generatePayUHash
	 * Generate the PayU hash string for payment requests.
	 */
	async generatePayUHash(data: any) {
		try {
			// Destructure necessary fields from the data object
			const {
				key,
				txnid,
				amount,
				productinfo,
				firstname,
				email,
				salt
			} = data;

			// Validate the required parameters
			if (!key || !txnid || !amount || !productinfo || !firstname || !email || !salt) {
				throw new AppError('Required payment parameters are missing', null, 400);
			}

			// Generate the hash string using the required fields
			const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;

			// Generate the SHA-512 hash from the hash string
			const hash = crypto.createHash('sha512').update(hashString).digest('hex');

			// Return the hash string as part of the response
			return {
				success: true,
				hash,
				paymentUrl: 'https://secure.payu.in/_payment',
				...data
			};
		} catch (error) {
			// Log the error and throw a custom error message
			console.error('Error generating PayU hash:', error);
			throw new AppError('Failed to generate PayU hash', null, 500);
		}
	}
}

export default PayUService;
