import crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

import appConfig from '../config/app-config';

export class EncryptionUtil {
    key: string;
    algorithm: string = 'aes-256-ctr';

    constructor() {
        this.key = appConfig.SERVER_KEYS.SERVER_SECRET;
    }

    /***************** methods for bcrypt library ******************************/

    encryptWithBcrypt(text: string) {
        var salt = bcrypt.genSaltSync(10);

        // Salt and hash password
        var hash = bcrypt.hashSync(text, salt);

        return hash;
    }

    verifyWithBcrypt(text: string, hash: any) {
        return bcrypt.compareSync(text, hash);
    }

    /***************** methods for crypto library ******************************/

    encryptWithCrypto(text: any) {
        let iv = crypto.randomBytes(16).toString("hex").slice(0, 16);

        let cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encryptedText = cipher.update(text, "utf8", "hex");
        encryptedText += cipher.final("hex");
        encryptedText = iv + encryptedText;

        return encryptedText;
    }

    decryptWithCrypto(text: any) {
        try {
            const iv = text.slice(0, 16);
            text = text.slice(16, text.length);
            let decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            let decryptedText = decipher.update(text, "hex", "utf8");
            decryptedText += decipher.final("utf8");

            return decryptedText;
        } catch (err) {
            return null;
        }
    }

    getFingerPrintHash(fingerPrint: any) {
        return crypto.createHash('sha256').update(fingerPrint).digest('hex');
    }
}