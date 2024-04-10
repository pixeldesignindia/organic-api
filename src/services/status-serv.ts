import { BaseService } from './base-serv';

export class StatusService extends BaseService {
    constructor() {
        super();
    }

    async getStatus() {
        return {
            message: 'Server is running fine'
        };
    }
}