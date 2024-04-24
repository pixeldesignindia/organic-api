import { BaseService } from './base-serv';
import { ICategory,Category } from "../models/category" ;
import { AppError } from '../models/app-error';
import constants from '../utils/constants';

export class CategoryService extends BaseService {
	constructor() {
		super(Category);
	}
	async find(id: string, headers: any = null) {
		try {
			const category = await Category.findById(id);
			if (!category) {
				throw new AppError('Category not found', null, 404);
			}
			return category;
		} catch (error) {
			throw new AppError('Error finding category', error, 500);
		}
	}

	async filter(data: any = null, headers: any = null) {
		try {
			
			let where: any = {};
			if (data && data.name) {
	
			where.name = {
				$regex: new RegExp(data.name, 'i'),
			};
		}
			const categories = await Category.find(where);
			if (categories.length === 0) {
				throw new AppError('No categories found', null, 404);
			}
			return categories;
		} catch (error) {
			// Throw the error to be caught by the caller
			throw new AppError('Error finding categories', error, 500);
		}
	}

	async findSubCategory(parentId: string, headers: any = null) {
		try {
			const categories = await Category.find({ parent_id: parentId });
			if (categories.length === 0) {
				throw new AppError('No sub-categories found for the given parent ID', null, 404);
			}
			return categories;
		} catch (error) {
			throw new AppError('Error finding sub-categories', error, 500);
		}
	}
	async create(data: any, headers: any = null) {
		try {
			const category = new Category();
			category.is_active = true;
			category.unique_id = this.genericUtil.getUniqueId();
			category.name = data.name;

			// Check if the category already exists
			const checkUniqueness = await Category.findOne({ name: data.name });
			if (checkUniqueness) {
				throw new AppError(constants.MESSAGES.ERRORS.ALREADY_EXIST, null, 400);
			}

			if (data.parent_id) {
				const checkAvailable = await Category.findById({ _id: data.parent_id });
				if (!checkAvailable) {
					throw new AppError('Parent ID not Found', null, 400);
				}
				category.parent_id = data.parent_id;
			}

			const createdCategory = await Category.create(category);
			return createdCategory;
		} catch (error) {
			return error;
		}
	}

	async update(id: any, data: any, headers: any = null) {
		try {
			const category = await this.find(id);

			if (category) {
				const categoryToUpdate = this.getUpdatedCategory(category, data);
				return await Category.updateOne({ _id: id }, categoryToUpdate);
			} else {
				throw new AppError(constants.MESSAGES.ERRORS.NOT_FOUND, null, 404);
			}
		} catch (error) {
			throw new AppError('Error updating category', error, 500);
		}
	}

	getUpdatedCategory(category: ICategory, data: any) {
		const updatedCategory: any = {};

		if (category.hasOwnProperty('name') && data.hasOwnProperty('name')) {
			updatedCategory.name = data.name;
		}
		if (category.hasOwnProperty('is_active') && data.hasOwnProperty('is_active')) {
			updatedCategory.is_active = data.is_active;
		}
		if (category.hasOwnProperty('is_deleted') && data.hasOwnProperty('is_deleted')) {
			updatedCategory.is_deleted = data.is_deleted;
		}

		return updatedCategory;
	}

	async delete(id: string, headers: any = null) {
		try {
			const category = await Category.findByIdAndDelete(id);
			if (!category) {
				throw new AppError('Category not found', null, 404);
			}
			return category;
		} catch (error) {
			throw new AppError('Error deleting category', error, 500);
		}
	}
}