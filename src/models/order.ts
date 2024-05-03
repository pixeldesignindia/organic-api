import mongoose, { Schema } from 'mongoose';

interface IOrder extends IBase {

}

const OrderSchema = new Schema({
	
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Order = mongoose.model<IOrder>('Category', OrderSchema);

export { IOrder, Order, OrderSchema };
