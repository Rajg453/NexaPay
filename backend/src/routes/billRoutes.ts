import express, { Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import { fraudDetection } from '../middleware/fraudMiddleware';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';
import BankAccount from '../models/BankAccount';
import { categorizeTransaction } from '../services/aiService';

const router = express.Router();

// @desc    Simulate fetching a utility bill
// @route   GET /api/bills/fetch/:service
// @access  Private (Requires JWT token)
router.get('/fetch/:service', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = req.params.service;
    
    // Best Practice for Mocks: Generate a random realistic bill amount (e.g., between ₹200 and ₹1500)
    const randomAmount = Math.floor(Math.random() * (1500 - 200 + 1) + 200);
    
    // Simulate what a real API (like Setu) would return
    res.json({
      service: service,
      billAmount: randomAmount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 7 days
      customerName: req.user.name
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Simulate paying a utility bill
// @route   POST /api/bills/pay
// @access  Private
// BEST PRACTICE: We added fraudDetection here so NO money moves if it's suspicious!
router.post('/pay', protect, fraudDetection, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { service, amount, paymentMethod = 'wallet', bankAccountId } = req.body;

    // Check payment method logic
    if (paymentMethod === 'upi') {
      if (!bankAccountId) {
        return res.status(400).json({ error: 'Bank Account ID is required for UPI payments.' });
      }

      const bank = await BankAccount.findOne({ _id: bankAccountId, user: req.user._id });
      if (!bank) return res.status(404).json({ error: 'Bank account not found' });
      
      if (bank.balance < amount) {
        return res.status(400).json({ error: 'Insufficient bank balance for UPI payment!' });
      }
      
      // Deduct from bank
      bank.balance -= amount;
      await bank.save();

    } else if (paymentMethod === 'card') {
      // Simulate Card Payment Approval
      // In a real app, this would call a payment gateway (Stripe/Razorpay) using the entered card details.
      console.log(`[Card Payment] Successfully charged ₹${amount} to card for ${service}`);
      
    } else {
      // Default to Wallet
      const wallet = await Wallet.findOne({ user: req.user._id });
      if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

      if (wallet.balance < amount) {
        return res.status(400).json({ error: 'Insufficient wallet balance to pay this bill!' });
      }

      // Deduct the amount
      wallet.balance -= amount;
      // Give them some reward points for using Paystream!
      wallet.rewardPoints += 10;
      await wallet.save(); 
    }

    // Common Logic: Record the Transaction
    // Ask our AI what category this transaction is! 
    const aiCategory = await categorizeTransaction(`${service} Bill Payment`);

    const transaction = await Transaction.create({
      senderId: req.user._id,
      title: `${service} Payment via ${paymentMethod.toUpperCase()}`,
      amount: amount,
      category: aiCategory,
      type: 'BILL_PAYMENT',
      status: 'SUCCESS'
    });

    res.json({
      message: 'Bill paid successfully!',
      transaction,
      paymentMethod
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
