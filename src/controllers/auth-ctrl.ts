import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { AuthService } from '../services/auth-serv';

export default class AuthController extends BaseController {
    constructor() {
        super(new AuthService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.AUTH + '/refresh', (req, res) => { this.getRefreshToken(req, res, this) });
    }

    private getRefreshToken(req: Request, res: Response, that: any) {
        that.service.getRefreshToken(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in generating refresh token', location: 'auth-ctrl => getRefreshToken' });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'auth-ctrl', methodName: 'getRefreshToken' }, 200);
        });
    }
}