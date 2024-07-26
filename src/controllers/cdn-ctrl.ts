import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { CDNService } from '../services/cdn-serv';
import { LoggerUtil } from '../utils/logger-util';

export default class CDNController extends BaseController {
	constructor() {
		super(new CDNService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.get(constants.API.V1 + constants.API.APP.CDN + '/user-image/:file', (req, res) => {
			this.getUserImage(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.CDN + '/category-image/:file', (req, res) => {
			this.getCategoryImage(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.CDN + '/product-image/:file', (req, res) => {
			this.getProductImage(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.CDN + '/banner-image/:file', (req, res) => {
			this.getBannerImage(req, res, this);
		});
	}

	private getUserImage(req: Request, res: Response, that: any) {
		this.service.getUserImage(req.params, req.headers).then(
			(result: any) => {
				that.responseUtil.sendTextResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting user image', location: 'cdn-ctrl => getUserImage', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'cdn-ctrl', methodName: 'getUserImage' }, 200);
			}
		);
	}

	private getProductImage(req: Request, res: Response, that: any) {
		this.service.getProductImage(req.params, req.headers).then(
			(result: any) => {
				that.responseUtil.sendTextResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting product image', location: 'cdn-ctrl => getProductImage', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'cdn-ctrl', methodName: 'getProductImage' }, 200);
			}
		);
	}
	private getCategoryImage(req: Request, res: Response, that: any) {
		this.service.getCategoryImage(req.params, req.headers).then(
			(result: any) => {
				that.responseUtil.sendTextResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting user image', location: 'cdn-ctrl => getUserImage', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'cdn-ctrl', methodName: 'getUserImage' }, 200);
			}
		);
	}
	private getBannerImage(req: Request, res: Response, that: any) {
		this.service.getBannerImage(req.params, req.headers).then(
			(result: any) => {
				that.responseUtil.sendTextResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting user image', location: 'cdn-ctrl => getUserImage', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'cdn-ctrl', methodName: 'getUserImage' }, 200);
			}
		);
	}
}