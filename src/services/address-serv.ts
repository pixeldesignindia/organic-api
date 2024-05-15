
import { AppError } from '../models/app-error';
import { Address, IAddress } from '../models/address';
import { BaseService } from './base-serv';

export class AddressService extends BaseService {
	constructor() {
		super(Address);
	}

	async StoreAddress(data: any, headers: any) {
		try {
			let address = new Address();

			(address.name = data.name),
				(address.address = data.address),
				(address.city = data.city),
				(address.state = data.state),
				(address.country = data.country),
				(address.pinCode = data.pinCode),
				(address.landMark = data.landMark),
				(address.is_active = true),
				(address.updated_at = null),
				(address.is_deleted = false),
				(address.created_at = data.created_at),
				(address.user_id = headers.loggeduserid),
				(address.unique_id = this.genericUtil.getUniqueId());
			return await Address.create(address);
		} catch (error) {
			return new AppError('Failed to create address', error, 500);
		}
	}

	async filter(data: any, headers: any) {
		try {
			const addresses = await Address.find({ user_id:headers.loggeduserid });
			return { success: true, addresses };
		} catch (error) {
			return new AppError('Failed to fetch addresses', error, 500);
		}
	}

	async updateAddress(id: any, data: any, headers: any = null) {
try {
            const address = await this.find(id);
            if (address) {
            
			const updatedData =await this.getUpdatedAddressData(data,address);
			const updatedAddress = await Address.findByIdAndUpdate(id, updatedData, { new: true });
			return {
				success: true,
				message: 'Address updated successfully',
				address: updatedAddress,
			};
        }
	} catch (error) {
			return {
				success: false,
				message: error.message || 'Failed to update address',
			};
		}
	}

	async getUpdatedAddressData(address:IAddress,data: any) {
		let updatedAddressData: any = {};

		if (address.hasOwnProperty('name') && data.hasOwnProperty('name')) updatedAddressData.name = data.name;
		if (address.hasOwnProperty('phoneNumber') && data.hasOwnProperty('phoneNumber')) updatedAddressData.phoneNumber = data.phoneNumber;
		if (address.hasOwnProperty('address') && data.hasOwnProperty('address')) updatedAddressData.address = data.address;
		if (address.hasOwnProperty('landMark') && data.hasOwnProperty('landMark')) updatedAddressData.landMark = data.landMark;
		if (data.hasOwnProperty('city') && data.hasOwnProperty('city')) updatedAddressData.city = data.city;
		if (data.hasOwnProperty('state') && data.hasOwnProperty('state')) updatedAddressData.state = data.state;
		if (data.hasOwnProperty('country') && data.hasOwnProperty('country')) updatedAddressData.country = data.country;
		if (data.hasOwnProperty('pinCode') && data.hasOwnProperty('pinCode')) updatedAddressData.pinCode = data.pinCode;

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
}
