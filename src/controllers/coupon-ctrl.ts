import { Request, Response } from 'express';
import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { CouponService } from '../services/coupon-serv';

export default class CouponController extends BaseController {
	constructor() {
		super(new CouponService());

		this.initializeRoutes();
	}

	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.COUPON, (req, res) => {
			this.storeRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.COUPON, (req, res) => {
			this.findRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.COUPON + '/filter', (req, res) => {
			this.findAllRecord(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.COUPON + '/check', (req, res) => {
			this.checkRecord(req, res, this);
		});
		this.router.put(constants.API.V1 + constants.API.APP.COUPON + '/update', (req, res) => {
			this.updateRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.COUPON + '/category/:categoryId', (req, res) => {
			this.findByCategory(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.COUPON + '/product/:productId', (req, res) => {
			this.findByProduct(req, res, this);
		});
	}

	private storeRecord(req: Request, res: Response, that: any) {
		that.service.store(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in store couponCode', location: 'coupon-ctrl => storeRecord', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'coupon-ctrl', methodName: 'storeRecord' }, 200);
			}
		);
	}

	private findRecord(req: Request, res: Response, that: any) {
		that.service.find(req.query, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding coupon detail', location: 'coupon-ctrl => findRecord', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'coupon-ctrl', methodName: 'findRecord' }, 200);
			}
		);
	}

	private findAllRecord(req: Request, res: Response, that: any) {
		that.service.findAll(req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding all coupon detail', location: 'coupon-ctrl => findAllRecord', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'coupon-ctrl', methodName: 'findAllRecord' }, 200);
			}
		);
	}

	private checkRecord(req: Request, res: Response, that: any) {
		that.service.isCouponExpired(req.body.code).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in checking coupon expire', location: 'coupon-ctrl => checkRecord', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'coupon-ctrl', methodName: 'checkRecord' }, 200);
			}
		);
	}

	private updateRecord(req: Request, res: Response, that: any) {
		const { id, updates } = req.body;
		that.service.updateCoupon(id, updates).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in updating coupon', location: 'coupon-ctrl => updateRecord', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'coupon-ctrl', methodName: 'updateRecord' }, 200);
			}
		);
	}

	private findByCategory(req: Request, res: Response, that: any) {
		const categoryId = req.params.categoryId;
		that.service.findByCategory(categoryId).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding coupons by category', location: 'coupon-ctrl => findByCategory', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'coupon-ctrl', methodName: 'findByCategory' }, 200);
			}
		);
	}
	private findByProduct(req: Request, res: Response, that: any) {
		that.service.findByProduct(req.params.productId).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding coupons by product', location: 'coupon-ctrl => findByProduct', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'coupon-ctrl', methodName: 'findByProduct' }, 200);
			}
		);
	}
}
