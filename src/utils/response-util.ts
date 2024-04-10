import express from 'express';
import { Request, Response } from 'express';

import { LoggerUtil } from './logger-util';

export class ResponseUtil {
    constructor() {
    }

    sendFailureResponse(req: Request, res: Response, errorData: any, location: any, httpStatus: number) {
        this.logRequests(req);

        res.status(httpStatus).send({
            error: true,
            message: errorData && errorData.message ? errorData.message : ''
        });
    }

    sendReadResponse(req: Request, res: Response, data: any, httpStatus: number) {
        this.logRequests(req);

        if (data) {
            res.status(httpStatus).send({
                data: data
            });
        } else {
            res.status(httpStatus).send({
                data: null
            });
        }
    }

    sendTextResponse(req: Request, res: Response, data: any, httpStatus: number) {
        this.logRequests(req);

        if (data) {
            res.status(httpStatus).send(data);
        } else
            res.status(httpStatus).send(null);
    }

    sendUpdateResponse(req: Request, res: Response, data: any, httpStatus: number) {
        this.logRequests(req);

        let responseData: any = {};

        if (data) {
            responseData.data = data;
        } else
            responseData.data = { success: false };

        res.status(httpStatus).send(responseData);
    }

    /**
     * @function logRequests
     * @description Logs requests
     * @param controllers 
     */
    public logRequests(req: express.Request) {
        let data: any = {};
        data.url = req.url;
        data.request_method = req.method;

        data.endTime = new Date();

        if (req.body && Object.keys(req.body.length > 0)) {
            data = Object.assign(data, req.body);
        }

        data.apiTime = (new Date(data.endTime).getTime() - new Date(data.startTime).getTime()) / 1000 + ' seconds';

        LoggerUtil.log('debug', { data: data });
    }
}