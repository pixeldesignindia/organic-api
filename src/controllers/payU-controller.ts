import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import PayUService from '../services/payU-serv';

export default class LogController extends BaseController {
    constructor() {
        super(new PayUService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/hash', (req, res) => { this.generateHash(req, res, this) });
		this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/initiate', (req, res) => {this.initiatePayment(req, res, this)});
    }

    private generateHash(req: Request, res: Response, that: any) {
        that.service.generatePayUHash(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in generating Hash', location: 'payU-ctrl => generateHash', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'payU-ctrl', methodName: 'post' }, 200);
        });
    }
	private initiatePayment(req: Request, res: Response, that: any) {
		// Call the service to initiate the payment
		that.service.initiatePayment(req.body, req.headers)
			.then((result: any) => {
				// Respond with success
				that.responseUtil.sendReadResponse(req, res, result, 200);
			})
			.catch((err: any) => {
				// Log the error and send a failure response
				LoggerUtil.log('error', {
					message: 'Error initiating payment',
					location: 'payU-ctrl => initiatePayment',
					error: err
				});
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'payU-ctrl', methodName: 'initiate' }, 500);
			});
	}
}