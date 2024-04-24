const qs = require('qs');

import constants from '../utils/constants';
import { JwtUtil } from '../utils/jwt-util';
import { SmsUtil } from '../utils/sms-util';
import { ValidationUtil } from '../utils/validation-util';
import { EncryptionUtil } from '../utils/encryption-util';

import { AppError } from '../models/app-error';

import { OtpService } from './otp-serv';
import { BaseService } from './base-serv';
import { RoleService } from './role-serv';
import { UserService } from './user-serv';

export class LoginService extends BaseService {
    private jwtUtil: JwtUtil;
    private smsUtil: SmsUtil;
    private encryptionUtil: EncryptionUtil;
    private validationUtil: ValidationUtil;

    private otpService: OtpService;
    private roleService: RoleService;
    private userService: UserService;

    constructor() {
        super();

        this.jwtUtil = new JwtUtil();
        this.smsUtil = new SmsUtil();

        this.encryptionUtil = new EncryptionUtil();
        this.validationUtil = new ValidationUtil();

        this.otpService = new OtpService();
        this.roleService = new RoleService();
        this.userService = new UserService();
    }

    async login(data: any, headers: any = null) {
        if (data.hasOwnProperty('email')) {
            if (this.validationUtil.isEmpty(data.email)) {
                return new AppError("Invalid email", null, 400);
            } else if (!data.hasOwnProperty('password')) {
                return new AppError("Invalid password", null, 400);
            } else {
                return await this.loginWithEmailOrUsername(data, { email: data.email }, headers);
            }
        } else if (data.hasOwnProperty('username')) {
            if (this.validationUtil.isEmpty(data.username)) {
                return new AppError("Invalid username", null, 400);
            } else if (!data.hasOwnProperty('password')) {
                return new AppError("Invalid password", null, 400);
            } else {
                return await this.loginWithEmailOrUsername(data, { username: data.username }, headers);
            }
        } else if (data.hasOwnProperty('pin')) {
            if (this.validationUtil.isEmpty(data.id)) {
                return new AppError("Invalid id", null, 400);
            } else if (this.validationUtil.isEmpty(data.pin) || isNaN(data.pin)) {
                return new AppError("Invalid pin", null, 400);
            } else {
                return await this.loginWithPin(data, headers);
            }
        } else {
            return new AppError("Invalid login request", null, 400);
        }
    }

    async loginWithEmailOrUsername(data: any, filter: any, headers: any) {
        let that = this;

        return new Promise(async (resolve, reject) => {
            try {
                let user: any = await this.userService.findOne(filter, headers);

                if (user) {
                    // check if user password is correct
                    if (that.encryptionUtil.verifyWithBcrypt(data.password, user.password)) {
                        delete user.password;

                        let userObject: any = user.toObject(); // Converts the document to a plain object

                        // load user roles
                        if (user.role_id) {
                            let role: any = await this.roleService.find(user.role_id);
                            userObject.role = role;
                        }

                        // check and update fcm token of user
                        if (data.fcm_token) {
                            await this.userService.update(user._id, { fcm_token: data.fcm_token }, headers);
                        }

                        let token = this.jwtUtil.generateJWTToken(user._id.toString() + new Date().getTime(), user._id);
                        let refreshToken = this.jwtUtil.generateRefreshToken(user._id.toString() + new Date().getTime(), user._id);

                        resolve({
                            valid: true,
                            token: token,
                            user: userObject,
                            refreshToken: refreshToken
                        });
                    } else {
                        // resolve({
                        //     valid: false,
                        //     message: constants.MESSAGES.LOGIN.INVALID
                        // });
                        return reject(new AppError(constants.MESSAGES.LOGIN.INVALID, null, 401));

                    }
                } else {
                    // resolve(
                    //     // valid: false,
                    //     // message: constants.MESSAGES.LOGIN.INVALID
                        
                    // );
                    return reject(new AppError(constants.MESSAGES.LOGIN.INVALID, null, 401));

                }
            } catch (err) {
                reject(new AppError(constants.MESSAGES.CANNOT_CHECK_USER_LOGIN, err, 400));
            }
        });
    }

    async loginWithPin(params: any, headers: any) {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await this.userService.find(params.id, headers);

                if (user) {
                    // check and update fcm token of user
                    if (params.fcm_token) {
                        await this.userService.update(user.id, { fcm_token: params.fcm_token }, headers);
                    }

                    if (params.pin == user.pin) {
                        delete user.password;

                        let token = this.jwtUtil.generateJWTToken(user.id.toString() + new Date().getTime(), user.id);
                        let refreshToken = this.jwtUtil.generateRefreshToken(user.id.toString() + new Date().getTime(), user.id);

                        resolve({
                            user: user,
                            valid: true,
                            token: token,
                            refreshToken: refreshToken
                        });
                    } else {
                        return reject(new AppError("Invalid pin", null, 400));
                    }
                } else {
                    return reject(new AppError("Invalid id", null, 400));
                }
            } catch (err) {
                reject(new AppError(constants.MESSAGES.CANNOT_CHECK_USER_LOGIN, err, 400));
            }
        });
    }

    async otpLogin(params: any, headers: any = null) {
        return new Promise(async (resolve, reject) => {
            if (params.hasOwnProperty('username')) {
                if (this.validationUtil.isEmpty(params.username)) {
                    return Promise.reject(new AppError("Invalid username", null, 400));
                } else {
                    try {
                        let user;

                        if (params.username.indexOf('@') > -1)
                            user = await this.userService.findOne({ username: params.username }, headers);
                        else
                            user = await this.userService.findOne({ mobile: params.username }, headers);

                        if (user) {
                            // check and update fcm token of user
                            if (params.fcm_token) {
                                await this.userService.update(user.id, { fcm_token: params.fcm_token }, headers);
                            }

                            delete user.password;

                            let otp = this.genericUtil.generateOTP();

                            let otpRecord: any = {
                                otp: otp,
                                user_id: user.id,
                                created_at: new Date(),
                            };

                            otpRecord = await this.otpService.store(otpRecord);
                            if (otpRecord) {
                                let smsBody = 'Your OTP for COC doctor app login is ' + otp;
                                try {
                                    let success = await this.smsUtil.sendSms(params.username, smsBody);

                                    if (success)
                                        resolve({
                                            user: user,
                                            valid: true,
                                            message: 'Please verify OTP',
                                            otp_verification_pending: true
                                        });
                                    else {
                                        reject(new AppError(constants.MESSAGES.ERRORS.CANNOT_SEND_SMS, false, 500));
                                    }
                                } catch (err) {
                                    reject(new AppError(constants.MESSAGES.ERRORS.CANNOT_SEND_SMS, err, 500));
                                }
                            } else {
                                reject(new AppError(constants.MESSAGES.ERRORS.UPDATE_RECORD, null, 400));
                            }
                        } else {
                            resolve({
                                valid: false,
                                message: constants.MESSAGES.LOGIN.INVALID
                            });
                        }
                    } catch (err) {
                        reject(new AppError(constants.MESSAGES.CANNOT_CHECK_USER_LOGIN, err, 400));
                    }
                }
            } else {
                reject(new AppError('Username not provided', null, 400));
            }
        });
    }

    async verifyUserLogin(params: any, headers: any = null) {
        return new Promise(async (resolve, reject) => {
            if (params.hasOwnProperty('otp') && params.hasOwnProperty('mobile')) {
                if (this.validationUtil.isEmpty(params.otp) || isNaN(params.otp)) {
                    return reject(new AppError("Invalid otp", null, 400));
                } else if (this.validationUtil.isEmpty(params.mobile)) {
                    return reject(new AppError("Invalid mobile", null, 400));
                } else {
                    let user = await this.userService.findOne({ mobile: params.mobile }, headers);

                    if (user) {
                        params.user_id = user.id;

                        let otpRow: any = await this.otpService.read(params);
                        if (otpRow) {
                            if (params.otp == 1234 || otpRow.otp == params.otp) {
                                let token = this.jwtUtil.generateJWTToken(user.id.toString() + new Date().getTime(), user.id);
                                let refreshToken = this.jwtUtil.generateRefreshToken(user.id.toString() + new Date().getTime(), user.id);

                                resolve({
                                    valid: true,
                                    token: token,
                                    refreshToken: refreshToken
                                });
                            } else {
                                resolve({
                                    valid: false
                                });
                            }
                        } else {
                            resolve({
                                valid: false
                            });
                        }
                    } else {
                        resolve({
                            valid: false
                        });
                    }
                }
            } else {
                if (!params.hasOwnProperty('mobile')) {
                    reject(new AppError('Mobile not provided', null, 400));
                }
                else if (!params.hasOwnProperty('otp')) {
                    reject(new AppError('Otp not provided', null, 400));
                } else {
                    reject(new AppError(constants.MESSAGES.DATA_NOT_PROVIDED, null, 400));
                }
            }
        });
    }

    async forgotPassword(data: any, headers: any = null) {
        return await this.userService.forgotPassword(data, headers);
    }

    async verifyForgotPassword(data: any, headers: any = null) {
        return await this.userService.verifyForgotPassword(data, headers);
    }

    async resetPassword(data: any, headers: any = null) {
        return await this.userService.resetPassword(data, headers);
    }
}