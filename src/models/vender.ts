import mongoose, { Schema } from 'mongoose';

interface IVender extends IBase {
	GST: string;
	city: string;
	state: string;
	status:string;
	phone: number;
	email: string;
	country: string;
	pinCode: number;
	user_id: string;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date;
	unique_id: string;
	firm_name: string;
	is_active: boolean;
	is_deleted: boolean;
	firm_address: string;
}

const VenderSchema = new Schema({
	status: {
		type: String,
		enum: ['PENDING', 'SUCCESS', 'REJECTED'],
		default: 'PENDING',
	},
	country: {
		type: String,
		required: [true, 'country  must be'],
	},
	city: {
		type: String,
		required: [true, 'city  must be provided'],
	},
	pinCode: {
		type: Number,
		required: [true, 'pincode must be provided'],
	},
	state: {
		type: String,
		required: [true, 'state  must be provided'],
	},

	email: {
		type: String,
		required: [true, 'email must be provided'],
		unique: true,
	},
	GST: {
		type: String,
		required: [true, 'GST number must be provided'],
	},
	phone: {
		type: Number,
		required: [true, 'phone number must be provided'],
	},
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
	firm_address: { type: String, required: true },
	firm_name: { type: String, required: true, unique: true },
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Vender = mongoose.model<IVender>('Vender', VenderSchema);

export { IVender, Vender, VenderSchema };