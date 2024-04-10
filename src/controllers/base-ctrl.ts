import * as express from 'express';
import { ResponseUtil } from '../utils/response-util';

export default class BaseController {
    protected service: any;
    public responseUtil: ResponseUtil;

    public router = express.Router();

    constructor(service: any = null) {
        if (service) {
            this.service = service;
        }

        this.responseUtil = new ResponseUtil();
    }
}