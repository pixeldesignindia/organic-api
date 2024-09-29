import crypto from 'crypto';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';

class PayUService {
	/**
	 * Generates hash using the required parameters for PayU payment
	 * @param paymentData
	 */
	public static generatePaymentHash(paymentData: any): string {
		const { key, txnid, amount, productinfo, firstname, email, salt } = paymentData;

		const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
		LoggerUtil.log('info', { message: 'Generating hash for PayU', data: hashString });

		const hash = crypto.createHash('sha512').update(hashString).digest('hex');
		return hash;
	}

	/**
	 * Verifies the PayU callback hash to ensure it matches with server calculation
	 * @param callbackData
	 */
	public static verifyCallbackHash(callbackData: any, salt: string): boolean {
		const { key, txnid, amount, productinfo, firstname, email, status, hash } = callbackData;
		const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
		const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
		return calculatedHash === hash;
	}
}

export default PayUService;
