import mongoose, { Schema } from 'mongoose';

export interface IConfiguration extends IBase {
	cgst: number;
	sgst: number;
	codLimit: number;
	shippingCost: number;
	cartQuantityPerOrder: number;
	productLimitPerOrder: number;
}

const configurationSchema = new Schema({
	cgst: { type: Number },
	sgst: { type: Number },
	codLimit: { type: Number },
	shippingCost:{ type: Number},
	cartQuantityPerOrder: { type: Number },
	productLimitPerOrder: { type: Number },

	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String },
});

const Configuration = mongoose.model<IConfiguration>('Configuration', configurationSchema);

export { Configuration, configurationSchema };
