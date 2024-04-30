import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { CartService } from '../services/cart-serv';

export class CartController extends BaseController {
	constructor() {
		super(new CartService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.CART, (req, res) => {
			this.createRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.CART , (req, res) => {
			this.findRecord(req, res, this);
		});
		
		this.router.delete(constants.API.V1 + constants.API.APP.CART+ '/:id', (req, res) => {
			this.removeRecord(req, res, this);
		});
		
	}

	private createRecord(req: Request, res: Response, that: any) {
		that.service.addToCart(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				constants.error(err);
				LoggerUtil.log('error', { message: 'Error in creating role', location: 'crud-ctrl => create', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'create' }, 200);
			}
		);
	}
	private findRecord(req: Request, res: Response, that: any) {
		that.service.find( req.headers).then(
			(result: any) => {
				if (result) {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
				} else {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
				}
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding role', location: 'crud-ctrl => find', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'find' }, 200);
			}
		);
	}

	

	private removeRecord(req: Request, res: Response, that: any) {
		that.service.removeCartItem(req.params.productId, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing role', location: 'crud-ctrl => remove', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'remove' }, 200);
			}
		);
	}
}

export default CartController;
