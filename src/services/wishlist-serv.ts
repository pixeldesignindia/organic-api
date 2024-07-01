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
			const wishlist = await Wishlist.findById(id).populate('products.productId');
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
			const wishlist = await Wishlist.find({ user_id: headers.loggeduserid }).populate('products.productId');
			console.log(wishlist);
			return wishlist;
		} catch (error) {
			return Promise.reject(new AppError('Error finding wishlist', error, 500));
		}
	}

	async create(data: any, headers: any = null) {
		try {
			const wishlist = new Wishlist();
			wishlist.is_active = true;
			wishlist.name = data.name;
			wishlist.user_id = headers.loggeduserid;
			wishlist.unique_id = this.genericUtil.getUniqueId();

			const checkUniqueness = await Wishlist.findOne({ user_id: headers.loggeduserid, name: data.name });
			if (checkUniqueness) {
				return new AppError(constants.MESSAGES.ERRORS.ALREADY_EXIST, null, 400);
			}

			if (wishlist.products.length === 0) {
				wishlist.products = [];
			}
			return await wishlist.save();
		} catch (error) {
			console.error(error);
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
			if (data.productId && data.productSkuName) {
				// Add the product to the wishlist if it's not already included
				const productExists = wishlist.products.some((product) => product.productId.toString() === data.productId.toString() && product.productSkuName === data.productSkuName);

				if (!productExists) {
					wishlist.products.push({ productId: data.productId, productSkuName: data.productSkuName });
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
	async  moveProduct(data:any, headers:any = null) {
    const { productId, productSkuName, sourceWishlistId, destinationWishlistId } = data;

    try {
			const sourceWishlist = await Wishlist.findById(sourceWishlistId);
			const destinationWishlist = await Wishlist.findById(destinationWishlistId);

			if (!sourceWishlist) {
				// console.error(`Source wishlist not found: ${sourceWishlistId}`);
				return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			if (!destinationWishlist) {
				// console.error(`Destination wishlist not found: ${destinationWishlistId}`);
				return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			// Debug: Log sourceWishlist products
			// console.log('sourceWishlist.products:', sourceWishlist.products);

			// Check if the product already exists in the destination wishlist
			const existingProductIndex = destinationWishlist.products.findIndex((prod) => prod.productId.toString() === productId.toString() && prod.productSkuName === productSkuName);

			if (existingProductIndex !== -1) {
				// console.error(`Product already exists in destination wishlist: ${productId}, ${productSkuName}`);
				return new AppError(constants.MESSAGES.ERRORS.CONFLICT, null, 409);
			}

			// Find the product in the source wishlist
			const sourceProductIndex = sourceWishlist.products.findIndex((prod) => prod.productId.toString() === productId.toString() && prod.productSkuName === productSkuName);

			console.log('sourceProductIndex:', sourceProductIndex);

			if (sourceProductIndex === -1) {
				// console.error(`Product not found in source wishlist: ${productId}, ${productSkuName}`);
				// console.log('sourceWishlist.products:', sourceWishlist.products);
				throw new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			// Move the product from source to destination
			const [movedProduct] = sourceWishlist.products.splice(sourceProductIndex, 1);
			destinationWishlist.products.push(movedProduct);

			await sourceWishlist.save();
			await destinationWishlist.save();

			// console.log(`Product moved successfully from ${sourceWishlistId} to ${destinationWishlistId}`);
			return { message: 'Product moved successfully', destinationWishlist, movedProduct: { productId, productSkuName } };
		} catch (error) {
			// console.error('Error moving product between wishlists:', error);
			return Promise.reject(new AppError('Error moving product between wishlists', error, 500));
		}
}


	async removeProduct(id: string, data: { productId: string; productSkuName: string }, headers: any) {
		try {
			const wishlist = await Wishlist.findById(id);
			if (!wishlist) {
				throw new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			const existingProductIndex = wishlist.products.findIndex((prod) => prod.productId.toString() === data.productId.toString() && prod.productSkuName === data.productSkuName);

			if (existingProductIndex !== -1) {
				wishlist.products.splice(existingProductIndex, 1);
				await wishlist.save();
				return { message: 'Product deleted successfully' };
			} else {
				throw new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}
		} catch (error) {
			console.error(error);
			return Promise.reject(new AppError('Error removing product', error, 500));
		}
	}
}
