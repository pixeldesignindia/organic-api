import { Request, Response } from 'express';

import BaseController from './base-ctrl';
import constants from '../utils/constants';
import { LoggerUtil } from '../utils/logger-util';
import { SearchService } from '../services/search-serv';

export class SearchController extends BaseController {
    constructor() {
        super(new SearchService());

        this.initializeRoutes();
    }

    /**
     * @function initializeRoutes
     * Initializes API routes
     */
    public initializeRoutes() {
        this.router.post(constants.API.V1 + constants.API.APP.SEARCH, (req, res) => { this.searchProducts(req, res, this) });
    }

    private searchProducts(req: Request, res: Response, that: any) {
        that.service.searchProducts(req.body, req.headers).then((result: any) => {
            that.responseUtil.sendReadResponse(req, res, result, 200);
        }, (err: any) => {
            LoggerUtil.log('error', { message: 'Error in searching products', location: 'search-ctrl => find', error: err });
            that.responseUtil.sendFailureResponse(req, res, err, { fileName: 'search-ctrl', methodName: 'find' }, 200);
        });
    }
}

export default SearchController;