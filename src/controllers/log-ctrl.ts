import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { LogService } from '../services/log-serv';

export default class LogController extends BaseController {
    constructor() {
        super(new LogService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.LOG + '/filter', (req, res) => { this.readLogs(req, res, this) });
    }

    private readLogs(req: Request, res: Response, that: any) {
        that.service.readLogs(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in reading logs', location: 'log-ctrl => readLogs', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'log-ctrl', methodName: 'readLogs' }, 200);
        });
    }
}