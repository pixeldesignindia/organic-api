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

		this.router.get(constants.API.V1 + constants.API.APP.VENDER + '/user/:id', (req, res) => {
			this.findOneRecords(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.VENDER + '/update-image', (req, res) => {
			this.updateImage(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.VENDER + '/:id', (req, res) => {
			this.updateVenderRecord(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.VENDER + '/update-banner', (req, res) => {
			this.updateBannerImage(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.VENDER + '/verified/vender', (req, res) => {
			this.showVenderRecords(req, res, this);
		});
	}

	private createRecord(req: Request, res: Response, that: any) {
		that.service.applyVender(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				constants.error(err);
				LoggerUtil.log('error', { message: 'Error in creating vendor', location: 'vendor-ctrl => create', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vendor-ctrl', methodName: 'create' }, 200);
			}
		);
	}

	private findRecords(req: Request, res: Response, that: any) {
		that.service.find(req.params.id, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding vendor', location: 'vendor-ctrl => find', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vendor-ctrl', methodName: 'find' }, 200);
			}
		);
	}
	private findOneRecords(req: Request, res: Response, that: any) {
		that.service.findByUserId(req.params.id, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in findOne vendor', location: 'vendor-ctrl => findOne', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vendor-ctrl', methodName: 'findOne' }, 200);
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
				LoggerUtil.log('error', { message: 'Error in update vendor', location: 'vender-ctrl => update', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vender-ctrl', methodName: 'update' }, 200);
			}
		);
	}
	private updateVenderRecord(req: Request, res: Response, that: any) {
		
		that.service.update(req.params.id, req.body, req.headers).then(
			(result: any) => {
				if (result) {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
				} else {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
				}
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in update vendor', location: 'vender-ctrl => update vender', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vender-ctrl', methodName: 'post' }, 200);
			}
		);
	}
	private findAllRecord(req: Request, res: Response, that: any) {
		that.service.findAll(req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in find All Vendor', location: 'vender-controller => findAll', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vender-ctrl', methodName: 'findAll' }, 200);
			}
		);
	}
	private checkStatusRecord(req: Request, res: Response, that: any) {
		that.service.checkStatus(req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in checking Status Of Vendor', location: 'vender-ctrl => checkStatusRecord', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vender-ctrl', methodName: 'checkStatusRecord' }, 200);
			}
		);
	}
	private updateImage(req: Request, res: Response, that: any) {
		that.service.updateImage(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding image', location: 'vender-ctrl => updateImage', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vender-ctrl', methodName: 'updateImage' }, 200);
			}
		);
	}
	private updateBannerImage(req: Request, res: Response, that: any) {
		that.service.updateBannerImage(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in adding banner in vender Landing page', location: 'vender-ctrl => updateBannerImage', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vender-ctrl', methodName: 'updateBannerImage' }, 200);
			}
		);
	}
	private showVenderRecords(req: Request, res: Response, that: any) {
		that.service.showVender(req.body,req.headers).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding vendor', location: 'vendor-ctrl => find', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'vendor-ctrl', methodName: 'find' }, 200);
			}
		);
	}
}

export default VenderController;
