import mongoose, { Schema, Document } from 'mongoose';
import { AddressSchema } from './address';

interface ShippingAddress {
	city: string;
	email: string;
	state: string;
	phone: string;
	address: string;
	pinCode: string;
	country: string;
	last_name: string;
	first_name: string;
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
			productId: {
				required: true,
				type: Schema.Types.ObjectId,
				ref: 'Product',
			},
			description: { type: String, required: true },
			discountPrice: { type: Number, required: true },
			originalPrice: { type: Number, required: true },
		},
	],
	shippingAddress:AddressSchema,
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null,
	},
	totalPrice: { type: Number, required: true },
	status: {
		type: String,
		default: 'placed',
		enum: ['placed', 'Transferred to delivery partner', 'processing', 'shipped', 'delivered'],
	},
	paymentInfo: {
		id: { type: String },
		type: { type: String },
		status: { type: String },
	},
	updated_at: { type: Date },
	deliveredAt: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	paidAt: { type: Date, default: Date.now() },
	unique_id: { type: String, required: true },
	created_at: { type: Date, default: Date.now() },
});

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export { IOrder, Order, OrderSchema };
