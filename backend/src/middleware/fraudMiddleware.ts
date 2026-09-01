import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import Wallet from '../models/Wallet';

/**
 * Security Middleware: Detects potentially fraudulent transactions before they happen.
 */
export const fraudDetection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const { amount } = req.body;

    // Make sure the user is attached to the request (from authMiddleware)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found for fraud check' });
    }

    // We can still log large transactions for monitoring, but we won't block them based on time anymore
    const isHighAmount = amount > (wallet.balance * 0.8);
    if (isHighAmount) {
      console.log(`[RISK WARNING] User ${req.user._id} is sending >80% of their balance.`);
    }

    // Move on to the next middleware (which will be the actual payment logic)
    next();
  } catch (error: any) {
    return res.status(500).json({ error: 'Fraud detection system failed: ' + error.message });
  }
};
