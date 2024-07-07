import { BaseService } from './base-serv';
import { AppError } from '../models/app-error';
import { Configuration, IConfiguration } from '../models/configuration';

export class ConfigurationService extends BaseService {
	constructor() {
		super(Configuration);
	}

	async getConfiguration(): Promise<IConfiguration | AppError> {
		try {
			const config = await Configuration.findOne().exec();
			if (!config) {
				return new AppError('Configuration not found', null, 404);
			}
			return config;
		} catch (error) {
			console.error('Error getting configuration:', error);
			return new AppError('Failed to get configuration', error, 500);
		}
	}

	async createConfiguration(data: Partial<IConfiguration>): Promise<IConfiguration | AppError> {
		try {
			const config = await Configuration.create(data);
			return config;
		} catch (error) {
			console.error('Error creating configuration:', error);
			return new AppError('Failed to create configuration', error, 500);
		}
	}

	async updateConfiguration(id: string, updates: Partial<IConfiguration>): Promise<IConfiguration | AppError> {
		try {
			const config = await Configuration.findById(id).exec();
			if (!config) {
				return new AppError('Configuration not found', null, 404);
			}

			if (updates.cgst !== undefined) config.cgst = updates.cgst;
			if (updates.sgst !== undefined) config.sgst = updates.sgst;
			if (updates.codLimit !== undefined) config.codLimit = updates.codLimit;
            if (updates.shippingCost !== undefined) config.shippingCost = updates.shippingCost ;
			if (updates.profitPercent !== undefined) config.profitPercent = updates.profitPercent;
			if (updates.cartQuantityPerOrder !== undefined) config.cartQuantityPerOrder = updates.cartQuantityPerOrder;
			if (updates.productLimitPerOrder !== undefined) config.productLimitPerOrder = updates.productLimitPerOrder;

			await config.save();
			return config;
		} catch (error) {
			console.error('Error updating configuration:', error);
			return new AppError('Failed to update configuration', error, 500);
		}
	}
}
