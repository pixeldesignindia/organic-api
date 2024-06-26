import mongoose, { Schema } from 'mongoose';
import { CategorySchema, ICategory } from './category';

interface ITag extends IBase {
    name: string,
    user_id: string
};
interface ILike extends IBase {
    user_id: string
};
interface IComment extends IBase {
    comment: string,
    user_id: string
};
interface IBookMark extends IBase {
    user_id: string
};
interface IRating extends IBase {
    rating: number,
    user_id: string
};

interface IProductImage extends IBase {
    name: string,
    file_name: string,
    file_type: string,
    description: string,
    file_extension: string,
    saved_file_name: string,

    is_default: boolean,

    tags: ITag[],
    likes: ILike[],
    ratings: IRating[],
    comments: IComment[],
    bookmarks: IBookMark[],
};

interface IProduct extends IBase {
    name: string,
    user_id: string,
    made_for: string,
    description: string,
    product_image_name: string,
    product_image_saved_name: string

    category: ICategory,

    end_date: Date,
    start_date: Date,
    is_private: boolean,

    liked: boolean,         // non db field
    bookmarked: boolean,    // non db field

    slip: string,
    template: string,

    tags: ITag[],
    likes: ILike[],
    ratings: IRating[],
    comments: IComment[],
    bookmarks: IBookMark[],
    images: IProductImage[],
};

/******************** Schema ************************/

const TagSchema = new Schema(
    {
        name: { type: String, required: true },
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

const LikeSchema = new Schema(
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

const CommentSchema = new Schema(
    {
        comment: { type: String, required: true },
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

const BookmarkSchema = new Schema(
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

const RatingSchema = new Schema(
    {
        rating: Number,
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

const ProductImageSchema = new Schema(
    {
        name: { type: String, required: true },
        file_type: { type: String, required: true },
        file_name: { type: String, required: true },
        description: { type: String },
        file_extension: { type: String, required: true },
        saved_file_name: { type: String, required: true },

        tags: [TagSchema],
        likes: [LikeSchema],
        ratings: [RatingSchema],
        comments: [CommentSchema],
        bookmarks: [BookmarkSchema],

        created_at: { type: Date },
        updated_at: { type: Date },
        is_active: { type: Boolean },
        is_default: { type: Boolean },
        is_deleted: { type: Boolean },
        unique_id: { type: String, required: true },
    }
);

const ProductSchema = new Schema(
    {
        name: { type: String, required: true },
        slip: { type: String },
        template: { type: String },
        description: { type: String },
        category: CategorySchema,
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        tags: [TagSchema],
        likes: [LikeSchema],
        ratings: [RatingSchema],
        comments: [CommentSchema],
        bookmarks: [BookmarkSchema],
        images: [ProductImageSchema],

        created_at: { type: Date },
        updated_at: { type: Date },
        is_private: { type: Boolean },
        is_active: { type: Boolean },
        is_deleted: { type: Boolean },
        unique_id: { type: String, required: true }
    }
);

ProductSchema.index({
    name: 'text',
    description: 'text',
    'product_type.name': 'text',
    // For simplicity, assuming tags and collections names can be directly indexed
    // This may require adjustments based on your actual schema and data structure
    'tags.name': 'text',
    'collections.name': 'text',
});

const Product = mongoose.model<IProduct>('Product', ProductSchema);

export {
    ITag, IComment, ILike,
    Product, IProduct, IProductImage, ICategory
}