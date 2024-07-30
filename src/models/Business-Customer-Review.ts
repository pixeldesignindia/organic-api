import mongoose, { Schema } from 'mongoose';

interface IBusiness extends IBase {
    title:string
    founder:string
	file_name: string;
    founder_Name:string
	description: string;

}

const BusinessReviewSchema = new Schema(
	{
		file_name: { type: String},
		title: { type: String, required: true },
		founder: { type: String, required: true },
		description: { type: String, required: true },
		founder_Name: { type: String, required: true },

		created_at: { type: Date },
		updated_at: { type: Date },
		is_active: { type: Boolean },
		is_deleted: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const BusinessReview = mongoose.model<IBusiness>('BusinessReviews', BusinessReviewSchema);

export { BusinessReview, IBusiness, BusinessReviewSchema};
