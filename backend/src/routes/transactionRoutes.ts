import express, { Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import Transaction from '../models/Transaction';

const router = express.Router();

// @desc    Get logged in user's recent transactions
// @route   GET /api/transactions/recent
// @access  Private
router.get('/recent', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find all transactions for this user, sort by newest first, limit to 10
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
      
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Transfer money (Scan & Pay)
// @route   POST /api/transactions/transfer
// @access  Private
router.post('/transfer', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { receiverId, amount, paymentMethod, bankAccountId } = req.body;
    
    if (!receiverId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid receiver and amount are required' });
    }

    // Deduct from appropriate source (simulation for now)
    // In a real app, we'd verify the bankAccountId belongs to the user and call a banking API
    
    // Create the transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      title: `Transfer to ${receiverId}`,
      amount: amount,
      type: 'sent',
      category: 'Transfer'
    });

    res.status(201).json({ message: 'Transfer successful', transaction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
