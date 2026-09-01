// Import the express library to use its Router feature
import express, { Response } from 'express';

// Import our controller which contains the actual logic for this route
import { categorizeExpenseHandler } from '../controllers/aiController';

// Import our new AI service and models for the Financial Advisor
import { getFinancialAdvice } from '../services/aiService';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';

// Create a new Router object. 
// A router is like a mini-app that only handles specific URLs (like our AI URLs)
const router = express.Router();

// Define our specific route. 
// When someone sends a POST request to this router's root (which we'll map to /api/categorize later),
// it will call our categorizeExpenseHandler controller function.
router.post('/categorize', categorizeExpenseHandler);

// @desc    Ask the AI Financial Advisor a question
// @route   POST /api/ai/advisor
// @access  Private
router.post('/advisor', protect, async (req: any, res: Response): Promise<void | Response> => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Please ask a question!' });
    }

    // 1. Fetch the user's financial context from MongoDB
    const wallet = await Wallet.findOne({ user: req.user._id });
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5); // Just grab the last 5 for context

    const balance = wallet ? wallet.balance : 0;

    // 2. Pass context to the AI Service
    const advice = await getFinancialAdvice(question, balance, recentTransactions);

    res.json({ advice });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get financial advice: ' + error.message });
  }
});

// Export the router so we can plug it into our main app in index.ts
export default router;
