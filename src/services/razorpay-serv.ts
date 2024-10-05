import { BaseService } from './base-serv'; 
import axios from 'axios';
import crypto from 'crypto';
import { AppError } from '../models/app-error';

export class RazorpayService extends BaseService {
    private razorpayInstance: any;

    constructor() {
        super();
        this.razorpayInstance = new (require('razorpay'))({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    /**
     * @function createRazorpayOrder
     * Creates an order in Razorpay
     */
    async createRazorpayOrder(data: any) {
        try {
            const { amount, receipt } = data;
            // Validate required fields
            if (!amount || !receipt) {
                throw new AppError('Required payment parameters are missing', null, 400);
            }
            // Create order using Razorpay SDK with static currency 'INR'
            const order = await this.razorpayInstance.orders.create({
                amount: amount * 100, // amount in paise (minor currency unit)
                currency: 'INR', // Static currency
                receipt, // Unique receipt or order ID from your system
            });
    
            return { success: true, order };
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            throw new AppError('Failed to create Razorpay order', null, 500);
        }
    }
    

    /**
     * @function verifyRazorpaySignature
     * Verifies the Razorpay payment signature
     */
    async verifyRazorpaySignature(data: any) {
        try {
            const { order_id, payment_id, signature	 } = data;
            const body = order_id+ "|" + payment_id	;
            const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature === signature	) {
                return { success: true, message: 'Payment verified successfully' };
            } else {
                throw new AppError('Invalid signature', null, 400);
            }
        } catch (error) {
            console.error('Error verifying Razorpay signature:', error);
            throw new AppError('Signature verification failed', null, 500);
        }
    }
}

export default RazorpayService;
