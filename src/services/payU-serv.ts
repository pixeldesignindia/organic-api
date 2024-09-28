import axios from 'axios';
import { LoggerUtil } from '../utils/logger-util';
import { Order } from '../models/order';

class PayUService {
	private merchantKey: string;
	private merchantSalt: string;
	private payUBaseUrl: string;

	constructor() {
		// These would come from environment variables or config files
		this.merchantKey = process.env.PAYU_MERCHANT_KEY;
		this.merchantSalt = process.env.PAYU_MERCHANT_SALT;
		this.payUBaseUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in'; // Use PayU test URL for development
	}

	/**
	 * @function initiatePayment
	 * @param paymentData
	 * @param userDetails
	 * Initiates a payment request to PayU
	 */
	public async initiatePayment(paymentData: any, userDetails: any): Promise<any> {
		try {
			const postData = this.buildPaymentData(paymentData, userDetails);
			const response = await axios.post(`${this.payUBaseUrl}/_payment`, postData, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});
			return response.data;
		} catch (error) {
			LoggerUtil.log('error', { message: 'Error in PayU payment initiation', error });
			throw new Error('Payment initiation failed');
		}
	}

	/**
	 * @function handleCallback
	 * @param callbackData
	 * Processes PayU callback data
	 */
	public async handleCallback(callbackData: any): Promise<any> {
		try {
			const isValid = this.validatePayment(callbackData);
			if (!isValid) {
				throw new Error('Invalid payment callback data');
			}
			// Process the callback data and return the status (success/failure)
			return callbackData;
		} catch (error) {
			LoggerUtil.log('error', { message: 'Error in handling PayU callback', error });
			throw new Error('Payment callback handling failed');
		}
	}
	async handlePaymentFailure(orderId: string, transactionId: string) {
		try {
			// Update the order status to FAILED
			await Order.updateOne({ orderId: orderId }, { status: 'FAILED', paymentStatus: 'FAILED' });

			// Optionally, notify the user about the payment failure
			// sendNotificationToUser(orderId, failureReason); // Implement notification logic here

			return { success: true, message: 'Order status updated to FAILED' };
		} catch (error) {
			throw new Error('Failed to update order status: ' + error.message);
		}
	}

	/**
	 * @function buildPaymentData
	 * Constructs the data payload to send to PayU for initiating a payment
	 */
	private buildPaymentData(paymentData: any, userDetails: any): any {
		const hashString = `${this.merchantKey}|${paymentData.transactionId}|${paymentData.amount}|${paymentData.productInfo}|${userDetails.firstName}|${userDetails.email}|||||||||||${this.merchantSalt}`;
		const hash = this.hashFunction(hashString);

		return {
			key: this.merchantKey,
			txnid: paymentData.transactionId,
			amount: paymentData.amount,
			orderId: paymentData.orderId,
			firstname: userDetails.firstName,
			email: userDetails.email,
			phone: userDetails.phone,
			surl: process.env.PAYU_SUCCESS_URL, // Success URL
			furl: process.env.PAYU_FAILURE_URL, // Failure URL
			hash,
		};
	}

	/**
	 * @function validatePayment
	 * Verifies if the callback data from PayU is valid
	 */
	private validatePayment(callbackData: any): boolean {
		const hashString = `${this.merchantSalt}|${callbackData.status}|||||||||||${callbackData.email}|${callbackData.firstname}|${callbackData.productinfo}|${callbackData.amount}|${callbackData.txnid}|${this.merchantKey}`;
		const hash = this.hashFunction(hashString);
		return hash === callbackData.hash;
	}

	/**
	 * @function hashFunction
	 * Utility function to generate the hash (SHA-512)
	 */
	private hashFunction(data: string): string {
		const crypto = require('crypto');
		return crypto.createHash('sha512').update(data).digest('hex');
	}
}

export default new PayUService();
