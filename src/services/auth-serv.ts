import { BaseService } from './base-serv';
import { JwtUtil } from '../utils/jwt-util';

export class AuthService extends BaseService {
    private jwtUtil: JwtUtil;

    public constructor() {
        super();
        this.jwtUtil = new JwtUtil();
    }

    async getRefreshToken(params: any, headers: any = null) {
        let result: any = await this.jwtUtil.verifyRefreshToken(params.refreshToken);

        if (result.valid) {
            let token = this.jwtUtil.generateJWTToken(result.id.toString() + new Date().getTime(), result.id);
            let refreshToken = this.jwtUtil.generateRefreshToken(result.id.toString() + new Date().getTime(), result.id);

            return {
                token: token,
                refreshToken: refreshToken
            };
        } else {
            return Promise.reject({ message: 'Invalid refresh token' });
        }
    }
}