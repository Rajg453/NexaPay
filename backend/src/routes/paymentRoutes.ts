import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';

const router = express.Router();

router.post('/create-order', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_1' } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum amount must be 100 paise' });
    }

    // Initialize Razorpay inside the route to ensure environment variables are loaded
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const options = {
      amount,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    
    // Create PENDING transaction for the wallet deposit
    await Transaction.create({
      receiverId: req.user._id,
      title: 'Wallet Deposit',
      amount: Number(amount) / 100, // Assuming Razorpay amount is in paise, we store in INR
      type: 'DEPOSIT',
      status: 'PENDING',
      category: 'Wallet',
      reference: order.id
    });

    res.json({
      ...order,
      key_id: process.env.RAZORPAY_KEY_ID || '', // Frontend needs this to open the checkout modal
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/verify-payment', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // 1. Update the PENDING transaction to SUCCESS
      const transaction = await Transaction.findOne({ reference: razorpay_order_id });
      if (transaction && transaction.status === 'PENDING') {
        transaction.status = 'SUCCESS';
        await transaction.save();

        // 2. Add amount to user's wallet ONLY if transaction was pending (prevents double crediting)
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (wallet) {
          wallet.balance += transaction.amount; // Use the trusted amount from the DB!
          await wallet.save();
        }
      }

      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
