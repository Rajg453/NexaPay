import express, { Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import BankAccount from '../models/BankAccount';

const router = express.Router();

// @desc    Get user's linked bank accounts
// @route   GET /api/banks
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const banks = await BankAccount.find({ user: req.user._id });
    res.json(banks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Link a new bank account
// @route   POST /api/banks/add
// @access  Private
router.post('/add', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { bankName } = req.body;

    // Simulate grabbing the last 4 digits randomly from the bank API integration
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();

    const bank = await BankAccount.create({
      user: req.user._id,
      bankName: bankName,
      accountNumberLast4: randomDigits,
      balance: 100000 // Give them ₹1,00,000 for testing
    });

    res.status(201).json(bank);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
