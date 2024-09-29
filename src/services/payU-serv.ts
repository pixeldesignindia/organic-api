import { BaseService } from './base-serv';
import axios from 'axios';
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
			const hash = crypto.createHash('sha512').update(hashString).digest('hex');

			return hash;
		} catch (error) {
			console.error('Error generating PayU hash:', error);
			throw new AppError('Failed to generate PayU hash', null, 500);
		}
	}

	/**
	 * @function initiatePayment
	 * Initiates the payment by sending a request to PayU's API
	 */
	async initiatePayment(data: any) {
		try {
			// Extract necessary data from the request
			const {
				key,
				salt,
				txnid,
				amount,
				email,
				firstname,
				phone,
				productinfo,
				surl,
				furl
			} = data;

			// Generate the hash using the method from the same service
			const hash = await this.generatePayUHash({
				key,
				txnid,
				amount,
				productinfo,
				firstname,
				email,
				salt
			});

			// Send the payment initiation request to PayU
			const response = await axios.post('https://test.payu.in/_payment', {
				key,
				txnid,
				amount,
				email,
				firstname,
				phone,
				productinfo,
				surl,
				furl,
				hash
			});

			// Return PayU's response
			return { success: true, data: response.data };
		} catch (error) {
			console.error('Error initiating payment:', error);
			throw new AppError('Payment initiation failed', null, 500);
		}
	}
}

export default PayUService;
