import { Request, Response } from 'express';
import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { PaymentService } from '../services/payment-serv';

export class PaymentController extends BaseController {
	constructor() {
		super(new PaymentService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.PAYMENT, (req, res) => {
			this.createPayment(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.PAYMENT + '/:id', (req, res) => {
			this.findPayment(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.PAYMENT, (req, res) => {
			this.findAllPayments(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/check-status', (req, res) => {
			this.checkPaymentStatus(req, res, this);
		});
	}

	private createPayment(req: Request, res: Response, that: any) {
		that.service.create(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, constants.HTTP_STATUS.OK);
			},
			(err: any) => {
				constants.error(err);
				LoggerUtil.log('error', { message: 'Error in creating payment', location: 'payment-ctrl => createPayment', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'payment-ctrl', methodName: 'createPayment' }, constants.HTTP_STATUS.BAD_REQUEST);
			}
		);
	}

	private findPayment(req: Request, res: Response, that: any) {
		that.service.find(req.params.id, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding payment', location: 'payment-ctrl => findPayment', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'payment-ctrl', methodName: 'findPayment' }, constants.HTTP_STATUS.BAD_REQUEST);
			}
		);
	}

	private findAllPayments(req: Request, res: Response, that: any) {
		that.service.findAll(req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding all payments', location: 'payment-ctrl => findAllPayments', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'payment-ctrl', methodName: 'findAllPayments' }, constants.HTTP_STATUS.BAD_REQUEST);
			}
		);
	}

	private checkPaymentStatus(req: Request, res: Response, that: any) {
		that.service.checkStatus(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in checking payment status', location: 'payment-ctrl => checkPaymentStatus', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'payment-ctrl', methodName: 'checkPaymentStatus' }, constants.HTTP_STATUS.BAD_REQUEST);
			}
		);
	}
}

export default PaymentController;
