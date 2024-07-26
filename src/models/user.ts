import mongoose, { Schema } from "mongoose";

/**************** Types ***********************/

interface IPasswordReset {
    created_at: Date,
    expiry_date: Date,
    is_active: boolean,
    forgot_password_token: string
}

interface IUser extends IBase {
	pin?: string;
	email: string;
	gender: string;
	mobile: string;
	role_id: string;
	venderId: string;
	password: string;
	username: string;
	last_name: string;
	fcm_token: string;
	user_type: string;
	image_file: string;
	first_name: string;
	deliveredBy: string;
	availableBalance: number;

	role: any;
	password_resets: IPasswordReset[];

	is_test_account: boolean;
}

/**************** Schema ***********************/

const PasswordResetSchema = new Schema(
    {
        created_at: { type: Date },
        expiry_date: { type: Date },
        is_active: { type: Boolean },
        forgot_password_token: { type: String, required: true },
    }
);

const FollowingSchema = new Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        created_at: { type: Date },
        updated_at: { type: Date },
        is_active: { type: Boolean },
        is_deleted: { type: Boolean },
        unique_id: { type: String, required: true },
    }
);

const FollowerSchema = new Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        created_at: { type: Date },
        updated_at: { type: Date },
        is_active: { type: Boolean },
        is_deleted: { type: Boolean },
        unique_id: { type: String, required: true },
    }
);

const userSchema = new Schema(
    {
        pin: { type: String },
        mobile: { type: String },
        password: { type: String },
        username: { type: String },
        last_name: { type: String },
        fcm_token: { type: String },
        image_file: { type: String },
        email: { type: String, unique: true },
        gender: { type: String, required: true },
        user_type: { type: String, required: true },
        first_name: { type: String, required: true },

        followers: [FollowerSchema],
        following: [FollowingSchema],

        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
            index: true,
        },
        venderId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        deliveredBy: {
            type: String,
        },

        password_resets: [PasswordResetSchema],

        is_test_account: { type: Boolean, default: false },
        availableBalance:{
            type: Number,
            default: 0
        },


        created_at: { type: Date },
        updated_at: { type: Date },
        is_active: { type: Boolean },
        is_deleted: { type: Boolean },
        unique_id: { type: String, required: true },
    },
    {
        timestamps: true,
        collection: 'users'
    }
);

const User = mongoose.model<IUser>("User", userSchema);

export { User, IUser, IPasswordReset };
