
import { BaseService } from './base-serv';
import { AppError } from '../models/app-error';
import { Address, IAddress } from '../models/address';
import mongoose from 'mongoose';

export class AddressService extends BaseService {
	constructor() {
		super(Address);
	}

	async StoreAddress(data: any, headers: any) {
		try {
			const existAddress = await Address.findOne({ user_id: headers.loggeduserid, is_default: true });
			if (existAddress) {
				existAddress.is_default = false;
				await existAddress.save();
			}

			let address = new Address();
			(address.name = data.name),
				(address.city = data.city),
				(address.state = data.state),
				(address.country = data.country),
				(address.pinCode = data.pinCode),
				(address.address = data.address),
				(address.landMark = data.landMark),
				(address.is_active = true),
				(address.is_default = true),
				(address.updated_at = null),
				(address.is_deleted = false),
				(address.created_at = data.created_at),
				(address.phoneNumber = data.phoneNumber),
				(address.user_id = headers.loggeduserid),
				(address.unique_id = this.genericUtil.getUniqueId());
			return await Address.create(address);
		} catch (error) {
			return new AppError('Failed to create address', error, 500);
		}
	}

	async filter(data: any, headers: any) {
		try {
			const addresses = await Address.find({ user_id: headers.loggeduserid });
			return { success: true, addresses };
		} catch (error) {
			return new AppError('Failed to fetch addresses', error, 500);
		}
	}

	async updateAddress(id: any, data: any, headers: any = null) {
		try {
			const address = await Address.findById(id);
			if (!address) {
				return { success: false, message: 'Address not found' };
			}
			const updatedAddressData = await this.getUpdatedAddressData(data);
	
		 await Address.updateOne({ _id: new mongoose.Types.ObjectId(id) }, updatedAddressData);
			return { success: true, message: 'update successfully' };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch address' };
		}
	}

	async getUpdatedAddressData(data: any) {
	
		let updatedAddressData: any = {};

		if ( data.hasOwnProperty('city')) updatedAddressData.city = data.city;
		if ( data.hasOwnProperty('name')) updatedAddressData.name = data.name;
		if ( data.hasOwnProperty('state')) updatedAddressData.state = data.state;
		if (data.hasOwnProperty('pinCode')) updatedAddressData.pinCode = data.pinCode;
		if (data.hasOwnProperty('country')) updatedAddressData.country = data.country;
		if (data.hasOwnProperty('address')) updatedAddressData.address = data.address;
		if ( data.hasOwnProperty('landMark')) updatedAddressData.landMark = data.landMark;
		if ( data.hasOwnProperty('phoneNumber')) updatedAddressData.phoneNumber = data.phoneNumber;

		return updatedAddressData;
	}
	async delete(id: string) {
		try {
			const address = await Address.findByIdAndDelete(id);
			if (!address) {
				return { success: false, message: 'Address not found' };
			}
			return { success: true, message: 'Address deleted successfully' };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to delete address' };
		}
	}

	async find(id: string) {
		try {
			const address = await Address.findById(id);
			if (!address) {
				return { success: false, message: 'Address not found' };
			}
			return { success: true, address };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch address' };
		}
	}
	async getUpdateToDefault(id: string, headers: any) {
		try {
			const address = await Address.findOne({ user_id: headers.loggeduserid, is_default: true });
			if (!address) {
				return { success: false, message: 'Address not found' };
			}
			address.is_default = false;
			await address.save();
			await Address.findByIdAndUpdate(id, { is_default: true }, { new: true });
			return { success: true, message: 'successfully update as default address' };
		} catch (error) {
			return { success: false, message: error.message || 'Failed to fetch address' };
		}
	}
}
