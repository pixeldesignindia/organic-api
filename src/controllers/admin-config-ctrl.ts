import { Request, Response } from 'express';
import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { ConfigurationService } from '../services/admin-config-serv';

export default class ConfigurationController extends BaseController {
	constructor() {
		super(new ConfigurationService());

		this.initializeRoutes();
	}

	public initializeRoutes() {
		this.router.get(constants.API.V1 + constants.API.APP.CONFIG, (req, res) => {
			this.getConfiguration(req, res, this);
		});
		this.router.post(constants.API.V1 + constants.API.APP.CONFIG, (req, res) => {
			this.createConfiguration(req, res, this);
		});
		this.router.put(constants.API.V1 + constants.API.APP.CONFIG + '/:id', (req, res) => {
			this.updateConfiguration(req, res, this);
		});
	}

	private getConfiguration(req: Request, res: Response, that: any) {
		that.service.getConfiguration().then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in getting configuration', location: 'configuration-ctrl => getConfiguration', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'configuration-ctrl', methodName: 'getConfiguration' }, 200);
			}
		);
	}

	private createConfiguration(req: Request, res: Response, that: any) {
		that.service.createConfiguration(req.body).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 201);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in creating configuration', location: 'configuration-ctrl => createConfiguration', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'configuration-ctrl', methodName: 'createConfiguration' }, 200);
			}
		);
	}

	private updateConfiguration(req: Request, res: Response, that: any) {
		that.service.updateConfiguration(req.params.id, req.body).then(
			(result: any) => {
				that.responseUtil.sendReadResponse(req, res, result, 200);
			},
			(err: any) => {
				LoggerUtil.log('error', { message: 'Error in updating configuration', location: 'configuration-ctrl => updateConfiguration', error: err });
				that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'configuration-ctrl', methodName: 'updateConfiguration' }, 200);
			}
		);
	}
}
