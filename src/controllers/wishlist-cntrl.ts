import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { WishlistService } from '../services/wishlist-serv';

export class wishlistController extends BaseController {
	constructor() {
		super(new WishlistService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.WISHLIST, (req, res) => {
			this.createRecord(req, res, this);
		});
		this.router.put(constants.API.V1 + constants.API.APP.WISHLIST + '/:id', (req, res) => {
			this.updateRecord(req, res, this);
		});
		this.router.patch(constants.API.V1 + constants.API.APP.WISHLIST + '/:id', (req, res) => {
			this.removeRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.WISHLIST, (req, res) => {
			this.findAllRecord(req, res, this);
		});

		this.router.post(constants.API.V1 + constants.API.APP.WISHLIST + '/move_product', (req, res) => {
			this.moveProduct(req, res, this);
		});
		this.router.delete(constants.API.V1 + constants.API.APP.WISHLIST + '/:id', (req, res) => {
			this.deleteRecord(req, res, this);
		});
        	this.router.get(constants.API.V1 + constants.API.APP.WISHLIST+'/:id', (req, res) => {
				this.findRecords(req, res, this);
			});
	}

	private createRecord(req: Request, res: Response, that: any) {
		that.service.create(req.body, req.headers).then(
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

	private findRecords(req: Request, res: Response, that: any) {
		that.service.find(req.params.id, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in filtering roles', location: 'crud-ctrl => filter', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'filter' }, 200);
			}
		);
	}

	

	private updateRecord(req: Request, res: Response, that: any) {
		that.service.updateWishlist(req.params.id, req.body, req.headers).then(
			(result: any) => {
				if (result) {
					that.responseUtil.sendUpdateResponse(req, res, result, constants.HTTP_STATUS.UPDATED);
				} else {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
				}
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in updating role', location: 'crud-ctrl => update', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'update' }, 200);
			}
		);
	}

	private deleteRecord(req: Request, res: Response, that: any) {
		that.service.delete(req.params.id, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing role', location: 'crud-ctrl => remove', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'remove' }, 200);
			}
		);
	}

	private moveProduct(req: Request, res: Response, that: any) {
		that.service.moveProduct(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in assigning role permission', location: 'role-ctrl => assign', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'role-ctrl', methodName: 'assign' }, 200);
			}
		);
	}
	private removeRecord(req: Request, res: Response, that: any) {
		that.service.removeProduct(req.params.id, req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing role', location: 'crud-ctrl => remove', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'remove' }, 200);
			}
		);
	}
	private findAllRecord(req: Request, res: Response, that: any) {
		that.service.findAll( req.headers).then(
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


export default wishlistController;

