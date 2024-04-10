import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { SummaryService } from '../services/summary-serv';

export class SummaryController extends BaseController {
    constructor() {
        super(new SummaryService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.SUMMARY, (req, res) => { this.getSummary(req, res, this) });
    }

    private getSummary(req: Request, res: Response, that: any) {
        that.service.getSummary(req.body).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in getting summary', location: 'summary-ctrl => find', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'summary-ctrl', methodName: 'find' }, 200);
        });
    }
}

export default SummaryController;