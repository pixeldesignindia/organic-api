import mongoose, { Schema } from 'mongoose';


 interface IPayment extends IBase {
		transactionId: string;
		orderId: string;
		customerId: string;
		merchantId: string;
		amount: number;
		status: string;
		created_at: Date;
		updated_at: Date;
 }

const PaymentSchema: Schema = new Schema({
	transactionId: { type: String, required: true, unique: true },
	orderId: { type: String, required: true },
	merchantId: { type: String, required: true },
	customerId: { type: String, required: true },
	amount: { type: Number, required: true },
	status: { type: String, required: true },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export{Payment,IPayment,PaymentSchema}
