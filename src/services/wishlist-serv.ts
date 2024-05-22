import { BaseService } from './base-serv';
import constants from '../utils/constants';
import { AppError } from '../models/app-error';
import { Wishlist } from '../models/wish-list';
import { IProduct } from '../models/product';

export class WishlistService extends BaseService {
	constructor() {
		super(Wishlist);
	}

	async find(id: string, headers: any = null) {
		try {
			const wishlist = await Wishlist.findById(id);
			if (!wishlist) {
				return Promise.reject(new AppError('wishlist not found', null, 404));
			}
			return wishlist;
		} catch (error) {
			return Promise.reject(new AppError('Error finding category', error, 500));
		}
	}

	async findAll( headers: any = null) {
		try {
			const wishlist = await Wishlist.find({ user_id: headers.loggeduserid })
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
				Promise.reject(new AppError(constants.MESSAGES.ERRORS.ALREADY_EXIST, null, 400));
			}

			return await Wishlist.create(wishlist);
		} catch (error) {
			return Promise.reject(new AppError('Error creating wishlist', error, 500));
		}
	}

	async updateWishlist(id: string, data: any, headers: any) {
		try {
			const wishlist = await Wishlist.findById(id);

			if (!wishlist) {
				return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}

			const existingProducts: string[] = [];
			data.products.forEach((newProduct: IProduct) => {
				const existingProductIndex = wishlist.products.findIndex((product: IProduct) => product._id === newProduct._id);

				if (existingProductIndex !== -1) {
					existingProducts.push(newProduct.name);
				} else {
					wishlist.products.push(newProduct);
				}
			});

			await wishlist.save();
			if (existingProducts.length > 0) {
				return Promise.reject(new AppError('Products already exist', null, 404));
			}
			if(data.name){
				wishlist.name = data.name;
			}
			await wishlist.save();

			return wishlist;
		} catch (error) {
			return Promise.reject(new AppError('Error updating wishlist', error, 500));
		}
	}

	async delete(id: string, headers: any = null) {
		try {
			const wishlist = await Wishlist.findByIdAndDelete(id);
			if (!wishlist) {
				return Promise.reject( new AppError('wishlist not found', null, 404));
			}
			return wishlist;
		} catch (error) {
			return Promise.reject( new AppError('Error deleting wishlist', error, 500));
		}
	}
async  moveProduct(data: { product: IProduct, sourceWishlistId: string, destinationWishlistId: string }, headers: any = null) {
  try {
    const { product, sourceWishlistId, destinationWishlistId } = data;

    const sourceWishlist = await Wishlist.findById(sourceWishlistId);
    const destinationWishlist= await Wishlist.findById(destinationWishlistId);

    if (!sourceWishlist || !destinationWishlist) {
      return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
    }

    const existingProductIndex = destinationWishlist.products.findIndex(
      (prod: IProduct) => prod._id.toString() === product._id.toString()
    );

    if (existingProductIndex !== -1) {
      return new AppError(constants.MESSAGES.ERRORS.CONFLICT,null, 409);
    }

    const sourceProductIndex = sourceWishlist.products.findIndex((prod: IProduct) => prod._id.toString() === product._id.toString());
    if (sourceProductIndex !== -1) {
      const movedProduct = sourceWishlist.products.splice(sourceProductIndex, 1)[0];
      destinationWishlist.products.push(movedProduct);
    } else {
      return new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
    }

    await sourceWishlist.save();
    await destinationWishlist.save();

    return { message: 'Product moved successfully', destinationWishlist, movedProduct: product };
  } catch (error) {
    return new AppError('Error moving product between wishlists', error, 500);
  }
}
	async removeProduct(id:any,data:any,headers:any){
	try{
		const wishlist  =  await this.find(id)
    	const existingProductIndex = wishlist.products.findIndex((prod: IProduct) => prod._id.toString() === data.product._id.toString());

		if(existingProductIndex ! == -1){
			 wishlist.products.splice(existingProductIndex, 1)[0];
		}
		await wishlist.save();
		return {messsage:"Product deleted successfully"}


	}catch (error) {
		return Promise.reject(new AppError('Error removing product',error, 500))
	}
	}
}
