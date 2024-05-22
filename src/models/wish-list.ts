import mongoose, { Schema } from 'mongoose';
import { ProductSchema } from '../models/product';
import { IProduct } from './product';

interface IWishlist extends IBase {
	user_id: string;
	name: string;
	products: IProduct[];
}

const WishlistSchema = new Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	name: { type: String, required: true, unique: true },
	products: [ProductSchema],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export { IWishlist, Wishlist, WishlistSchema };
