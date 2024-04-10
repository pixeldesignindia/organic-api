import * as jwt from 'jsonwebtoken';

import appConfig from '../config/app-config';
import { EncryptionUtil } from '../utils/encryption-util';

export class JwtUtil {
    encryptionUtil: EncryptionUtil;

    constructor() {
        this.encryptionUtil = new EncryptionUtil();
    }

    /**
     *  Generates JWT token for given token key
     *  @author Ashutosh Pandey
     *  @function
     *  @name getFieldsToUpdate
     *  @param {String} tokenKey
     *  @return {String} generated token
     */
    generateJWTToken(tokenKey: any, id: number) {
        // get JWT Token and send it back
        let secretKey = appConfig.SERVER_KEYS.SERVER_SECRET;

        let data = {
            id: id,
            TOKEN_KEY: tokenKey,
            issuer: appConfig.APP_NAME
        };

        let token = jwt.sign(data, secretKey, {
            expiresIn: appConfig.JWT_EXPIRY_SECONDS
        });

        return this.encryptionUtil.encryptWithCrypto(token);
    };

    /**
     *  Generates refresh token
     *  @author Ashutosh Pandey
     *  @function
     *  @name generateRefreshToken
     *  @return {Number} id
     */
    generateRefreshToken(tokenKey: any, id: number) {
        let secretKey = appConfig.SERVER_KEYS.REFRESH_SERVER_SECRET;

        let data = {
            id: id,
            TOKEN_KEY: tokenKey,
            issuer: appConfig.APP_NAME
        };

        let token = jwt.sign(data, secretKey, {
            expiresIn: appConfig.JWT_REFRESH_EXPIRY_TIME
        });

        return this.encryptionUtil.encryptWithCrypto(token);
    };

    /**
     *  Verifies refresh token
     *  @author Ashutosh Pandey
     *  @function
     *  @name verifyRefreshToken
     *  @param {String} refreshToken
     */
    verifyRefreshToken(refreshToken: string) {
        let result = {};

        return new Promise((resolve, reject) => {
            if (refreshToken) {
                let secretKey = appConfig.SERVER_KEYS.REFRESH_SERVER_SECRET;

                if (secretKey) {
                    let decryptedToken = this.encryptionUtil.decryptWithCrypto(refreshToken);

                    jwt.verify(decryptedToken, secretKey, function (err: any, payload: any) {
                        if (err) {
                            result = {
                                valid: false,
                                message: 'Failed to verify token.'
                            }
                        } else {
                            result = {
                                valid: true,
                                id: payload.id
                            }
                        }

                        resolve(result);
                    });
                } else {
                    // if there is no secret key
                    result = {
                        valid: false
                    }

                    resolve(result);
                }
            } else {
                // if there is no token
                result = {
                    valid: false,
                    message: 'No token provided.'
                }

                resolve(result);
            }
        });
    };

    /**
     *  Verify JWT token for given token key
     *  @author Ashutosh Pandey
     *  @function
     *  @name verifyJWTToken
     *  @param {String} authToken
     */
    async verifyJWTToken(authToken: any) {
        let result = {};

        return new Promise((resolve, reject) => {
            let token;
            if (authToken && authToken.indexOf('Bearer ') > -1)
                token = authToken.split(' ')[1];
            else
                token = authToken;

            let secretKey = appConfig.SERVER_KEYS.SERVER_SECRET;

            if (secretKey) {
                let decryptedToken = this.encryptionUtil.decryptWithCrypto(token);

                jwt.verify(decryptedToken, secretKey, function (err: any, decoded: any) {
                    if (err) {
                        result = {
                            valid: false,
                            message: 'Failed to verify token.'
                        }
                    } else {
                        result = {
                            valid: true,
                            id: decoded.id
                        }
                    }

                    resolve(result);
                });
            } else {
                // if there is no secret key
                result = {
                    valid: false
                }

                resolve(result);
            }
        });
    };

    /**
     *  Get id from token
     *  @author Ashutosh Pandey
     *  @function
     *  @name getIdFromToken
     *  @return {String} authToken
     */
    async getIdFromToken(authToken: any) {
        let result = {};

        return new Promise((resolve, reject) => {
            let token;
            if (authToken && authToken.indexOf('Bearer ') > -1)
                token = authToken.split(' ')[1];
            else
                token = authToken;

            let secretKey = appConfig.SERVER_KEYS.SERVER_SECRET;

            if (secretKey) {
                let decryptedToken = this.encryptionUtil.decryptWithCrypto(token);

                jwt.verify(decryptedToken, secretKey, function (err: any, decoded: any) {
                    if (err) {
                        result = {
                            valid: false,
                            message: 'Failed to verify token.'
                        }
                    } else {
                        result = {
                            id: decoded.id
                        }
                    }

                    resolve(result);
                });
            } else {
                // if there is no secret key
                result = {
                    valid: false
                }

                resolve(result);
            }
        });
    };

    isValidRequestData(params: any, decoded: any) {
        let tokenKey = decoded.TOKEN_KEY;

        return true;
    };
}