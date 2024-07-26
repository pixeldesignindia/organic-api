import * as jwt from 'jsonwebtoken';
import appConfig from '../config/app-config';
import { EncryptionUtil } from '../utils/encryption-util';

export class JwtUtil {
	encryptionUtil: EncryptionUtil;

	constructor() {
		this.encryptionUtil = new EncryptionUtil();
	}

	generateJWTToken(tokenKey: any, id: string) {
		let secretKey = appConfig.SERVER_KEYS.SERVER_SECRET;
		let data = {
			id: id,
			TOKEN_KEY: tokenKey,
			issuer: appConfig.APP_NAME,
		};

		let token = jwt.sign(data, secretKey, {
			expiresIn: appConfig.JWT_EXPIRY_SECONDS,
		});
		return this.encryptionUtil.encryptWithCrypto(token);
	}

	generateRefreshToken(tokenKey: any, id: string) {
		let secretKey = appConfig.SERVER_KEYS.REFRESH_SERVER_SECRET;
		let data = {
			id: id,
			TOKEN_KEY: tokenKey,
			issuer: appConfig.APP_NAME,
		};

		let token = jwt.sign(data, secretKey, {
			expiresIn: appConfig.JWT_REFRESH_EXPIRY_TIME,
		});
		return this.encryptionUtil.encryptWithCrypto(token);
	}

	verifyRefreshToken(refreshToken: string) {
		return new Promise((resolve, reject) => {
			if (refreshToken) {
				let secretKey = appConfig.SERVER_KEYS.REFRESH_SERVER_SECRET;

				if (secretKey) {
					let decryptedToken;
					try {
						decryptedToken = this.encryptionUtil.decryptWithCrypto(refreshToken);
					} catch (err) {
						console.error('Error decrypting token:', err);
						resolve({
							valid: false,
							message: 'Failed to decrypt token.',
						});
						return;
					}

					jwt.verify(decryptedToken, secretKey, { algorithms: ['HS256'] }, function (err: any, payload: any) {
						if (err) {
							console.error('Error verifying token:', err);
							resolve({
								valid: false,
								message: 'Failed to verify token.',
							});
						} else {
							resolve({
								valid: true,
								id: payload.id,
							});
						}
					});
				} else {
					resolve({
						valid: false,
						message: 'Secret key is missing.',
					});
				}
			} else {
				resolve({
					valid: false,
					message: 'No token provided.',
				});
			}
		});
	}

	async verifyJWTToken(authToken: any) {
		return new Promise((resolve, reject) => {
			let token;
			if (authToken && authToken.indexOf('Bearer ') > -1) token = authToken.split(' ')[1];
			else token = authToken;

			let secretKey = appConfig.SERVER_KEYS.SERVER_SECRET;

			if (secretKey) {
				let decryptedToken;
				try {
					decryptedToken = this.encryptionUtil.decryptWithCrypto(token);
				} catch (err) {
					console.error('Error decrypting token:', err);
					resolve({
						valid: false,
						message: 'Failed to decrypt token.',
					});
					return;
				}

				jwt.verify(decryptedToken, secretKey, function (err: any, decoded: any) {
					if (err) {
						console.error('Error verifying token:', err);
						resolve({
							valid: false,
							message: 'Failed to verify token.',
						});
					} else {
						resolve({
							valid: true,
							id: decoded.id,
						});
					}
				});
			} else {
				resolve({
					valid: false,
					message: 'Secret key is missing.',
				});
			}
		});
	}

	async getIdFromToken(authToken: any) {
		return new Promise((resolve, reject) => {
			let token;
			if (authToken && authToken.indexOf('Bearer ') > -1) token = authToken.split(' ')[1];
			else token = authToken;

			let secretKey = appConfig.SERVER_KEYS.SERVER_SECRET;

			if (secretKey) {
				let decryptedToken;
				try {
					decryptedToken = this.encryptionUtil.decryptWithCrypto(token);
				} catch (err) {
					resolve({
						valid: false,
						message: 'Failed to decrypt token.',
					});
					return;
				}

				jwt.verify(decryptedToken, secretKey, function (err: any, decoded: any) {
					if (err) {

						resolve({
							valid: false,
							message: 'Failed to verify token.',
						});
					} else {
						resolve({
							id: decoded.id,
						});
					}
				});
			} else {
				resolve({
					valid: false,
					message: 'Secret key is missing.',
				});
			}
		});
	}

	isValidRequestData(params: any, decoded: any) {
		let tokenKey = decoded.TOKEN_KEY;
		return true;
	}
}
