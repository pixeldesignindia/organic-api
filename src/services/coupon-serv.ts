
import { BaseService } from './base-serv';
import { AppError } from '../models/app-error';
import { Coupon } from '../models/coupon';

export class CouponService extends BaseService {
	constructor() {
		super(Coupon);
	}

	async find(data:any,headers: any = null) {
		try {
			const coupon = await Coupon.findOne({code:data.code});
			if (!coupon) {
				return new AppError('Cart not found', null, 404);
			}
			return coupon;
		} catch (error) {
			console.log(error);
			throw new Error('Failed to get coupon');
		}
	}

	
}
