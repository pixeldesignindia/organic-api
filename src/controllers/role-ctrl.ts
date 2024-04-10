import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { RoleService } from '../services/role-serv';

export class RoleController extends BaseController {
    constructor() {
        super(new RoleService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.ROLE, (req, res) => { this.createRecord(req, res, this) });
        this.router.get(constants.API.V1 + constants.API.APP.ROLE + '/:id', (req, res) => { this.findRecord(req, res, this) });
        this.router.put(constants.API.V1 + constants.API.APP.ROLE + '/:id', (req, res) => { this.updateRecord(req, res, this) });
        this.router.delete(constants.API.V1 + constants.API.APP.ROLE + '/:id', (req, res) => { this.removeRecord(req, res, this) });
        this.router.post(constants.API.V1 + constants.API.APP.ROLE + '/filter', (req, res) => { this.filterRecords(req, res, this) });

        this.router.post(constants.API.V1 + constants.API.APP.ROLE + '/assign', (req, res) => { this.assign(req, res, this) });
    }

    private createRecord(req: Request, res: Response, that: any) {
        that.service.store(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendUpdateResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in creating role', location: 'crud-ctrl => create', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'create' }, 200);
        });
    }

    private filterRecords(req: Request, res: Response, that: any) {
        that.service.filter(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in filtering roles', location: 'crud-ctrl => filter', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'filter' }, 200);
        });
    }

    private findRecord(req: Request, res: Response, that: any) {
        that.service.find(req.params.id, req.headers).then((result: any) => {
            if (result) {
                that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.OK);
            } else {
                that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
            }
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in finding role', location: 'crud-ctrl => find', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'find' }, 200);
        });
    }

    private updateRecord(req: Request, res: Response, that: any) {
        that.service.update(req.params.id, req.body, req.headers).then((result: any) => {
            if (result) {
                that.responseUtil.sendUpdateResponse(req, res, result, constants.HTTP_STATUS.UPDATED);
            } else {
                that.responseUtil.sendReadResponse(req, res, result, constants.HTTP_STATUS.NOT_FOUND);
            }
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in updating role', location: 'crud-ctrl => update', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'update' }, 200);
        });
    }

    private removeRecord(req: Request, res: Response, that: any) {
        that.service.remove(req.params.id, req.headers).then((result: any) => {
            that.responseUtil.sendUpdateResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in removing role', location: 'crud-ctrl => remove', data: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'crud-ctrl', methodName: 'remove' }, 200);
        });
    }

    private assign(req: Request, res: Response, that: any) {
        that.service.assign(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendUpdateResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in assigning role permission', location: 'role-ctrl => assign', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'role-ctrl', methodName: 'assign' }, 200);
        });
    }
}

export default RoleController;