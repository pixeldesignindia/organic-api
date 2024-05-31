import { BaseService } from './base-serv';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { Wishlist } from '../models/wish-list';

import mongoose from 'mongoose';

export class WishlistService extends BaseService {
	constructor() {
		super(Wishlist);
	}

	async find(id: string, headers: any = null) {
		try {
			const wishlist = await Wishlist.findById(id).populate('products');
			if (!wishlist) {
				return Promise.reject(new AppError('wishlist not found', null, 404));
			}
			return wishlist;
		} catch (error) {
			return Promise.reject(new AppError('Error finding category', error, 500));
		}
	}

	async findAll(headers: any = null) {
		try {
			const wishlist = await Wishlist.find({ user_id: headers.loggeduserid }).populate('products');
			return wishlist;
		} catch (error) {
			return Promise.reject(new AppError('Error finding wishlist', error, 500));
		}
	}
	async create(data: any, headers: any = null) {
	
		try {
			const wishlist = new Wishlist();
			wishlist.is_active = true;
			wishlist.unique_id = this.genericUtil.getUniqueId();
			wishlist.name = data.name;
			wishlist.user_id = headers.loggeduserid;
			const checkUniqueness = await Wishlist.findOne({ name: data.name });
			if (checkUniqueness) {
			return new AppError(constants.MESSAGES.ERRORS.ALREADY_EXIST, null, 400);
			}
		

			return await Wishlist.create(wishlist);
		} catch (error) {
			return Promise.reject(new AppError('Error creating wishlist', error, 500));
		}
	}

	async updateWishlist(id: string, data: any, headers: any) {
		try {
			if (!id || !data) {
				throw new AppError('Invalid input data', null, 400);
			}

			const wishlist = await Wishlist.findById(id);

			if (!wishlist) {
				throw new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			if (data.name) {
				wishlist.name = data.name;
			}
			if (data.productId) {
				// Add the product ID to the wishlist if it's not already included
				if (!wishlist.products.includes(data.productId)) {
					wishlist.products.push(data.productId);
				}
			}

			await wishlist.save();

			return wishlist;
		} catch (error) {
			console.error(error);
			return Promise.reject(new AppError('Error updating wishlist', error, 500));
		}
	}

	async delete(id: string, headers: any = null) {
		try {
			const wishlist = await Wishlist.findByIdAndDelete(id);
			if (!wishlist) {
				return Promise.reject(new AppError('wishlist not found', null, 404));
			}
			return wishlist;
		} catch (error) {
			return Promise.reject(new AppError('Error deleting wishlist', error, 500));
		}
	}
	async moveProduct(data: { productId: string; sourceWishlistId: string; destinationWishlistId: string }, headers: any = null) {
		try {
			const { productId, sourceWishlistId, destinationWishlistId } = data;

			const sourceWishlist = await Wishlist.findById(sourceWishlistId);
			const destinationWishlist = await Wishlist.findById(destinationWishlistId);

			if (!sourceWishlist || !destinationWishlist) {
				return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			const existingProductIndex = destinationWishlist.products.findIndex((prod: mongoose.Types.ObjectId) => prod.toString() === productId.toString());

			if (existingProductIndex !== -1) {
				return new AppError(constants.MESSAGES.ERRORS.CONFLICT, null, 404);
			}

			const sourceProductIndex = sourceWishlist.products.findIndex((prod: mongoose.Types.ObjectId) => prod.toString() === productId.toString());
			if (sourceProductIndex !== -1) {
				const [movedProduct] = sourceWishlist.products.splice(sourceProductIndex, 1);
				destinationWishlist.products.push(movedProduct);
			} else {
				throw new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			await sourceWishlist.save();
			await destinationWishlist.save();

			return { message: 'Product moved successfully', destinationWishlist, movedProduct: productId };
		} catch (error) {
			console.error(error);
			return Promise.reject(new AppError('Error moving product between wishlists', error, 500));
		}
	}
	async removeProduct(id: string, data: { productId: string }, headers: any) {
		try {
			const wishlist = await Wishlist.findById(id);
			if (!wishlist) {
				throw new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			const existingProductIndex = wishlist.products.findIndex((prod: mongoose.Types.ObjectId) => prod.toString() === data.productId.toString());

			if (existingProductIndex !== -1) {
				wishlist.products.splice(existingProductIndex, 1);
				await wishlist.save();
				return { message: 'Product deleted successfully' };
			} else {
				throw new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}
		} catch (error) {
			return Promise.reject(new AppError('Error removing product', error, 500));
		}
	}
}
