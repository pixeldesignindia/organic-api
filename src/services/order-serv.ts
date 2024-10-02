import { User } from '../models/user';
import { Order } from '../models/order';
import { BaseService } from './base-serv';
import constants from '../utils/constants';
import { Product } from '../models/product';
import { AppError } from '../models/app-error';
import mongoose, { ClientSession } from 'mongoose';

export class OrderService extends BaseService {
	constructor() {
		super();
	}

	/**
	 * @function store
	 * Stores an order in the database
	 * Handles Razorpay payments and Cash on Delivery (COD)
	 * Uses MongoDB transactions for atomicity
	 */
	async store(data: any, headers: any = null) {
		const session: ClientSession = await mongoose.startSession();
		session.startTransaction();	
		try {
			let order = new Order();
			console.log(data);
			order.cart = data.cart.map((cartItem: any) => {
				return {
					size: cartItem.size,
					user_id: cartItem.user_id,
					quantity: cartItem.quantity,
					category: cartItem.category,
					productId: cartItem.productId,
					description: cartItem.description,
					originalPrice: cartItem.originalPrice,
					discountPrice: cartItem.discountPrice,
					productSkuName: cartItem.productSkuName,
					productCommissionAmount: cartItem.productCommissionAmount,
				};
			});

			// Set basic order details
			order.shippingAddress = data.shippingAddress;
			order.is_active = true;
			order.is_deleted = false;
			order.tax = data.tax || null;
			order.created_at = new Date();
			order.totalPrice = data.totalPrice;
			order.user_id = headers.loggeduserid;
			order.unique_id = this.genericUtil.getUniqueId();
			order.shippingCharge = data.shippingCharge || null;
			if (data.paymentInfo.type === 'COD') {
				order.status = 'placed';
				order.paymentInfo = {
					id:null,
					type: 'COD',
					status: 'pending',
				};
				order.paidAt = null;
			} else if (data.paymentInfo.type  === 'Razorpay') {
				order.paymentInfo = {
					id: data.paymentInfo.id || null,
					type: 'Razorpay',
					status: data.paymentInfo.status
				};
				order.status = data.status || 'placed';
				order.paidAt = data.paidAt || new Date();
			} else {
				throw new AppError('Invalid payment method', null, 400);
			}

			// Save the order inside the transaction
			const savedOrder = await Order.create([order], { session });

			// Commit the transaction if everything is successful
			await session.commitTransaction();
			session.endSession();

			return {
				success: true,
				message: 'Order created successfully',
				order: savedOrder,
			};
		} catch (err) {
			// Abort the transaction on error
			await session.abortTransaction();
			session.endSession();
			console.error('Order creation failed:', err);

			throw new AppError('Order creation failed', err, 500);
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
	async getAllOrdersByUserId(data: any, headers: any) {
		try {
			const orders = await Order.find({ user_id: headers.loggeduserid }).populate('cart.productId');

			return { success: true, orders };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch orders' };
		}
	}
	async getAllOrdersByVendor(id: any, data: any) {
		console.log(id);
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
		if (data.status) {
			query.status = data.status;
		}

		const skip = (pageNumber - 1) * pageSize;

		try {
			const orders = await Order.find(query).populate('cart.productId').sort({ created_at: 1 }).skip(skip).limit(pageSize);

			return { success: true, orders };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch orders' };
		}
	}

	async updateOrderStatusService(id: any, data: any, headers: any) {
		try {
			const order = await Order.findById(id);
			if (!order) {
				throw new AppError('Order not found with this id', null, 404);
			}

			if (data.newStatus === 'Transferred to delivery partner') {
				for (const item of order.cart) {
					await this.updateProductStockService(item.productId, item.quantity);
				}
			}

			if (data.newStatus === 'Delivered') {
				order.deliveredAt = new Date();
				order.paymentInfo.status = 'Succeeded';
				let serviceCharge = 0;
				const commissionAmount = order.cart.reduce((total, item) => total + item.quantity * item.productCommissionAmount, 0);
				if (order.deliveredBy === 'Vendor') {
					serviceCharge = commissionAmount;
				} else if (order.deliveredBy === 'Admin') {
					serviceCharge = order.shippingCharge + commissionAmount;
				}

				await this.updateVendorBalanceService(order.user_id, order.totalPrice - serviceCharge);
			}

			order.status = data.newStatus;
			await order.save();

			return { success: true, order };
		} catch (error) {
			throw error;
		}
	}

	async updateProductStockService(data: any, quantity: number) {
		try {
			const product = await Product.findById(data.productId).populate('cart.productId');

			if (!product) {
				throw new AppError('Product not found with this id', null, 404);
			}

			// Find the SKU by name
			const skuToUpdate = product.skus.find((sku) => sku.name === data.skuName);

			if (!skuToUpdate) {
				throw new AppError(` not found for this product`, null, 404);
			}

			// Check if there is enough stock
			if (skuToUpdate.stock < quantity) {
				throw new AppError(`Not enough stock `, null, 404);
			}

			// Update the stock
			skuToUpdate.stock -= quantity;

			await product.save();

			return { success: true };
		} catch (error) {
			throw error;
		}
	}

	async updateVendorBalanceService(userId: string, amount: number) {
		try {
			const vendor = await User.findById(userId);
			if (!vendor) {
				throw new AppError('Vendor not found with this id', null, 404);
			}

			vendor.availableBalance += amount;
			await vendor.save();

			return { success: true };
		} catch (error) {
			throw error;
		}
	}
	async find(id: string, headers: any) {
		try {
			const order = await Order.findById(id).populate('cart.productId');
			if (!order) {
				return { success: false, message: 'Order not found' };
			}
			return { success: true, order };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch address' };
		}
	}
	async filter(data: any, headers: any) {
		try {
			let where: any = {};
			if (data.status) {
				where.status = data.status;
			}
			// populate products  on order cart
			const order = await Order.find(where).populate('cart.productId').sort({ created_at: 1 });
			return { success: true, order };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch address' };
		}
	}

	async assignOrder(data: any, headers: any) {
		try {
			const order = await Order.findByIdAndUpdate(data.orderId, { delivery_partner_id: data.deliveryPartnerId }, { new: true });
			if (!order) {
				return { success: false, message: 'Order not found' };
			}
			return { success: true, order };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to update order' };
		}
	}
	async deliveredOrder(data: any, headers: any) {
		try {
			const order = await Order.findByIdAndUpdate(data.orderId, { deliveredBy: data.delivered }, { new: true });
			if (!order) {
				return { success: false, message: 'Order not found' };
			}
			return { success: true, order };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to update order' };
		}
	}
	async getAllOrdersAssignUser(data: any, headers: any) {
		try {
			const orders = await Order.find({ delivery_partner_id: headers.loggeduserid }).populate('cart.productId').sort({created_at:1});

			return { success: true, orders };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch orders' };
		}
	}
}
