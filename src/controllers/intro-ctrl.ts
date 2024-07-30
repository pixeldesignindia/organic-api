import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { IntroService } from '../services/Intro-video-serv';

export class IntroController extends BaseController {
	constructor() {
		super(new IntroService());

		this.initializeRoutes();
	}

	/**
	 * @function initializeRoutes
	 * Initializes API routes
	 */
	public initializeRoutes() {
		this.router.post(constants.API.V1 + constants.API.APP.INTRO, (req, res) => {
			this.createRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.INTRO + '/video', (req, res) => {
			this.findRecord(req, res, this);
		});
		
		this.router.delete(constants.API.V1 + constants.API.APP.INTRO + '/delete', (req, res) => {
			this.removeRecord(req, res, this);
		});

	}

	private createRecord(req: Request, res: Response, that: any) {
		that.service.addVideo(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				constants.error(err);
				LoggerUtil.log('error', { message: 'Error in creating role', location: 'INTRO-ctrl => create', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'INTRO-ctrl', methodName: 'create' }, 200);
			}
		);
	}
	private findRecord(req: Request, res: Response, that: any) {
		that.service.getVideo( req.headers).then(
			(result: any) => {
				if (result) {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
				} else {
					that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
				}
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in finding role', location: 'INTRO-ctrl => find', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'INTRO-ctrl', methodName: 'find' }, 200);
			}
		);
	}


	private removeRecord(req: Request, res: Response, that: any) {
		that.service.removeVideo(req.body, req.headers).then(
			(result: any) => {
				that.responseUtil.sendUpdateResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in removing role', location: 'INTRO-ctrl => remove', data: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'INTRO-ctrl', methodName: 'remove' }, 200);
			}
		);
	}

	
}

export default IntroController
