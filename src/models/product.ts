import mongoose, { Schema } from 'mongoose';
import { ICategory } from './category';

interface ITag extends IBase {
	name: string;
	user_id: string;
}
interface ILike extends IBase {
	user_id: string;
}
interface IComment extends IBase {
	rating: number;
	comment: string;
	user_id: string;
}
interface IBookMark extends IBase {
	user_id: string;
}
interface IRating extends IBase {
	rating: number;
	user_id: string;
}
interface ISku extends IBase {
	name: string;
	size: string;
	stock: number;
	originalPrice: number;
	discountPrice: number;

    
}

interface IProductImage extends IBase {
	name: string;
	file_name: string;
	file_type: string;
	description: string;
	file_extension: string;
	saved_file_name: string;
	is_default: boolean;

	tags: ITag[];
	likes: ILike[];
	ratings: IRating[];
	comments: IComment[];
	bookmarks: IBookMark[];
}

interface IProduct extends IBase {
	_id: any;
	name: string;
	user_id: string;
	made_for: string;
	isGlobal:boolean;
	category: string;
	description: string;
	availablePinCode: [];
	product_image_name: string;
	product_image_saved_name: string;

	end_date: Date;
	start_date: Date;
	isVerified: boolean;
	is_private: boolean;

	liked: boolean; // non db field
	bookmarked: boolean; // non db field

	slip: string;
	template: string;
	skus: ISku[];
	tags: ITag[];
	likes: ILike[];
	ratings: IRating[];
	comments: IComment[];
	bookmarks: IBookMark[];
	images: IProductImage[];
}

/******************** Schema ************************/

const TagSchema = new Schema({
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
});

const LikeSchema = new Schema({
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
});

const CommentSchema = new Schema({
	rating: Number,
	comment: { type: String },
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
});

const BookmarkSchema = new Schema({
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
});

const RatingSchema = new Schema({
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
});

const ProductImageSchema = new Schema({
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
});

const ProductSchema = new Schema({
	name: { type: String, required: true },
	slip: { type: String },
	template: { type: String },
	description: { type: String },
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		required: true,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		index: true,
	},

	isVerified: {
		type: Boolean,
		default: false,
	},
	availablePinCode:[
			{type:String}
		],
		isGlobal:{
			type: Boolean,
            default: false,
		},
	skus: [
		{
			name:{
				type: String,
                required: [true, 'Please enter your product name!'],
			},
			originalPrice: {
				type: Number,
			},
			discountPrice: {
				type: Number,
				required: [true, 'Please enter your product price!'],
			},
			stock: {
				type: Number,
				required: [true, 'Please enter your product stock!'],
			},
			size: {
				type: String,
			},
			created_at: { type: Date },
			updated_at: { type: Date },
			is_deleted: { type: Boolean },
		},
		
	],

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
	unique_id: { type: String, required: true },
});

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

export { ITag, IComment, ILike, Product, IProduct, IProductImage, ICategory, ProductSchema };
