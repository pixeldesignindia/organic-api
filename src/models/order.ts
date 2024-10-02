import mongoose, { Schema, Document } from 'mongoose';
import { AddressSchema } from './address';

// Define interfaces for the schema
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
    id?: string;  // Optional for cases like COD
    type: string;
    status: string;
}

interface Product {
    size: string;
    user_id: string;
    quantity: number;
    category: string;
    productId: string;
    description: string;
    originalPrice: number;
    discountPrice: number;
    productSkuName: string;
    productCommissionAmount: number;
}

interface IOrder extends Document {
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
    shippingCharge: number;
    paymentStatus: string;
    paymentInfo: PaymentInfo;
    shippingAddress: ShippingAddress;
    delivery_partner_id: Schema.Types.ObjectId;
    deliveredBy: string;
}

// Define the OrderSchema
const OrderSchema = new Schema<IOrder>({
    cart: [
        {
            user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            quantity: { type: Number, required: true },
            category: { type: String, required: true },
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            size: { type: String, required: true },
            productSkuName: { type: String, required: true },
            description: { type: String, required: true },
            discountPrice: { type: Number, required: true },
            originalPrice: { type: Number, required: true },
            productCommissionAmount: { type: Number, required: true },
        },
    ],
    user_id: {
        type:String,
        ref: 'User',
    },
    status: {
        type: String,
        default: 'placed',
        enum: [
            'pending',
            'placed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'returned',
            'failed',
            'Transferred to delivery partner',
            'return product',
            'pickup from user',
            'received product by vendor',
        ],
    },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    paymentInfo: {
        id: { type: String, default: null }, // Razorpay payment ID, optional for COD
        type: { type: String, enum: ['Razorpay', 'COD'], required: true },
        status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    },
    updated_at: { type: Date, default: Date.now },
    deliveredAt: { type: Date, default: null },
    is_active: { type: Boolean, default: true },
    is_deleted: { type: Boolean, default: false },
    shippingAddress: AddressSchema,
    tax: { type: Number, default: 0 },
    paidAt: { type: Date, default: null }, // Null for COD, actual date for Razorpay payments
    unique_id: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    delivery_partner_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deliveredBy: {
        type: String,
        required: true,
        default: 'Admin',
    },
});

// Create and export the Order model
const Order = mongoose.model<IOrder>('Order', OrderSchema);

export { IOrder, Order, OrderSchema };
