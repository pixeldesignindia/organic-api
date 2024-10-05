import mongoose, { Schema } from 'mongoose';

interface IPayment extends IBase {
	amount: number;
	status: string; // E.g., 'initiated', 'completed', 'failed', 'refunded'
	created_at: Date;
	updated_at: Date;
	orderId: string;
	customerId: string;
	merchantId: string;
	transactionId: string; // Your system's transaction ID
	payuTransactionId: string; // PayU's transaction ID
	refundTransactionId: string; // For refund tracking
	paymentMode: string; // E.g., 'CREDIT_CARD', 'NET_BANKING'
	gatewayResponse: any; // Detailed response from PayU for logging/audit
}

const PaymentSchema: Schema = new Schema({
	transactionId: { type: String, required: true, unique: true }, // Your system's transaction ID
	payuTransactionId: { type: String }, // PayU-specific transaction ID
	refundTransactionId: { type: String }, // For refund management
	orderId: { type: String, required: true },
	merchantId: { type: String, required: true },
	customerId: { type: String, required: true },
	amount: { type: Number, required: true },
	status: { type: String, required: true }, // E.g., 'initiated', 'completed', 'failed'
	paymentMode: { type: String, required: true }, // E.g., 'CREDIT_CARD', 'NET_BANKING'
	gatewayResponse: { type: Schema.Types.Mixed }, // Store PayU's full response for audit/logging
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

// Add a pre-save hook to update 'updated_at' on each save
PaymentSchema.pre('save', function (next) {
	this.updated_at = new Date();
	next();
});

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export { Payment, IPayment, PaymentSchema };
