const axios = require('axios');

export class HttpUtil {
    constructor() {
    }

    async callPost(axiosConfig: any) {
        return new Promise((resolve, reject) => {
            axios(axiosConfig)
                .then((res: any) => {
                    resolve(res);
                }).catch((err: any) => {
                    reject(err);
                });
        });
    }
}