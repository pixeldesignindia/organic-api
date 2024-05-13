import mongoose, { Schema } from 'mongoose';

interface WishlistItem {
	productId: string;
	quantity: number;
}

interface IWishlist extends IBase {
	userId: string;
    name: string;
	items: WishlistItem[];
}

const WishlistSchema = new Schema({
	userId: { type: String, required: true },
    name: { type: String, required: true ,unique: true },
	items: [
		{
			productId: {
				required: true,
				type: Schema.Types.ObjectId,
				ref: 'Product',
			},
			quantity: { type: Number, required: true },
		},
	],
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Cart = mongoose.model<IWishlist>('Wishlist', WishlistSchema);

export { IWishlist, Cart, WishlistItem};
