import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { UserService } from '../services/user-serv';

export default class RegistrationController extends BaseController {
    constructor() {
        super(new UserService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.REGISTER, (req, res) => {this.register(req, res, this) });
        this.router.post(constants.API.V1 + constants.API.APP.REGISTER + '/verify', (req, res) => { this.verifyUserRegistration(req, res, this) });
    }

    private register(req: Request, res: Response, that: any) {
        that.service.register(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in user registration', location: 'registration-ctrl => register', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'registration-ctrl', methodName: 'register' }, err.httpStatusCode);
        });
    }

    private verifyUserRegistration(req: Request, res: Response, that: any) {
        that.service.verifyUserRegistration(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in verifying user registration', location: 'registration-ctrl => verifyUserRegistration', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'registration-ctrl', methodName: 'verifyUserRegistration' }, err.httpStatusCode);
        });
    }
}