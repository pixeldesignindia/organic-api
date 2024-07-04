import mongoose, { Schema } from 'mongoose';

export interface IConfiguration extends IBase {
	cgst: number;
	sgst: number;
	codLimit: number;
	cartQuantityPerOrder: number;
	productLimitPerOrder: number;
}

const configurationSchema = new Schema({
	cgst: { type: Number, required: true },
	sgst: { type: Number, required: true },
	codLimit: { type: Number, required: true },
	cartQuantityPerOrder: { type: Number, required: true },
	productLimitPerOrder: { type: Number, required: true },

	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String },
});

const Configuration = mongoose.model<IConfiguration>('Configuration', configurationSchema);

export { Configuration, configurationSchema };
