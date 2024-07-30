import axios from 'axios';
import crypto from 'crypto';

import { BaseService } from './base-serv';
import config from '../config/app-config';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { LoggerUtil } from '../utils/logger-util';
import { Payment } from '../models/payments';

export class BannerService extends BaseService {
	constructor() {
		super(Payment);
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
			// Implement your logic to find all banners
		} catch (error) {
			throw new AppError('Error finding payments', error, 500);
		}
	}

	async create(data: any, headers: any = null) {
		try {
			// Create a new Payment instance
			const payment = new Payment();
			payment.merchantId = config.PHONEPAY.SANDBOX_MERCHANT_ID;
			payment.customerId = data.customerId;
			payment.amount = data.amount;
			payment.orderId = data.orderId;
			payment.transactionId = this.genericUtil.getUniqueId();
			payment.created_at = data.created_at;

			// Construct the payment data payload
			const paymentData = {
				merchantId: payment.merchantId,
				merchantTransactionId: payment.transactionId,
				merchantUserId: data.customerId,
				amount: data.amount, // Ensure the amount is passed correctly
				redirectUrl: data.redirectUrl,
				redirectMode: 'REDIRECT',
				mobileNumber: data.phoneNumber,
				paymentInstrument: {
					type: 'PAY_PAGE',
				},
			};

			// Convert the payload to base64
			const payload = JSON.stringify(paymentData);
			const payloadMain = Buffer.from(payload).toString('base64');

			// Construct the string to hash
			const stringToHash = payloadMain + constants.API.V1 + constants.API.APP.PAYMENT + config.PHONEPAY.SANDBOX_API_KEY;

			// Generate the checksum
			const SHA256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
			const checksum = SHA256;

			// API URL for PhonePe (Sandbox/Production based on config)
			const apiURL = config.PHONEPAY.SANDBOX_MODE ? 'https://api.sandbox.phonepe.com/apis/hermes/payments/initiate' : 'https://api.phonepe.com/apis/hermes/payments/initiate';

			// Prepare headers for the API request
			const options = {
				method: 'POST',
				url: apiURL,
				headers: {
					accept: 'application/json',
					'Content-Type': 'application/json',
					'X-VERIFY': `${checksum}###${config.PHONEPAY.SANDBOX_API_KEYINDEX}`,
				},
				data: {
					request: payloadMain,
				},
			};

			const response = await axios.request(options);
			await payment.save();
			return response;
		} catch (error) {
			throw new AppError('Error creating payment', error, 500);
		}
	}

	async checkStatus(id: any, data: any, headers: any = null) {
		try {
			const merchantId = data.merchantId;
			const merchantTransactionId = data.merchantTransactionId;
			const stringToHash = `pg/v1/status/${merchantId}/${merchantTransactionId}` + config.PHONEPAY.SANDBOX_API_KEY;
			const SHA256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
			const checksum = SHA256;
			const URL = `${config.PHONEPAY.API_URL}/pg/v1/status/${merchantId}/${merchantTransactionId}`;
			const options = {
				method: 'GET',
				url: URL,
				headers: {
					accept: 'application/json',
					'Content-Type': 'application/json',
					'X-VERIFY': `${checksum}###${config.PHONEPAY.SANDBOX_API_KEYINDEX}`,
					'X-MERCHANT-ID': merchantId,
				},
			};
			const response = await axios.request(options);

			// Find the payment record in the database
			const payment = await Payment.findById(id);
			if (!payment) {
				throw new AppError('Payment not found', null, 404);
			}

			// Update the payment record with the new status
			payment.status = response.data.data.status;
			await payment.save();

			return response.data;
		} catch (error) {
			LoggerUtil.log('error', { message: 'Error checking payment status:' + error?.toString(), location: 'BannerService => checkStatus' });
			throw new AppError('Error checking payment status', error, 500);
		}
	}
}
