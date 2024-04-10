import { DateUtil } from '../utils/date-util';
import { GenericUtil } from '../utils/generic-util';

export class BaseService {
    protected db: any;
    protected Type: any;
    protected dateUtil: DateUtil;
    protected genericUtil: GenericUtil;

    constructor(db: any = null, Type: any = null) {
        this.db = db;
        this.Type = Type;

        this.dateUtil = new DateUtil();
        this.genericUtil = new GenericUtil();
    }

    async executeQuery(query: string) {
        return await this.db.executeQuery(query);
    }

    async findRecord(id: any, PassedType: any = null) {
        if (PassedType) {
            return PassedType.findById({ _id: id });
        } else {
            return this.Type.findById({ _id: id });
        }
    }

    async findOneRecord(filter: any, order: any = null, PassedType: any = null, take: number = null) {
        let records;
        if (PassedType) {
            records = await PassedType.findOne(filter);
        } else {
            return await this.Type.findOne(filter);
        }

        if (records && records.length > 0) {
            return records[0];
        } else {
            return null;
        }
    }

    async filterRecords(filter: any, order: any = null, PassedType: any = null, take: number = null) {
        if (PassedType) {
            return await PassedType.find(filter);
        } else {
            return await this.Type.find(filter);
        }
    }

    async storeRecord(data: any, PassedType: any = null) {
        let object;

        if (PassedType) {
            object = new PassedType();
        } else {
            object = new this.Type();
        }

        const updatedObject = { ...object, ...data };

        updatedObject.is_active = true;
        updatedObject.created_at = new Date();
        updatedObject.unique_id = this.genericUtil.getUniqueId();

        return await this.Type.create(updatedObject);
    }

    async updateRecord(id: number, data: any, PassedType: any = null) {
        data.updated_at = new Date();

        if (PassedType) {
            return await PassedType.updateOne({ _id: id }, data);
        } else {
            return await this.Type.updateOne({ _id: id }, data);
        }
    }

    async removeRecord(id: number, PassedType: any = null) {
        if (PassedType) {
            return await PassedType.deleteOne({ _id: id });
        } else {
            return await this.Type.deleteOne({ _id: id });
        }
    }
}