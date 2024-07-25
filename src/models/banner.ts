import mongoose, { Schema } from 'mongoose';

interface IBanner extends IBase {
	name: string;
    link:string;
	image_file: string;
	description: string;
}

const BannerSchema = new Schema({
	image_file: { type: String },
	description: { type: String },
	name: { type: String, required: true },
    link:{ type: String, required: true,},
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Banner = mongoose.model<IBanner>('Banner', BannerSchema);

export { IBanner, Banner, BannerSchema };
