import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { UserService } from '../services/user-serv';

export default class UserController extends BaseController {
	constructor() {
		super(new UserService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.put(constants.API.V1 + constants.API.APP.USER + '/update/:id', (req, res) => {
			this.getUpdate(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.USER + '/followers', (req, res) => {
			this.getFollowers(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.USER + '/following', (req, res) => {
			this.getFollowing(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.USER + '/update-image', (req, res) => {
			this.updateImage(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.USER + '/add-following', (req, res) => {
			this.addFollowing(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.USER + '/remove-following', (req, res) => {
			this.removeFollowing(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.USER + '/shippingUser', (req, res) => {
			this.shippingUserByVender(req, res, this);
		});
	}
	private getUpdate(req: Request, res: Response, that: any) {
		that.service.update(req.params.id, req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding image', location: 'user-ctrl => updateImage', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'user-ctrl', methodName: 'updateImage' }, 200);
			}
		);
	}

	private updateImage(req: Request, res: Response, that: any) {
		that.service.updateImage(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding image', location: 'user-ctrl => updateImage', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'user-ctrl', methodName: 'updateImage' }, 200);
			}
		);
	}

	private addFollowing(req: Request, res: Response, that: any) {
		that.service.addFollowing(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding following', location: 'user-ctrl => addFollowing', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'user-ctrl', methodName: 'addFollowing' }, 200);
			}
		);
	}

	private removeFollowing(req: Request, res: Response, that: any) {
		that.service.removeFollowing(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing following', location: 'user-ctrl => removeFollowing', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'user-ctrl', methodName: 'removeFollowing' }, 200);
			}
		);
	}

	private getFollowers(req: Request, res: Response, that: any) {
		that.service.getFollowers(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting followers', location: 'user-ctrl => getFollowers', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'user-ctrl', methodName: 'getFollowers' }, 200);
			}
		);
	}

	private getFollowing(req: Request, res: Response, that: any) {
		that.service.getFollowing(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting following', location: 'user-ctrl => getFollowing', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'user-ctrl', methodName: 'getFollowing' }, 200);
			}
		);
	}
	private shippingUserByVender(req: Request, res: Response, that: any) {
		that.service.venderShippingUser(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting VenderShipping User', location: 'user-ctrl => shippingUserByVender', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'user-ctrl', methodName: 'shippingUserByVender' }, 200);
			}
		);
	}
}