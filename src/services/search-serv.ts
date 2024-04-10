import { BaseService } from './base-serv';
import { Product } from '../models/product';
import { LoggerUtil } from '../utils/logger-util';

export class SearchService extends BaseService {
    constructor() {
        super();
    }

    async searchProducts(data: any, headers: any) {
        try {
            const searchResults = await Product.find({
                $text: { $search: data.query }
            }, {
                score: { $meta: "textScore" }
            }).sort({
                score: { $meta: "textScore" }
            });

            return {
                success: true,
                data: searchResults
            };
        } catch (error) {
            LoggerUtil.log('error', { message: 'Search API Error:', error });
            return Promise.reject({
                success: false,
                message: error ? error.toString() : 'Error during search operation.'
            });
        }
    }
}