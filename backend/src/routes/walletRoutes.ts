import express, { Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import Wallet from '../models/Wallet';

const router = express.Router();

// @desc    Get user's wallet balance
// @route   GET /api/wallet/balance
// @access  Private (requires login)
router.get('/balance', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(wallet);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
