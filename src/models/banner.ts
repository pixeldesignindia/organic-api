import mongoose, { Schema } from 'mongoose';

interface IBanner extends IBase {
	name: string;
    link:string;
	title:string;
	image_file: string;
	description: string;
	mobile_image_file:string;
}

const BannerSchema = new Schema({
	image_file: { type: String },
	mobile_image_file:{type: String },
	description: { type: String },
	title:{type:String},
    link:{ type: String},
	name: { type: String },
	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Banner = mongoose.model<IBanner>('Banner', BannerSchema);

export { IBanner, Banner, BannerSchema };
