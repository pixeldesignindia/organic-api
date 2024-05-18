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
	tax: number;
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
	shippingCharge:number;
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
	user_id: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null,
	},
	status: {
		type: String,
		default: 'placed',
		enum: ['placed', 'Transferred to delivery partner', 'processing', 'shipped', 'delivered', 'cancelled'],
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
	shippingAddress: AddressSchema,
	tax: { type: Number, default: 0 },
	paidAt: { type: Date, default: Date.now() },
	unique_id: { type: String, required: true },
	totalPrice: { type: Number, required: true },
	shippingCharge: { type: Number, default: 0 },
	created_at: { type: Date, default: Date.now() },
});

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export { IOrder, Order, OrderSchema };
