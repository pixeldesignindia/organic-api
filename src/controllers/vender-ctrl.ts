import { Request, Response } from 'express';
import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { VenderService } from '../services/vender-serv';

export class VenderController extends BaseController {
	constructor() {
		super(new VenderService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.VENDER, (req, res) => {
			this.createRecord(req, res, this);
		});
		this.router.put(constants.API.V1 + constants.API.APP.VENDER + '/:id', (req, res) => {
			this.updateRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.VENDER, (req, res) => {
			this.findAllRecord(req, res, this);
		});

		this.router.get(constants.API.V1 + constants.API.APP.VENDER + '/:id', (req, res) => {
			this.findRecords(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.VENDER + '/check', (req, res) => {
			this.checkStatusRecord(req, res, this);
		});
	}

	private createRecord(req: Request, res: Response, that: any) {
		that.service.applyVender(req.body, req.headers).then(
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
		that.service.updateVender(req.params.id, req.body, req.headers).then(
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
	private findAllRecord(req: Request, res: Response, that: any) {
		that.service.findAll(req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing role', location: 'crud-ctrl => remove', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'remove' }, 200);
			}
		);
	}
	private checkStatusRecord(req: Request, res: Response, that: any) {
		that.service.checkStatus(req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in filtering roles', location: 'crud-ctrl => filter', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'filter' }, 200);
			}
		);
	}
}

export default VenderController;
