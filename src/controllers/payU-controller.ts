import { Request, Response } from 'express';
import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import PayUService from '../services/payU-serv';
import { PaymentService } from '../services/payment-serv';

export default class PaymentController extends BaseController {
	constructor() {
		super(new PaymentService());
		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes for payment
	 */
	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/hash', (req, res) => {
			this.generatePaymentHash(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/callback', (req, res) => {
			this.handlePaymentCallback(req, res, this);
		});
	}

	/**
	 * @function generatePaymentHash
	 * Generates the hash required for PayU payment from the backend
	 */
	private generatePaymentHash(req: Request, res: Response, that: any) {
		try {
			const paymentData = req.body;
			const hash = PayUService.generatePaymentHash(paymentData);
			that.responseUtil.sendCreateResponse(req, res, { hash }, 200);
		} catch (error) {
			LoggerUtil.log('error', { message: 'Error in generating PayU hash', location: 'payment-ctrl => generatePaymentHash', error });
			that.responseUtil.sendFailureResponse(req, res, error, { fileName: 'payment-ctrl', methodName: 'generatePaymentHash' }, 500);
		}
	}

	/**
	 * @function handlePaymentCallback
	 * Handles the callback response from PayU (success or failure)
	 */
	private handlePaymentCallback(req: Request, res: Response, that: any) {
		const callbackData = req.body;
		const salt = constants.PAYU.SALT;

		if (PayUService.verifyCallbackHash(callbackData, salt)) {
			that.service.updatePaymentStatus(callbackData).then(
				(result: any) => {
					that.responseUtil.sendUpdateResponse(req, res, result, 200);
				},
				(error: any) => {
					LoggerUtil.log('error', { message: 'Error in updating payment status', location: 'payment-ctrl => handlePaymentCallback', error });
					that.responseUtil.sendFailureResponse(req, res, error, { fileName: 'payment-ctrl', methodName: 'handlePaymentCallback' }, 500);
				}
			);
		} else {
			LoggerUtil.log('error', { message: 'Hash verification failed', location: 'payment-ctrl => handlePaymentCallback' });
			that.responseUtil.sendFailureResponse(req, res, 'Hash verification failed', { fileName: 'payment-ctrl', methodName: 'handlePaymentCallback' }, 400);
		}
	}
}
