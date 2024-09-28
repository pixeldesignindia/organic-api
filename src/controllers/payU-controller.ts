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
		// Route for initiating payment
		this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/initiate', (req, res) => {
			this.initiatePayment(req, res, this);
		});

		// Route for PayU callback
		this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/callback', (req, res) => {
			this.handlePaymentCallback(req, res, this);
		});
	}

	/**
	 * @function initiatePayment
	 * Handles initiating a payment process
	 */
	private initiatePayment(req: Request, res: Response, that: any) {
		that.service.createPayment(req.body, req.headers).then(
			(paymentData: any) => {
				PayUService.initiatePayment(paymentData, req.body.userDetails).then(
					(response: any) => {
						that.responseUtil.sendCreateResponse(req, res, response, 200);
					},
					(error: any) => {
						LoggerUtil.log('error', { message: 'Error in PayU payment initiation', location: 'payment-ctrl => initiatePayment', error });
						that.responseUtil.sendFailureResponse(req, res, error, { fileName: 'payment-ctrl', methodName: 'initiatePayment' }, 500);
					}
				);
			},
			(error: any) => {
				LoggerUtil.log('error', { message: 'Error in creating payment', location: 'payment-ctrl => initiatePayment', error });
				that.responseUtil.sendFailureResponse(req, res, error, { fileName: 'payment-ctrl', methodName: 'initiatePayment' }, 500);
			}
		);
	}

	/**
	 * @function handlePaymentCallback
	 * Handles the callback response from PayU (success or failure)
	 */
	private handlePaymentCallback(req: Request, res: Response, that: any) {
		PayUService.handleCallback(req.body).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(error: any) => {
				LoggerUtil.log('error', { message: 'Error in handling PayU callback', location: 'payment-ctrl => handlePaymentCallback', error });
				that.responseUtil.sendFailureResponse(req, res, error, { fileName: 'payment-ctrl', methodName: 'handlePaymentCallback' }, 500);
			}
		);
	}
}
