import axios from 'axios';
import crypto from 'crypto';

import { BaseService } from './base-serv';
import config from '../config/app-config';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { LoggerUtil } from '../utils/logger-util';
import { IPayment, Payment } from '../models/payments';

export class PaymentService extends BaseService {
	constructor() {
		super(Payment);
	}

	async find(data: any, headers: any = null) {
		try {
			const payment = await Payment.findById({ transactionId: data.transactionId });
			if (!payment) {
				throw new AppError('payment not found', null, 404);
			}
			return payment;
		} catch (error) {
			throw new AppError('Error finding payment', error, 500);
		}
	}
	async findOne(data: any, headers: any = null) {
		try {
			const payment = await Payment.findOne({ orderId: data.orderId });
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
			const stringToHash = payloadMain + constants.API.V1 + constants.API.APP.PAYMENT + config.PHONEPAY.SALT_KEY;

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
					'X-VERIFY': `${checksum}###${config.PHONEPAY.SALT_INDEX}`,
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
	async refund(data: any, headers: any = null) {
		try {
			// Create the refund payload
			const refundData = {
				merchantId: config.PHONEPAY.SANDBOX_MERCHANT_ID,
				merchantUserId: data.merchantUserId,
				originalTransactionId: data.originalTransactionId,
				merchantTransactionId: this.genericUtil.getUniqueId(), // Unique refund transaction ID
				amount: data.amount,
				callbackUrl: data.callbackUrl,
			};

			// Convert the payload to base64
			const payload = JSON.stringify(refundData);
			const payloadMain = Buffer.from(payload).toString('base64');

			// Construct the string to hash
			const stringToHash = payloadMain + constants.API.V1 + constants.API.APP.REFUND + config.PHONEPAY.SALT_KEY;

			// Generate the checksum
			const SHA256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
			const checksum = SHA256;

			// API URL for PhonePe refund (Sandbox/Production based on config)
			const apiURL = config.PHONEPAY.SANDBOX_MODE ? 'https://api.sandbox.phonepe.com/apis/hermes/refunds/initiate' : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund';

			// Prepare headers for the API request
			const options = {
				method: 'POST',
				url: apiURL,
				headers: {
					accept: 'application/json',
					'Content-Type': 'application/json',
					'X-VERIFY': `${checksum}###${config.PHONEPAY.SALT_INDEX}`,
				},
				data: {
					request: payloadMain,
				},
			};

			// Send the request to the PhonePe API
			const response = await axios.request(options);

			// Handle response and update payment status
			if (response.data.success) {
				// Find the payment record in the database
				const payment = await Payment.findOne({ transactionId: data.originalTransactionId });
				if (!payment) {
					throw new AppError('Original payment not found', null, 404);
				}

				// Update the payment record with the refund details
				payment.status = response.data.data.status;
				payment.refundTransactionId = refundData.merchantTransactionId;

				await payment.save();
			}

			return response.data;
		} catch (error) {
			LoggerUtil.log('error', { message: 'Error processing refund:' + error?.toString(), location: 'PaymentService => refund' });
			throw new AppError('Error processing refund', error, 500);
		}
	}
	public async createPayment(paymentData: any, headers: any): Promise<IPayment> {
		try {
			const payment = new Payment({
				transactionId: paymentData.transactionId,
				orderId: paymentData.orderId,
				merchantId: paymentData.merchantId,
				customerId: paymentData.customerId,
				amount: paymentData.amount,
				status: 'PENDING',
				created_at: new Date(),
				updated_at: new Date(),
			});
			return await payment.save();
		} catch (error) {
			LoggerUtil.log('error', { message: 'Error creating payment', error });
			throw new Error('Payment creation failed');
		}
	}

	/**
	 * @function updatePaymentStatus
	 * Updates the payment status based on the callback from PayU
	 */
	public async updatePaymentStatus(transactionId: string, status: string, callbackData: any): Promise<IPayment | null> {
		try {
			const payment = await Payment.findOne({ transactionId });
			if (!payment) {
				throw new Error('Payment not found');
			}

			payment.status = status;
			payment.updated_at = new Date();

			if (status === 'SUCCESS') {
				payment.refundTransactionId = callbackData.refundTransactionId || null;
			}

			return await payment.save();
		} catch (error) {
			LoggerUtil.log('error', { message: 'Error updating payment status', error });
			throw new Error('Payment update failed');
		}
	}
}
