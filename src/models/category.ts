import mongoose, { Schema } from "mongoose";

interface ICategory extends IBase {
    name: string,
    description: string
};

const CategorySchema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },

        created_at: { type: Date },
        updated_at: { type: Date },
        is_active: { type: Boolean },
        is_deleted: { type: Boolean },
        unique_id: { type: String, required: true },
    }
);

const Category = mongoose.model<ICategory>('Category', CategorySchema);

export {
    ICategory, Category, CategorySchema
}