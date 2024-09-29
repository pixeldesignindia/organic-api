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
        this.router.post(constants.API.V1 + constants.API.APP.PAYMENT + '/hash', (req, res) => { this.readLogs(req, res, this) });
    }

    private readLogs(req: Request, res: Response, that: any) {
        that.service.generatePayUHash(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in generating Hash', location: 'payU-ctrl => generateHash', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'payU-ctrl', methodName: 'post' }, 200);
        });
    }
}