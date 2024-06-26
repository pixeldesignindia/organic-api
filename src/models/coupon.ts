import mongoose, { Schema } from 'mongoose';

interface ICoupon extends IBase {
	code: string;
	discount: number;
	expirationDate: Date;
	isValid: () => boolean;
}

const couponSchema = new Schema({
    discount: { type: Number, required: true },
	expirationDate: { type: Date, required: true },
	code: { type: String, required: true, unique: true },
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});
couponSchema.methods.isValid = function () {
	return this.expirationDate > new Date();
};
const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);

export { ICoupon, Coupon, couponSchema };
