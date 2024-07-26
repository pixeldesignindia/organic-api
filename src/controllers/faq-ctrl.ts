import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { FAQService } from '../services/faq-serv';


export class FAQController extends BaseController {
	constructor() {
		super(new FAQService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.FAQ, (req, res) => {
			this.createRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.FAQ+ '/:id', (req, res) => {
			this.findRecord(req, res, this);
		});
		this.router.put(constants.API.V1 + constants.API.APP.FAQ + '/:id', (req, res) => {
			this.updateRecord(req, res, this);
		});
		this.router.delete(constants.API.V1 + constants.API.APP.FAQ + '/:id', (req, res) => {
			this.removeRecord(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.FAQ+'/find', (req, res) => {
			this.findAllRecords(req, res, this);
		});
	
	}

	private createRecord(req: Request, res: Response, that: any) {
		that.service.create(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				constants.error(err);
				LoggerUtil.log('error', { message: 'Error in creating role', location: 'banner-ctrl => create', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'banner-ctrl', methodName: 'create' }, 200);
			}
		);
	}

	private findAllRecords(req: Request, res: Response, that: any) {
		that.service.findAll( req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in filtering roles', location: 'banner-ctrl => filter', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'banner-ctrl', methodName: 'filter' }, 200);
			}
		);
	}

	private findRecord(req: Request, res: Response, that: any) {
		that.service.find(req.params.id, req.headers).then(
			(result: any) => {
				if (result) {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
				} else {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
				}
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding role', location: 'banner-ctrl => find', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'banner-ctrl', methodName: 'find' }, 200);
			}
		);
	}

	private updateRecord(req: Request, res: Response, that: any) {
		that.service.update(req.params.id, req.body, req.headers).then(
			(result: any) => {
				if (result) {
					that.responseUtil.sendUpdateResponse(req, res, result, constants.HTTP_STATUS.UPDATED);
				} else {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
				}
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in updating role', location: 'banner-ctrl => update', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'banner-ctrl', methodName: 'update' }, 200);
			}
		);
	}

	private removeRecord(req: Request, res: Response, that: any) {
		that.service.delete(req.params.id, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing role', location: 'banner-ctrl => remove', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'banner-ctrl', methodName: 'remove' }, 200);
			}
		);
	}
}

export default FAQController;
