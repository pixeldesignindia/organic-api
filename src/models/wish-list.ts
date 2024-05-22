import mongoose, { Schema } from 'mongoose';
import { ProductSchema } from '../models/product';
import { IProduct } from './product';

interface IWishlist extends IBase {
	user_id: string;
	name: string;
	products: mongoose.Types.ObjectId[];
}

const WishlistSchema = new Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	name: { type: String, required: true, unique: true },
	products: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        unique: true,
	}

	],
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export { IWishlist, Wishlist, WishlistSchema };
