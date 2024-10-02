import { Request, Response } from 'express'; 
import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import RazorpayService from '../services/razorpay-serv';

export default class RazorpayController extends BaseController {
    constructor() {
        super(new RazorpayService());
        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/razorpay/create-order', (req, res) => {
            this.createRazorpayOrder(req, res, this);
        });
        this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/razorpay/verify-signature', (req, res) => {
            this.verifyRazorpaySignature(req, res, this);
        });
    }

    private createRazorpayOrder(req: Request, res: Response, that: any) {
        that.service.createRazorpayOrder(req.body).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in creating Razorpay order', location: 'razorpay-ctrl => createOrder', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'razorpay-ctrl', methodName: 'createOrder' }, 500);
        });
    }

    private verifyRazorpaySignature(req: Request, res: Response, that: any) {
        that.service.verifyRazorpaySignature(req.body).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in verifying Razorpay signature', location: 'razorpay-ctrl => verifySignature', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'razorpay-ctrl', methodName: 'verifySignature' }, 500);
        });
    }
}
