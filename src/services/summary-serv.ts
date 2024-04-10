import { BaseService } from './base-serv';
import constants from '../utils/constants';

import { User } from '../models/user';
import { Product } from '../models/product';

export class SummaryService extends BaseService {
    constructor() {
        super();
    }

    async getSummary(data: any, headers: any) {
        const date = new Date();
        const endDate = new Date();
        let startDate = new Date(date.setDate(date.getDate() - constants.SEARCH_PAST_DAYS));

        const totalUsers = await this.getTotalUsers();
        const totalProducts = await this.getTotalProducts();
        const totalInactiveProducts = await this.getTotalInactiveProducts();
        const recentUsersCreated = await this.getUsersCreatedBetween(startDate, endDate);
        const recentProductsCreated = await this.getProductsCreatedBetween(startDate, endDate);

        return {
            TOTAL_USERS: totalUsers,
            TOTAL_PRODUCTS: totalProducts,
            RECENT_USERS: recentUsersCreated,
            RECENT_PRODUCTS: recentProductsCreated,
            INACTIVE_PRODUCTS: totalInactiveProducts
        };
    }

    async getTotalInactiveProducts() {
        return await Product.countDocuments({ is_active: false });
    }

    async getProductsCreatedBetween(startDate: any, endDate: any) {
        return await Product.countDocuments({
            created_at: { $gte: startDate, $lte: endDate }
        });
    }

    async getUsersCreatedBetween(startDate: any, endDate: any) {
        return await User.countDocuments({
            created_at: { $gte: startDate, $lte: endDate }
        });
    }

    async getTotalProducts() {
        return await Product.countDocuments();
    }

    async getTotalUsers() {
        return await User.countDocuments();
    }
}