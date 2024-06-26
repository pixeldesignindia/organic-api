import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { Request, Response } from 'express';
import { LoggerUtil } from '../utils/logger-util';
import { StatisticsService } from '../services/statistics-serv';

export class StatisticsController extends BaseController {
	constructor() {
		super(new StatisticsService() );

		this.initializeRoutes();
	}

	public initializeRoutes() {
		this.router.get(constants.API.V1 + constants.API.APP.STATISTICS, (req, res) => {
			this.getRecord(req, res, this);
		});
	}

	private getRecord(req: Request, res: Response, that: any) {
		that.service.getDashboardData(req.headers).then(
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

}
export default StatisticsController;
