import { User } from '../models/user';
import { Vender } from '../models/vender';
import { AppError } from '../models/app-error';
import { Product } from '../models/product';
import { Order } from '../models/order';
import { BaseService } from './base-serv';
import { calculatePercentage } from '../utils/helpers';
import { Category } from '../models/category';
import constants from '../utils/constants';

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

	async getDashboard(date: any) {
		try {
			// Extract date if it's provided as an object
			let specificDate;
			if (date && date.date) {
				specificDate = new Date(date.date);
			} else if (date instanceof Date) {
				specificDate = date;
			}

			const today = new Date();
			const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

			let thisMonthStart, thisMonthEnd;
			let specificMonthStart, specificMonthEnd;

			if (specificDate instanceof Date && !isNaN(specificDate.getTime())) {
				// Specific date is provided
				thisMonthStart = new Date(specificDate.getFullYear(), specificDate.getMonth(), 1);
				thisMonthEnd = new Date(specificDate.getFullYear(), specificDate.getMonth() + 1, 0);
				specificMonthStart = thisMonthStart;
				specificMonthEnd = thisMonthEnd;
			} else {
				// Default to current month
				thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
				thisMonthEnd = today;
				specificMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
				specificMonthEnd = today;
			}

			const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
			const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

			const [
				thisMonthProducts,
				lastMonthProducts,
				thisMonthOrders,
				lastMonthOrders,
				productsCount,
				allOrders,
				lastTwelveMonthOrders,
				latestTransaction,
				categoryCount,
				allUsers,
				allVendors,
				lastTwelveMonthUsers,
				lastTwelveMonthVendors,
			] = await Promise.all([
				Product.find({ created_at: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
				Product.find({ created_at: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
				Order.find({ created_at: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
				Order.find({ created_at: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
				Product.countDocuments({ isVerified: true }),
				Order.find().select('totalPrice'),
				Order.find({ created_at: { $gte: oneYearAgo, $lte: today } }),
				Order.find().select(['cart', 'discount', 'totalPrice', 'status']).limit(4),
				Category.countDocuments(),
				User.countDocuments({ user_type: 'User' }),
				User.countDocuments({ user_type: 'Vendor' }),
				User.find({ created_at: { $gte: oneYearAgo, $lte: today }, user_type: 'User' }).select('created_at'),
				User.find({ created_at: { $gte: oneYearAgo, $lte: today }, user_type: 'Vendor' }).select('created_at'),
			]);

			const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);
			const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);

			const changePercent = {
				revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
				product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
				order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
			};

			const revenue = allOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);

			const count = {
				revenue,
				product: productsCount,
				order: allOrders.length,
				user: allUsers,
				vendor: allVendors,
			};

			const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			type OrdersByMonth = {
				[monthYear: string]: {
					month: string;
					year: number;
					orderCount: number;
					revenue: number;
					userCount: number;
					vendorCount: number;
				};
			};

			const ordersByMonth: OrdersByMonth = {};

			lastTwelveMonthOrders.forEach((order) => {
				const creationDate = new Date(order.created_at);
				const monthYear = `${creationDate.getFullYear()}-${creationDate.getMonth()}`;

				if (!ordersByMonth[monthYear]) {
					ordersByMonth[monthYear] = {
						month: months[creationDate.getMonth()],
						year: creationDate.getFullYear(),
						orderCount: 0,
						revenue: 0,
						userCount: 0,
						vendorCount: 0,
					};
				}

				ordersByMonth[monthYear].orderCount += 1;
				ordersByMonth[monthYear].revenue += order.totalPrice;
			});

			lastTwelveMonthUsers.forEach((user) => {
				const creationDate = new Date(user.created_at);
				const monthYear = `${creationDate.getFullYear()}-${creationDate.getMonth()}`;

				if (!ordersByMonth[monthYear]) {
					ordersByMonth[monthYear] = {
						month: months[creationDate.getMonth()],
						year: creationDate.getFullYear(),
						orderCount: 0,
						revenue: 0,
						userCount: 0,
						vendorCount: 0,
					};
				}

				ordersByMonth[monthYear].userCount += 1;
			});

			lastTwelveMonthVendors.forEach((vendor) => {
				const creationDate = new Date(vendor.created_at);
				const monthYear = `${creationDate.getFullYear()}-${creationDate.getMonth()}`;

				if (!ordersByMonth[monthYear]) {
					ordersByMonth[monthYear] = {
						month: months[creationDate.getMonth()],
						year: creationDate.getFullYear(),
						orderCount: 0,
						revenue: 0,
						userCount: 0,
						vendorCount: 0,
					};
				}

				ordersByMonth[monthYear].vendorCount += 1;
			});

			// Ensure all months in the past year are represented
			for (let i = 0; i < 12; i++) {
				const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
				const monthYear = `${date.getFullYear()}-${date.getMonth()}`;

				if (!ordersByMonth[monthYear]) {
					ordersByMonth[monthYear] = {
						month: months[date.getMonth()],
						year: date.getFullYear(),
						orderCount: 0,
						revenue: 0,
						userCount: 0,
						vendorCount: 0,
					};
				}
			}

			const chartData = Object.values(ordersByMonth)
				.map((data) => ({
					month: `${data.month} ${data.year}`,
					order: data.orderCount,
					revenue: data.revenue,
					userCount: data.userCount,
					vendorCount: data.vendorCount,
				}))
				.sort((a, b) => new Date(`${a.month} 1`).getTime() - new Date(`${b.month} 1`).getTime());

			const modifiedLatestTransaction = latestTransaction.map((i) => ({
				_id: i._id,
				amount: i.totalPrice,
				quantity: i.cart.length,
				status: i.status,
			}));

			let specificMonthData: any[] = [];
			let specificMonthUsers: any[] = [];
			let specificMonthVendors: any[] = [];
			if (specificDate instanceof Date && !isNaN(specificDate.getTime())) {
				// Specific month data based on provided date
				const specificMonthOrders = await Order.find({
					created_at: { $gte: specificMonthStart, $lte: specificMonthEnd },
				});

				const specificMonthProducts = await Product.find({
					created_at: { $gte: specificMonthStart, $lte: specificMonthEnd },
					isVerified: true,
				});

				const specificMonthUsersData = await User.find({
					created_at: { $gte: specificMonthStart, $lte: specificMonthEnd },
					user_type: 'User',
				});

				const specificMonthVendorsData = await User.find({
					created_at: { $gte: specificMonthStart, $lte: specificMonthEnd },
					user_type: 'Vendor',
				});

				const daysInSpecificMonth = specificMonthEnd.getDate();
				specificMonthData = Array.from({ length: daysInSpecificMonth }, (_, i) => {
					const day = i + 1;
					const dayDate = new Date(specificDate.getFullYear(), specificDate.getMonth(), day);
					return {
						day: dayDate.toISOString().slice(0, 10), // Format as YYYY-MM-DD
						orderCount: 0,
						revenue: 0,
						productCount: 0,
						userCount: 0,
						vendorCount: 0,
					};
				});

				specificMonthOrders.forEach((order) => {
					const day = new Date(order.created_at).getDate() - 1;
					specificMonthData[day].orderCount += 1;
					specificMonthData[day].revenue += order.totalPrice;
				});

				specificMonthProducts.forEach((product) => {
					const day = new Date(product.created_at).getDate() - 1;
					specificMonthData[day].productCount += 1;
				});

				specificMonthUsersData.forEach((user) => {
					const day = new Date(user.created_at).getDate() - 1;
					specificMonthData[day].userCount += 1;
				});

				specificMonthVendorsData.forEach((vendor) => {
					const day = new Date(vendor.created_at).getDate() - 1;
					specificMonthData[day].vendorCount += 1;
				});

				specificMonthUsers = specificMonthUsersData.map((user) => ({
					_id: user._id,
					email: user.email,
					username: user.username,
					created_at: user.created_at,
				}));

				specificMonthVendors = specificMonthVendorsData.map((vendor) => ({
					_id: vendor._id,
					email: vendor.email,
					username: vendor.username,
					created_at: vendor.created_at,
				}));
			}

			const stats = {
				categoryCount,
				changePercent,
				count,
				chart: chartData,
				latestTransaction: modifiedLatestTransaction,
				specificMonthData,
			};

			return stats;
		} catch (err) {
			console.error('Error in getDashboard:', err);
			throw new AppError('Failed to fetch dashboard statistics', null, 500);
		}
	}

	async getVenderDashboard(id: any, date?: any, headers: any = null) {
		try {
			const userId = String(id);

			// Extract date if it's provided as an object
			let specificDate;
			if (date && date.date) {
				specificDate = new Date(date.date);
			} else if (date instanceof Date) {
				specificDate = date;
			}

			const today = new Date();
			const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

			let thisMonthStart, thisMonthEnd;
			let specificMonthStart, specificMonthEnd;

			if (specificDate instanceof Date && !isNaN(specificDate.getTime())) {
				// Specific date is provided
				thisMonthStart = new Date(specificDate.getFullYear(), specificDate.getMonth(), 1);
				thisMonthEnd = new Date(specificDate.getFullYear(), specificDate.getMonth() + 1, 0);
				specificMonthStart = thisMonthStart;
				specificMonthEnd = thisMonthEnd;
			} else {
				// Default to current month
				thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
				thisMonthEnd = today;
				specificMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
				specificMonthEnd = today;
			}

			const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
			const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

			const [thisMonthProducts, lastMonthProducts, thisMonthOrders, lastMonthOrders, productsCount, allOrders, lastTwelveMonthOrders, latestTransaction, categoryCount] = await Promise.all([
				Product.find({ created_at: { $gte: thisMonthStart, $lte: thisMonthEnd }, user_id: id }),
				Product.find({ created_at: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
				Order.find({ created_at: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
				Order.find({ created_at: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
				Product.countDocuments({ user_id: userId }),
				Order.find({ 'cart.user_id': userId }).select('totalPrice'),
				Order.find({ created_at: { $gte: oneYearAgo, $lte: today }, 'cart.user_id': userId }),
				Order.find({ 'cart.user_id': userId }).select(['cart', 'discount', 'totalPrice', 'status']).limit(4),
				Category.countDocuments(),
			]);

			const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);
			const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);

			const changePercent = {
				revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
				product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
				order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
			};

			const revenue = allOrders.reduce((total, order) => total + (order.totalPrice || 0), 0);

			const count = {
				revenue,
				product: productsCount,
				order: allOrders.length,
			};

			const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

			type OrdersByMonth = {
				[monthYear: string]: {
					month: string;
					year: number;
					orderCount: number;
					revenue: number;
				};
			};

			const ordersByMonth: OrdersByMonth = {};

			lastTwelveMonthOrders.forEach((order) => {
				const creationDate = new Date(order.created_at);
				const monthYear = `${creationDate.getFullYear()}-${creationDate.getMonth()}`;

				if (!ordersByMonth[monthYear]) {
					ordersByMonth[monthYear] = {
						month: months[creationDate.getMonth()],
						year: creationDate.getFullYear(),
						orderCount: 0,
						revenue: 0,
					};
				}

				ordersByMonth[monthYear].orderCount += 1;
				ordersByMonth[monthYear].revenue += order.totalPrice;
			});

			// Ensure all months in the past year are represented
			for (let i = 0; i < 12; i++) {
				const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
				const monthYear = `${date.getFullYear()}-${date.getMonth()}`;

				if (!ordersByMonth[monthYear]) {
					ordersByMonth[monthYear] = {
						month: months[date.getMonth()],
						year: date.getFullYear(),
						orderCount: 0,
						revenue: 0,
					};
				}
			}

			const chartData = Object.values(ordersByMonth)
				.map((data) => ({
					month: `${data.month} ${data.year}`,
					order: data.orderCount,
					revenue: data.revenue,
				}))
				.sort((a, b) => new Date(`${a.month} 1`).getTime() - new Date(`${b.month} 1`).getTime());

			const modifiedLatestTransaction = latestTransaction.map((i) => ({
				_id: i._id,
				amount: i.totalPrice,
				quantity: i.cart.length,
				status: i.status,
			}));

			let specificMonthData: any[] = [];
			if (specificDate instanceof Date && !isNaN(specificDate.getTime())) {
				// Specific month data based on provided date
				const specificMonthOrders = await Order.find({
					created_at: { $gte: specificMonthStart, $lte: specificMonthEnd },
					'cart.user_id': userId,
				});

				const specificMonthProducts = await Product.find({
					created_at: { $gte: specificMonthStart, $lte: specificMonthEnd },
					user_id: id,
				});

				const daysInSpecificMonth = specificMonthEnd.getDate();
				specificMonthData = Array.from({ length: daysInSpecificMonth }, (_, i) => {
					const day = i + 1;
					const dayDate = new Date(specificDate.getFullYear(), specificDate.getMonth(), day);
					return {
						day: dayDate.toISOString().slice(0, 10), // Format as YYYY-MM-DD
						orderCount: 0,
						revenue: 0,
						productCount: 0,
					};
				});

				specificMonthOrders.forEach((order) => {
					const day = new Date(order.created_at).getDate() - 1;
					specificMonthData[day].orderCount += 1;
					specificMonthData[day].revenue += order.totalPrice;
				});

				specificMonthProducts.forEach((product) => {
					const day = new Date(product.created_at).getDate() - 1;
					specificMonthData[day].productCount += 1;
				});
			}

			const stats = {
				categoryCount,
				changePercent,
				count,
				chart: chartData,
				latestTransaction: modifiedLatestTransaction,
				specificMonthData,
			};

			return stats;
		} catch (err) {
			console.error('Error in getDashboard:', err);
			throw new AppError('Failed to fetch dashboard statistics', null, 500);
		}
	}
}
