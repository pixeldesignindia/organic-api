import mongoose, { Schema } from "mongoose";

interface ICategory extends IBase {
	name: string;
	description: string;
	parent_id: string;
};

const CategorySchema = new Schema({
	name: { type: String, required: true, unique: true },
	description: { type: String },
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