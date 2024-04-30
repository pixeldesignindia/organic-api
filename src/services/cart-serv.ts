import constants  from '../utils/constants';
import { AppError } from '../models/app-error';
import { Cart } from '../models/cart';
import { BaseService } from './base-serv';

export class CartService extends BaseService {
	constructor() {
		super(Cart);
	}

	async find(headers: any = null) {
        const userId = headers.loggeduserid;
        try {
			const cart = await Cart.findOne({ userId });
		    if (!cart) {
            throw new AppError('Cart not found',null,404);
			}
			return cart;
	    } catch (error) {
		throw new Error('Failed to get cart');
	    }

	}

	async addToCart(data: any, headers: any = null) {
       const userId = headers.loggeduserid
       const quantity = data.quantity
       const productId = data.product
	  try {
			let cart = await Cart.findOne({ userId: userId });

			if (!cart) {
				cart = new Cart({ userId, items: [] });
			}

			const existingItem = cart.items.find((item) => item.productId === productId);
			if (existingItem) {
				existingItem.quantity += quantity;
			} else {
				cart.items.push({ productId, quantity });
			}

			await cart.save();
			return cart;
		} catch (error) {
			   return Promise.reject({
						success: false,
						message: error ? error.toString() : 'Cannot create cart',
					});
		}
	}


	async removeCartItem(data: any, headers: any = null) {
        
		
				const productId = data.productId;
                const userId = headers.loggeduserid;
        try {
         const cart = await Cart.findOne({ userId });

      if (!cart) {
        throw new AppError('Cart not found',null,404);
      }

      cart.items = cart.items.filter(item => item.productId !== productId);
      await cart.save();
      return cart;
    } catch (error) {
         return Promise.reject({
						success: false,
						message: error ? error.toString() : 'Failed to remove item from cart',
					});
    }
	}
}