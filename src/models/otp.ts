import mongoose, { Schema } from "mongoose";

type OTPDocument = {
    code: number,
    created_at: Date
};

const OTPSchema = new Schema(
    {
        code: { type: Number, required: true },

        created_at: { type: Date },
        updated_at: { type: Date },
        is_active: { type: Boolean },
        is_deleted: { type: Boolean },
        unique_id: { type: String, required: true },
    }
);

const OTP = mongoose.model<OTPDocument>("OTPs", OTPSchema);

export { OTP, OTPDocument, OTPSchema };
