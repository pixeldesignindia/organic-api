
import { User } from '../models/user';
import { Order } from '../models/order';
import { BaseService } from './base-serv';
import constants from '../utils/constants';
import { Product } from '../models/product';
import { AppError } from '../models/app-error';


export class OrderService extends BaseService {
	constructor() {
		super();
	}

	async store(data: any, headers: any = null) {
		let order = new Order();

		// Assuming data.cart is an array of products
		order.cart = data.cart.map((cartItem: any) => {
			return {
				
				user_id: cartItem.user_id,
				quantity: cartItem.quantity,
				category: cartItem.category,
				productId: cartItem.productId,
				originalPrice: cartItem.originalPrice,
				discountPrice: cartItem.discountPrice,
				description: cartItem.description,
			};
		});

		order.shippingAddress = data.shippingAddress

		order.user_id = headers.loggeduserid;
		order.totalPrice = data.totalPrice;
		order.status = data.status || 'placed'; // Default status to 'placed' if not provided
		order.paymentInfo = {
			id: data.paymentInfo.id || null,
			status: data.paymentInfo.status || null,
			type: data.paymentInfo.type || null,
		};
		order.is_active = true;
		order.is_deleted = false;
		order.created_at = new Date();
		order.paidAt = data.paidAt || new Date();
		order.unique_id = this.genericUtil.getUniqueId();

		try {
		return await Order.create(order);

		} catch (err) {
			console.log(err);
			return Promise.reject({
				success: false,
				message: err ? err.toString() : 'Cannot create order',
			});
		}
	}

	async cancelOrder(orderId: string) {
		try {
			const order = await Order.findById({ _id: orderId });

			if (!order) {
				return { success: false, message: 'Order not found' };
			}
			if (order.status === 'cancelled') {
				return { success: false, message: 'Order is already cancelled' };
			}
			order.status = 'cancelled';
			await order.save();

			return { success: true, message: 'Order cancelled successfully' };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to cancel order' };
		}
	}
	async getAllOrdersByUserId(data:any,headers:any) {
		try {
			const orders = await Order.find({ user_id: headers.loggeduserid }).populate("cart.productId");

			return { success: true, orders };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch orders' };
		}
	}
	async getAllOrdersByVendor(id:any,data: any) {
		console.log(id)
		 let pageNumber = 1;
			let pageSize = constants.MAX_PAGED_RECORDS_TO_LOAD;
			let sortField = 'created_at';
			let sortOrder = 1;
			const query: any = { 'cart.user_id': id };

			if (data.pageNumber) {
				pageNumber = data.pageNumber;
			}
			if (data.pageSize) {
				pageSize = data.pageSize;
			}
			if (data.sortOrder) {
				sortOrder = data.sortOrder;
			}
			if(data.status){
				query.status = data.status;
			}

			const skip = (pageNumber - 1) * pageSize;

			try {

				const orders = await Order.find(query)
					.populate('cart.productId')
                .sort({ created_at:1})
					.skip(skip)
					.limit(pageSize);

				return { success: true, orders };
			} catch (error) {
				return { success: false, message: error.message || 'Failed to fetch orders' };
			}
	}

	async updateOrderStatusService(id:any,data:any,headers:any){
		try {
			const order = await Order.findById(id);
			if (!order) {
				throw new AppError('Order not found with this id',null, 404);
			}

			if (data.newStatus === 'Transferred to delivery partner') {
				for (const item of order.cart) {
					await this.updateProductStockService(item.productId, item.quantity);
				}
			}

			if (data.newStatus === 'Delivered') {
				order.deliveredAt = new Date;
				order.paymentInfo.status = 'Succeeded';
				const serviceCharge = order.totalPrice * 0.1;
				await this.updateVendorBalanceService(order.user_id, order.totalPrice - serviceCharge);
			}

			order.status = data.newStatus;
			await order.save();

			return { success: true, order };
		} catch (error) {
			throw error;
		}
	};

	async updateProductStockService (productId: string, quantity: number) {
		try {
			const product = await Product.findById(productId);
			if (!product) {
				throw new AppError('Product not found with this id',null, 404);
			}
			if(product.stock <quantity){
				throw new AppError('Not enough stock for this product',null, 404);
			}

			product.stock -= quantity;
			await product.save();

			return { success: true };
		} catch (error) {
			throw error;
		}
	};

	async updateVendorBalanceService(userId: string, amount: number){
		try {
			const vendor = await User.findById(userId);
			if (!vendor) {
				throw new AppError('Vendor not found with this id',null, 404);
			}

			vendor.availableBalance += amount;
			await vendor.save();

			return { success: true };
		} catch (error) {
			throw error;
		}
	};
}
