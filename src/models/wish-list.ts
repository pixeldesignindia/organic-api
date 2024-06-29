import mongoose, { Schema } from 'mongoose';
interface productItem {
	productId: string;
	productSkuName: string;
}
interface IWishlist extends IBase {
	user_id: string;
	name: string;
	products:productItem[];
}

const WishlistSchema = new Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	name: { type: String, required: true},
	products: [{
			productId: {
				required: true,
				type: Schema.Types.ObjectId,
				ref: 'Product',
			},
			productSkuName: { type: String, required: true },
		},

	],
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});
const Wishlist = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export { IWishlist, Wishlist, WishlistSchema };
