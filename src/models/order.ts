import mongoose, { Schema, Document } from 'mongoose';

interface ShippingAddress {
	city: string;
	state: string;
	phone: string;
	address: string;
	pinCode: string;
	country: string;
}

interface PaymentInfo {
	id: string;
	type: string;
	status: string;
}

interface Product {
	user_id: string;
	quantity: number;
	category: string;
	productId: string;
	description: string;
	originalPrice: number;
	discountPrice: number;
}

interface IOrder extends IBase {
	paidAt: Date;
	status: string;
	cart: Product[];
	user_id: string;
	created_at: Date;
	deliveredAt: Date;
	updated_at: Date;
	unique_id: string;
	is_active: boolean;
	totalPrice: number;
	is_deleted: boolean;
	paymentInfo: PaymentInfo;
	shippingAddress: ShippingAddress;
}

const OrderSchema = new Schema({
	cart: [
		{
			user_id: { type: String, required: true },
			quantity: { type: Number, required: true },
			category: { type: String, required: true },
			productId: { type: String, required: true },
			originalPrice: { type: Number, required: true },
			discountPrice: { type: Number, required: true },
			description: { type: String, required: true },
		},
	],
	shippingAddress: {
		city: { type: String, required: true },
		phone: { type: String, required: true },
		state: { type: String, required: true },
		pinCode: { type: String, required: true },
		address: { type: String, required: true },
		country: { type: String, required: true },
	},
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null,
	},
	totalPrice: { type: Number, required: true },
	status: {
		type: String,
		enum: ['placed','Transferred to delivery partner', 'processing', 'shipped', 'delivered'],
		default: 'placed',
	},
	paymentInfo: {
		id: { type: String },
		status: { type: String },
		type: { type: String },
	},
	deliveredAt: { type: Date },
	paidAt: { type: Date, default: Date.now() },
	created_at: { type: Date, default: Date.now() },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export { IOrder, Order, OrderSchema };
