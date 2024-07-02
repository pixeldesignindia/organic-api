import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { Request, Response } from 'express';
import { LoggerUtil } from '../utils/logger-util';
import { StatisticsService } from '../services/statistics-serv';

export class StatisticsController extends BaseController {
	constructor() {
		super(new StatisticsService());

		this.initializeRoutes();
	}

	public initializeRoutes() {
		this.router.get(constants.API.V1 + constants.API.APP.STATISTICS + '/product', (req, res) => {
			this.getProductRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.STATISTICS + '/order', (req, res) => {
			this.getOrderRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.STATISTICS + '/customer', (req, res) => {
			this.getCustomerRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.STATISTICS + '/business', (req, res) => {
			this.getBusinessRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.STATISTICS + '/dashboard', (req, res) => {
			this.getDashboardRecord(req, res, this);
		});
		this.router.get(constants.API.V1 + constants.API.APP.STATISTICS + '/venderDashboard/:id', (req, res) => {
			this.getVenderDashboardRecord(req, res, this);
		});
	}

	private getProductRecord(req: Request, res: Response, that: any) {
		that.service.getProductsData(req.headers, req.query).then(
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
	private getOrderRecord(req: Request, res: Response, that: any) {
		that.service.getOrdersData(req.headers, req.query).then(
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
	private getCustomerRecord(req: Request, res: Response, that: any) {
		that.service.getUsersData(req.headers, req.query).then(
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
	private getBusinessRecord(req: Request, res: Response, that: any) {
		that.service.getBusinessesData(req.headers, req.query).then(
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
	private getDashboardRecord(req: Request, res: Response, that: any) {
		that.service.getDashboard( req.body, req.headers).then(
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
	private getVenderDashboardRecord(req: Request, res: Response, that: any) {
		that.service.getVenderDashboard(req.params.id,req.body, req.headers).then(
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
