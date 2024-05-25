import mongoose, { Schema } from "mongoose";

interface ICategory extends IBase {
	name: string;
	parent_id: string;
	image_file: string;
	description: string;
};

const CategorySchema = new Schema({
	image_file: { type: String },
	description: { type: String },
	name: { type: String, required: true, unique: true },
	parent_id: {
		type: Schema.Types.ObjectId,
		ref: 'Category',
		default: null,
	},

	created_at: { type: Date },
	updated_at: { type: Date },
	is_active: { type: Boolean },
	is_deleted: { type: Boolean },
	unique_id: { type: String, required: true },
});

const Category = mongoose.model<ICategory>('Category', CategorySchema);

export {
    ICategory, Category, CategorySchema
}