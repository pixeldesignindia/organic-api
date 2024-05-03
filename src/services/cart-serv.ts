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
				return new AppError('Cart not found', null, 404);
			}
			return cart;
		} catch (error) {
			console.log(error);
			throw new Error('Failed to get cart');
		}
	}

	async addToCart(data: any, headers: any = null) {
		try {
			const userId = headers.loggeduserid;
			const quantity = data.quantity;
			const productId = data.productId;
			console.log('Adding to cart:', productId, quantity);

			let cart = await Cart.findOne({ userId });

			if (!cart) {
				cart = new Cart({ userId, items: [{ productId, quantity }] });
				cart.is_active = true;
				cart.unique_id = this.genericUtil.getUniqueId();
				await Cart.create(cart);
			} else {
				// Check if the product already exists in the cart
				let existingItemIndex = -1;
				cart.items.forEach((item, index) => {
					if (item.productId.toString() === productId.toString()) {
						existingItemIndex = index;
					}
				});

				if (existingItemIndex !== -1) {
					console.log('Cart already exists', cart.items[existingItemIndex]);
					if (data.decrease) {
						cart.items[existingItemIndex].quantity -= quantity;
					} else {
						cart.items[existingItemIndex].quantity += quantity;
					}
				} else {
					cart.items.push({ productId, quantity });
				}
				await cart.save(); // Save changes to the cart
			}

			return cart;
		} catch (error) {
			console.error('Error adding to cart:', error);
			throw {
				success: false,
				message: error ? error.toString() : 'Cannot create cart',
			};
		}
	}

	async decreaseQuantity(data: any, headers: any = null) {
		data.decrease = true;

		return await this.addToCart(data, headers);
	}

	async removeCartItem(data: any, headers: any = null) {
		
		console.log('Removing from cart:', data.productId);
		const userId = headers.loggeduserid;
		try {
			const cart = await Cart.findOne({ userId });

			if (!cart) {
				return new AppError('Cart not found', null, 404);
			}

			let removedQuantity = 0;

			// Find the existing item in the cart
			const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === data.productId.toString());
			if (existingItemIndex !== -1) {
				console.log('Existing item found:', cart.items[existingItemIndex]);

				// Remove the product ID from the cart
				const removedItem = cart.items.splice(existingItemIndex, 1)[0];
				removedItem.quantity = 0;
				console.log('Removed item:', removedItem);
				await cart.save();
			}

			console.log('Cart after removal:', cart);

			return cart;
		} catch (error) {
			console.error('Failed to remove item from cart:', error);
			throw {
				success: false,
				message: error ? error.toString() : 'Failed to remove item from cart',
			};
		}
	}
}