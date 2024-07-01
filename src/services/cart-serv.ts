
import { Cart } from '../models/cart';
import { BaseService } from './base-serv';
import { AppError } from '../models/app-error';

export class CartService extends BaseService {
	constructor() {
		super(Cart);
	}

	async find(headers: any = null) {
		const userId = headers.loggeduserid;
		console.log(userId);
		try {
			const cart = await Cart.findOne({ userId }).populate('items.productId');
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
			const { quantity, productId, productSkuName, decrease } = data;

			let cart = await Cart.findOne({ userId });

			if (!cart) {
				cart = new Cart({
					userId,
					items: [{ productId, quantity, productSkuName }],
					is_active: true,
					unique_id: this.genericUtil.getUniqueId(),
				});
				await Cart.create(cart);
			} else {
				let existingItemIndex = -1;
				cart.items.forEach((item, index) => {
					if (item.productId.toString() === productId.toString() && item.productSkuName === productSkuName) {
						existingItemIndex = index;
					}
				});

				if (existingItemIndex !== -1) {
					if (decrease) {
						if (quantity < cart.items[existingItemIndex].quantity) {
							cart.items[existingItemIndex].quantity -= quantity;
						}
					} else {
						cart.items[existingItemIndex].quantity += quantity;
					}
				} else {
					cart.items.push({ productId, quantity, productSkuName });
				}
				await cart.save();
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
			const existingItemIndex = cart.items.findIndex((item) => item.productId.toString() === data.productId.toString() && item.productSkuName === data.productSkuName);
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
	async delete(data: any, headers: any = null) {
		try {
			const cart = await Cart.findByIdAndDelete({ _id: data.id });
			if (!cart) {
				return new AppError('Cart not found', null, 404);
			}
			return { success: true, message: 'Cart delete successfully' };
		} catch (error) {
			return new AppError('Error deleting cart', error, 500);
		}
	}
}