import mongoose, { Schema } from 'mongoose';

interface CartItem {
	productId: string;
	quantity: number;
}

interface ICart extends IBase {
	userId: string;
	items: CartItem[];
}

const CartSchema = new Schema({
	
  userId: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Cart = mongoose.model<ICart>('Cart', CartSchema);

export { ICart, Cart};
