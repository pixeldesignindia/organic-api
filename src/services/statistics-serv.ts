import { User } from '../models/user';
import { Vender } from '../models/vender';
import { AppError } from '../models/app-error';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { BaseService } from './base-serv';
import { calculatePercentage } from '../utils/helpers';
import { Category } from '../models/category';

export class StatisticsService extends BaseService {
	constructor() {
		super();
	}

	private async getDateMatchStage(specificDate?: Date, specificMonth?: number, specificYear?: number) {
		if (specificDate) {
			return { $match: { created_at: specificDate } };
		}
		if (specificMonth && specificYear) {
			return { $match: { created_at: { $gte: new Date(specificYear, specificMonth - 1, 1), $lt: new Date(specificYear, specificMonth, 1) } } };
		}
		if (specificYear) {
			return { $match: { created_at: { $gte: new Date(specificYear, 0, 1), $lt: new Date(specificYear + 1, 0, 1) } } };
		}
		return { $match: {} }; // Return an empty match stage if no specific date filters are provided
	}

	async getOrderStatistics(specificDate?: Date, specificMonth?: number, specificYear?: number) {
		const matchStage = await this.getDateMatchStage(specificDate, specificMonth, specificYear);
		const orderStatusCounts = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

		const orderStatusLabels = orderStatusCounts.map((item) => item._id);
		const orderStatusData = orderStatusCounts.map((item) => item.count);

		return {
			orderStatusLabels,
			orderStatusData,
		};
	}

	async getProductStatistics(specificDate?: Date, specificMonth?: number, specificYear?: number) {
		const matchStage = await this.getDateMatchStage(specificDate, specificMonth, specificYear);
		const productCategoryCounts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);

		const productCategoryLabels = productCategoryCounts.map((item) => item._id);
		const productCategoryData = productCategoryCounts.map((item) => item.count);

		const topSellingProducts = await Order.aggregate([
			matchStage,
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

	async getCustomerStatistics(specificDate: Date, specificMonth: number, specificYear: number) {
		try {
			let userTypeCounts;

			userTypeCounts = await User.aggregate([
				{
					$group: {
						_id: '$user_type',
						count: { $sum: 1 },
					},
				},
			]);

			console.log('User Type Counts:', userTypeCounts);

			let userCount = 0;
			let vendorCount = 0;

			userTypeCounts.forEach((item) => {
				if (item._id === 'User') {
					userCount = item.count;
				} else if (item._id === 'Vendor') {
					vendorCount = item.count;
				}
			});

			const total = userCount + vendorCount;
			const userRatio = total ? (userCount / total) * 100 : 0;
			const vendorRatio = total ? (vendorCount / total) * 100 : 0;

			return {
				userCount,
				vendorCount,
				userRatio,
				vendorRatio,
			};
		} catch (error) {
			console.error('Error in aggregation pipeline:', error);
			throw error;
		}
	}
	async getBusinessStatistics(specificDate?: Date, specificMonth?: number, specificYear?: number) {
		const matchStage = await this.getDateMatchStage(specificDate, specificMonth, specificYear);
		const businessTypeCounts = await Vender.aggregate([matchStage, { $group: { _id: '$type', count: { $sum: 1 } } }]);

		const businessTypeLabels = businessTypeCounts.map((item) => item._id || 'Unknown');
		const businessTypeData = businessTypeCounts.map((item) => item.count);

		const topPerformingVendors = await Order.aggregate([matchStage, { $group: { _id: '$user_id', totalSales: { $sum: '$totalPrice' } } }, { $sort: { totalSales: -1 } }, { $limit: 5 }]);

		const topPerformingVendorLabels = topPerformingVendors.map((item) => item._id);
		const topPerformingVendorData = topPerformingVendors.map((item) => item.totalSales);

		return {
			businessTypeLabels,
			businessTypeData,
			topPerformingVendorLabels,
			topPerformingVendorData,
		};
	}

	async getMonthwiseOrderStatistics(specificMonth?: number, specificYear?: number) {
		const matchStage = await this.getDateMatchStage(undefined, specificMonth, specificYear);
		const monthWiseOrderCounts = await Order.aggregate([
			matchStage,
			{
				$group: {
					_id: {
						year: { $year: '$created_at' },
						month: { $month: '$created_at' },
					},

					count: { $sum: 1 },
				},
			},
			{
				$sort: { '_id.year': 1, '_id.month': 1 },
			},
		]);

		const months = monthWiseOrderCounts.map((item) => `${item._id.month}/${item._id.year}`);
		const orderCounts = monthWiseOrderCounts.map((item) => item.count);

		return {
			months,
			orderCounts,
		};
	}

	async getMonthwiseProductStatistics(specificMonth?: number, specificYear?: number) {
		const matchStage = await this.getDateMatchStage(undefined, specificMonth, specificYear);
		const monthWiseProductCounts = await Product.aggregate([
			matchStage,
			{
				$group: {
					_id: {
						year: { $year: '$created_at' },
						month: { $month: '$created_at' },
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { '_id.year': 1, '_id.month': 1 },
			},
		]);

		const months = monthWiseProductCounts.map((item) => `${item._id.month}/${item._id.year}`);
		const productCounts = monthWiseProductCounts.map((item) => item.count);

		return {
			months,
			productCounts,
		};
	}

	async getMonthwiseCustomerStatistics(specificMonth?: number, specificYear?: number) {
		const matchStage = await this.getDateMatchStage(undefined, specificMonth, specificYear);
		const monthWiseCustomerCounts = await User.aggregate([
			matchStage,
			{
				$group: {
					_id: {
						year: { $year: '$created_at' },
						month: { $month: '$created_at' },
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { '_id.year': 1, '_id.month': 1 },
			},
		]);

		const months = monthWiseCustomerCounts.map((item) => `${item._id.month}/${item._id.year}`);
		const customerCounts = monthWiseCustomerCounts.map((item) => item.count);

		return {
			months,
			customerCounts,
		};
	}

	async getMonthwiseBusinessStatistics(specificMonth?: number, specificYear?: number) {
		const matchStage = await this.getDateMatchStage(undefined, specificMonth, specificYear);
		const monthWiseVendorCounts = await Vender.aggregate([
			matchStage,
			{
				$group: {
					_id: {
						year: { $year: '$created_at' },
						month: { $month: '$created_at' },
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { '_id.year': 1, '_id.month': 1 },
			},
		]);

		const months = monthWiseVendorCounts.map((item) => `${item._id.month}/${item._id.year}`);
		const vendorCounts = monthWiseVendorCounts.map((item) => item.count);

		return {
			months,
			vendorCounts,
		};
	}

	async getOrdersData(headers: any, specificDate?: Date, specificMonth?: number, specificYear?: number) {
		try {
			const ordersStats = await this.getOrderStatistics(specificDate, specificMonth, specificYear);
			const monthwiseOrderStats = await this.getMonthwiseOrderStatistics(specificMonth, specificYear);

			return {
				ordersStats,
				monthwiseOrderStats,
			};
		} catch (error) {
			throw new AppError('Failed to fetch orders statistics', error, 500);
		}
	}

	async getProductsData(headers: any, specificDate?: Date, specificMonth?: number, specificYear?: number) {
		try {
			const productsStats = await this.getProductStatistics(specificDate, specificMonth, specificYear);
			const monthwiseProductStats = await this.getMonthwiseProductStatistics(specificMonth, specificYear);
			return {
				productsStats,
				monthwiseProductStats,
			};
		} catch (error) {
			throw new AppError('Failed to fetch products statistics', error, 500);
		}
	}

	async getUsersData(headers: any, specificDate?: Date, specificMonth?: number, specificYear?: number) {
		try {
			const customersStats = await this.getCustomerStatistics(specificDate, specificMonth, specificYear);
			const monthWiseCustomerStats = await this.getMonthwiseCustomerStatistics(specificMonth, specificYear);
			console.log(monthWiseCustomerStats);
			return {
				customersStats,
				monthWiseCustomerStats,
			};
		} catch (error) {
			throw new AppError('Failed to fetch customer statistics', error, 500);
		}
	}

	async getBusinessesData(headers: any, specificDate?: Date, specificMonth?: number, specificYear?: number) {
		try {
			const businessStats = await this.getBusinessStatistics(specificDate, specificMonth, specificYear);
			const monthwiseVenderStats = await this.getMonthwiseBusinessStatistics(specificMonth, specificYear);

			return {
				businessStats,
				monthwiseVenderStats,
			};
		} catch (error) {
			throw new AppError('Failed to fetch business statistics', error, 500);
		}
	}

	async getDashboard(data: any) {
		try {
			const today = new Date();
			const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());

			const thisMonth = {
				start: new Date(today.getFullYear(), today.getMonth(), 1),
				end: today,
			};

			const lastMonth = {
				start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
				end: new Date(today.getFullYear(), today.getMonth(), 0),
			};

			const [
				thisMonthProducts,
				lastMonthProducts,
				thisMonthUsers,
				lastMonthUsers,
				thisMonthOrders,
				lastMonthOrders,
				productsCount,
				usersCount,
				allOrders,
				lastSixMonthOrders,
				categories,
				femaleUsersCount,
				latestTransaction,
				categoryCount,
				userTypeCounts,
			] = await Promise.all([
				Product.find({ created_at: { $gte: thisMonth.start, $lte: thisMonth.end } }),
				Product.find({ created_at: { $gte: lastMonth.start, $lte: lastMonth.end } }),
				User.find({ created_at: { $gte: thisMonth.start, $lte: thisMonth.end } }),
				User.find({ created_at: { $gte: lastMonth.start, $lte: lastMonth.end } }),
				Order.find({ created_at: { $gte: thisMonth.start, $lte: thisMonth.end } }),
				Order.find({ created_at: { $gte: lastMonth.start, $lte: lastMonth.end } }),
				Product.countDocuments(),
				User.countDocuments(),
				Order.find({}).select('totalPrice'),
				Order.find({ created_at: { $gte: sixMonthsAgo, $lte: today } }),
				Product.distinct('category'),
				User.countDocuments({ gender: 'female' }),
				Order.find({}).select(['cart', 'discount', 'totalPrice', 'status']).limit(4),
				Category.countDocuments(),
				User.aggregate([{ $group: { _id: '$user_type', count: { $sum: 1 } } }]),
			]);

			const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);
			const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);

			const changePercent = {
				revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
				product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
				user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
				order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
			};

			const revenue = allOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);

			const count = {
				revenue,
				product: productsCount,
				user: usersCount,
				order: allOrders.length,
			};

			const orderMonthCounts = new Array(6).fill(0);
			const orderMonthlyRevenue = new Array(6).fill(0);

			lastSixMonthOrders.forEach((order) => {
				const creationDate = new Date(order.created_at);
				const monthDiff = (today.getFullYear() - creationDate.getFullYear()) * 12 + today.getMonth() - creationDate.getMonth();

				if (monthDiff < 6) {
					orderMonthCounts[5 - monthDiff] += 1;
					orderMonthlyRevenue[5 - monthDiff] += order.totalPrice;
				}
			});

			let userCount = 0;
			let vendorCount = 0;

			userTypeCounts.forEach((item) => {
				if (item._id === 'User') {
					userCount = item.count;
				} else if (item._id === 'Vendor') {
					vendorCount = item.count;
				}
			});

			const totalUsersAndVendors = userCount + vendorCount;
			const userRatio = totalUsersAndVendors ? (userCount / totalUsersAndVendors) * 100 : 0;
			const vendorRatio = totalUsersAndVendors ? (vendorCount / totalUsersAndVendors) * 100 : 0;

			const modifiedLatestTransaction = latestTransaction.map((i) => ({
				_id: i._id,
				amount: i.totalPrice,
				quantity: i.cart.length,
				status: i.status,
			}));

			const stats:any = {
				categoryCount,
				changePercent,
				count,
				chart: {
					order: orderMonthCounts,
					revenue: orderMonthlyRevenue,
				},
				userRatio: {
					user: userRatio,
					vendor: vendorRatio,
				},
				latestTransaction: modifiedLatestTransaction,
			};

			return stats;
		} catch (err) {
			console.error('Error in getDashboard:', err);
			throw new AppError('Failed to fetch dashboard statistics',null, 500);
		}
	};
}
