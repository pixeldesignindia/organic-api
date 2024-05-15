import mongoose, { Schema } from 'mongoose';


interface IAddress extends IBase {
	user_id: string;
	name: string;
	phoneNumber: number;
	address: string;
	landMark: string;
	city: string;
	state: string;
	country: string;
	pinCode: number;
	isDeleted: boolean;
	created_at: Date;
    updated_at: Date;
    is_deleted: boolean;
    is_active: boolean;
    unique_id: string;
}

const AddressSchema = new Schema({
	user_id: {
        type: 'String',
        required: [true, "user id must be provided"]
    },
    name: {
        type: 'String',
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: [true, "city id must be provided"]
    },
    state: {
        type: String,
        required: [true, "state id must be provided"]
    },
    country: {
        type: String,
        required: [true, "country id must be"]
    },
    pinCode: {
        type: Number,
        required: [true, "pin code must be provided"]
    },
    landMark:{
        type: String,
        required: [true, "landMark id must be provided"]
    },
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Address = mongoose.model<IAddress>('Address', AddressSchema);

export { AddressSchema,Address,IAddress};
