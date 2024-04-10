import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { StatusService } from '../services/status-serv';

export class StatusController extends BaseController {
    constructor() {
        super(new StatusService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.get(constants.API.V1 + constants.API.APP.STATUS, (req, res) => { this.getStatus(req, res, this) });
    }

    private getStatus(req: Request, res: Response, that: any) {
        that.service.getStatus().then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in getting status', location: 'status-ctrl => find', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'status-ctrl', methodName: 'find' }, 200);
        });
    }
}

export default StatusController;