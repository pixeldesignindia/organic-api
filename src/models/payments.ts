import mongoose, { Schema } from 'mongoose';


 interface IPayment extends IBase {
	 amount: number;
	 status: string;
	 created_at: Date;
	 updated_at: Date;
	 orderId: string;
	 customerId: string;
	 merchantId: string;
	 transactionId: string;
	 refundTransactionId:string;
	}

const PaymentSchema: Schema = new Schema({
	transactionId: { type: String, required: true, unique: true },
	refundTransactionId:{type: String, },
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
