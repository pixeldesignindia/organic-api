import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { LoginService } from '../services/login-serv';

export default class LoginController extends BaseController {
    constructor() {
        super(new LoginService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.LOGIN, (req, res) => { this.login(req, res, this) });
        this.router.post(constants.API.V1 + constants.API.APP.RESET_PASSWORD, (req, res) => { this.resetPassword(req, res, this) });
        this.router.post(constants.API.V1 + constants.API.APP.FORGOT_PASSWORD, (req, res) => { this.forgotPassword(req, res, this) });
        this.router.get(constants.API.V1 + constants.API.APP.VERIFY_FORGOT_PASSWORD, (req, res) => { this.verifyForgotPassword(req, res, this) });
    }

    private login(req: Request, res: Response, that: any) {
        that.service.login(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in user login', location: 'login-ctrl => userLogin', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'login-ctrl', methodName: 'userLogin' }, err.httpStatusCode);
        });
    }

    private otpLogin(req: Request, res: Response, that: any) {
        that.service.otpLogin(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in otp login', location: 'login-ctrl => otpLogin', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'login-ctrl', methodName: 'otpLogin' }, err.httpStatusCode);
        });
    }

    private verifyUserLogin(req: Request, res: Response, that: any) {
        that.service.verifyUserLogin(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in verifying user login', location: 'login-ctrl => verifyUserLogin', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'login-ctrl', methodName: 'verifyUserLogin' }, err.httpStatusCode);
        });
    }

    private forgotPassword(req: Request, res: Response, that: any) {
        that.service.forgotPassword(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in forgot password', location: 'login-ctrl => forgotPassword', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'login-ctrl', methodName: 'forgotPassword' }, err.httpStatusCode);
        });
    }

    private resetPassword(req: Request, res: Response, that: any) {
        that.service.resetPassword(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in reset password', location: 'login-ctrl => resetPassword', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'login-ctrl', methodName: 'resetPassword' }, err.httpStatusCode);
        });
    }

    private verifyForgotPassword(req: Request, res: Response, that: any) {
        that.service.verifyForgotPassword(req.query, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in forgot password', location: 'login-ctrl => verifyForgotPassword', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'login-ctrl', methodName: 'verifyForgotPassword' }, err.httpStatusCode);
        });
    }
}