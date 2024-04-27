import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { UserService } from '../services/user-serv';
import { ProductService } from '../services/product-serv';


export default class CrudController extends BaseController {
    constructor() {
        super();
        this.setupEndPoints();
    }

    setupEndPoints() {
        this.setupRoutes(new UserService(), constants.API.APP.USER);
        this.setupRoutes(new ProductService(), constants.API.APP.PRODUCT);
    }

    /**
     * @function setupRoutes
     * Initializes API V1 routes
     */
    public setupRoutes(service: any, endPoint: string) {
        this.router.post(constants.API.V1 + endPoint, (req, res) => { this.createRecord(req, res, endPoint, service, this) });
        this.router.get(constants.API.V1 + endPoint + '/:id', (req, res) => { this.findRecord(req, res, endPoint, service, this) });
        this.router.put(constants.API.V1 + endPoint + '/:id', (req, res) => { this.updateRecord(req, res, endPoint, service, this) });
        this.router.delete(constants.API.V1 + endPoint + '/:id', (req, res) => { this.removeRecord(req, res, endPoint, service, this) });
        this.router.post(constants.API.V1 + endPoint+'/filter',(req, res) => { this.filterRecords(req, res, endPoint, service, this) });
    }

    private createRecord(req: Request, res: Response, endPoint: string, service: any, that: any) {
        service.store(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendUpdateResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in creating ' + endPoint, location: 'crud-ctrl => create', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'create' }, 200);
        });
    }

    private filterRecords(req: Request, res: Response, endPoint: string, service: any, that: any) {
        const filterCriteria = req.query;
        console.log('filterCriteria')
        service.filter(filterCriteria, req.headers).then(
					(result: any) => {
						that.responseUtil.sendReadResponse(req, res, result, 200);
					},
					(err: any) => {
						LoggerUtil.log('error', { message: 'Error in filtering ' + endPoint, location: 'crud-ctrl => filter', data: err });
						that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'filter' }, 200);
					}
				);
    }

    private findRecord(req: Request, res: Response, endPoint: string, service: any, that: any) {
        service.find(req.params.id, req.headers).then((result: any) => {
            if (result) {
                that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
            } else {
                that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
            }
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in finding ' + endPoint, location: 'crud-ctrl => find', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'find' }, 200);
        });
    }

    private updateRecord(req: Request, res: Response, endPoint: string, service: any, that: any) {
        service.update(req.params.id, req.body, req.headers).then((result: any) => {
            if (result) {
                that.responseUtil.sendUpdateResponse(req, res, result, constants.HTTP_STATUS.UPDATED);
            } else {
                that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
            }
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in updating ' + endPoint, location: 'crud-ctrl => update', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'update' }, 200);
        });
    }

    private removeRecord(req: Request, res: Response, endPoint: string, service: any, that: any) {
        service.remove(req.params.id, req.headers).then((result: any) => {
            that.responseUtil.sendUpdateResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in removing ' + endPoint, location: 'crud-ctrl => remove', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'remove' }, 200);
        });
    }
}