
import { BaseService } from './base-serv';
import { AppError } from '../models/app-error';
import { Coupon, ICoupon } from '../models/coupon';

export class CouponService extends BaseService {
	constructor() {
		super(Coupon);
	}

	async find(data: any, headers: any = null) {
		try {
			const coupon = await Coupon.findOne({ code: data.code, is_active: true });
			if (!coupon) {
				return new AppError('Coupon not found', null, 404);
			}
			if (coupon.expirationDate <= new Date()) {
				coupon.is_active = false;
				coupon.is_deleted = true;
				await coupon.save();
				return new AppError('Coupon is expired', null, 400);
			}
			return coupon;
		} catch (error) {
			console.log(error);
			return new AppError('Failed to get coupon', error, 500);
		}
	}
	async findAll(data: any, headers: any = null) {
		try {
			return await Coupon.find().sort({ created_at: 1 });
		} catch (error) {
			console.log(error);
			return new AppError('Failed to get all coupon', null, 400);
		}
	}
	async store(data: any, headers: any) {
		try {
			const coupon = await Coupon.create(data);
			return coupon;
		} catch (error) {
			console.log(error);
			throw new Error('Failed to create coupon');
		}
	}
	async isCouponExpired(code: string): Promise<boolean> {
		try {
			const coupon = await Coupon.findOne({ code, is_deleted: false }).exec();
			if (!coupon) {
				throw new AppError('Coupon not found', null, 404);
			}
			return coupon.expirationDate <= new Date();
		} catch (error) {
			console.error('Error checking coupon expiration:', error);
			throw new Error('Failed to check coupon expiration');
		}
	}
	async updateCoupon(id: string, updates: Partial<ICoupon>): Promise<ICoupon | AppError> {
		try {
			const coupon = await Coupon.findById(id).exec();
			if (!coupon) {
				return new AppError('Coupon not found', null, 404);
			}

			if (updates.discount !== undefined) {
				coupon.discount = updates.discount;
			}
			if (updates.expirationDate !== undefined) {
				coupon.expirationDate = updates.expirationDate;
			}
			if (updates.is_active !== undefined) {
				coupon.is_active = updates.is_active;
			}
			if (updates.is_deleted !== undefined) {
				coupon.is_deleted = updates.is_deleted;
			}

			await coupon.save();
			return coupon;
		} catch (error) {
			console.error('Error updating coupon:', error);
			throw new Error('Failed to update coupon');
		}
	}
	async findByCategory(categoryId: string): Promise<ICoupon[]> {
		try {
			const coupons = await Coupon.find({ category: categoryId, is_active: true }).exec();
			return coupons;
		} catch (error) {
			console.error('Error finding coupons by category:', error);
			throw new Error('Failed to find coupons by category');
		}
	}
	async findByProduct(productId: string): Promise<ICoupon[]> {
		try {
			const coupons = await Coupon.find({ productId: productId, is_active: true }).exec();
			return coupons;
		} catch (error) {
			console.error('Error finding coupons by product:', error);
			throw new Error('Failed to find coupons by product');
		}
	}
}
