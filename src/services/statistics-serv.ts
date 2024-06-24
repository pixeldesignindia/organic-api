import { User } from '../models/user';
import { Vender } from '../models/vender';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { BaseService } from './base-serv';

export class StatisticsService extends BaseService {
	constructor() {
		super();
	}

	async getDashboardData(headers:any) {
		try {
			const ordersStats = await this.getOrderStatistics();
			const productsStats = await this.getProductStatistics();
			const customersStats = await this.getCustomerStatistics();
			const businessStats = await this.getBusinessStatistics();

			return {
				ordersStats,
				productsStats,
				customersStats,
				businessStats,
			};
		} catch (error) {
			throw new AppError('Failed to fetch dashboard statistics', error, 500);
		}
	}

	async getOrderStatistics() {
		const orderStatusCounts = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
        console.log(orderStatusCounts)

		const orderStatusLabels = orderStatusCounts.map((item) => item._id);
		const orderStatusData = orderStatusCounts.map((item) => item.count);

		return {
			orderStatusLabels,
			orderStatusData,
		};
	}

	async getProductStatistics() {
		const productCategoryCounts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

		const productCategoryLabels = productCategoryCounts.map((item) => item._id);
		const productCategoryData = productCategoryCounts.map((item) => item.count);

		const topSellingProducts = await Order.aggregate([
			{ $unwind: '$cart' },
			{ $group: { _id: '$cart.productId', totalSold: { $sum: '$cart.quantity' } } },
			{ $sort: { totalSold: -1 } },
			{ $limit: 5 },
		]);

		const topSellingProductLabels = topSellingProducts.map((item) => item._id);
		const topSellingProductData = topSellingProducts.map((item) => item.totalSold);

		return {
			productCategoryLabels,
			productCategoryData,
			topSellingProductLabels,
			topSellingProductData,
		};
	}

	async getCustomerStatistics() {
		const genderCounts = await User.aggregate([{ $group: { _id: '$gender', count: { $sum: 1 } } }]);

		const genderLabels = genderCounts.map((item) => item._id || 'Unknown');
		const genderData = genderCounts.map((item) => item.count);

		return {
			genderLabels,
			genderData,
		};
	}

	async getBusinessStatistics() {
		const businessTypeCounts = await Vender.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);

		const businessTypeLabels = businessTypeCounts.map((item) => item._id || 'Unknown');
		const businessTypeData = businessTypeCounts.map((item) => item.count);

		const topPerformingVendors = await Order.aggregate([{ $group: { _id: '$user_id', totalSales: { $sum: '$totalPrice' } } }, { $sort: { totalSales: -1 } }, { $limit: 5 }]);

		const topPerformingVendorLabels = topPerformingVendors.map((item) => item._id);
		const topPerformingVendorData = topPerformingVendors.map((item) => item.totalSales);

		return {
			businessTypeLabels,
			businessTypeData,
			topPerformingVendorLabels,
			topPerformingVendorData,
		};
	}
}
