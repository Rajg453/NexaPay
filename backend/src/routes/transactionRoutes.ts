import express, { Response } from 'express';
import { protect, AuthRequest } from '../middleware/authMiddleware';
import Transaction from '../models/Transaction';

const router = express.Router();

// @desc    Get logged in user's recent transactions
// @route   GET /api/transactions/recent
// @access  Private
router.get('/recent', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find all transactions where user is either sender or receiver, sort by newest first, limit to 10
    const transactions = await Transaction.find({ 
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }] 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('senderId', 'name email') // Optional: populate user details
      .populate('receiverId', 'name email');
      
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get comprehensive dashboard analytics
// @route   GET /api/transactions/analytics/dashboard
// @access  Private
router.get('/analytics/dashboard', protect, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 7 days ago at midnight
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch all relevant transactions for the user
    const allTransactions = await Transaction.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
      status: 'SUCCESS'
    });

    let totalSpentThisMonth = 0;
    const categoryTotals: Record<string, number> = {};
    const dailySpending: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    // Initialize daily spending array with 0 for the last 7 days
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g. Mon, Tue
      dailySpending[dateStr] = 0;
    }

    allTransactions.forEach(t => {
      const txDate = new Date(t.createdAt);
      const isSender = t.senderId?.toString() === req.user._id.toString();
      
      if (isSender) {
        totalExpense += t.amount;
        
        // This Month Spending & Categories
        if (txDate >= startOfMonth) {
          totalSpentThisMonth += t.amount;
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }

        // Daily Spending (Last 7 Days)
        if (txDate >= sevenDaysAgo) {
          const dateStr = txDate.toLocaleDateString('en-US', { weekday: 'short' });
          if (dailySpending[dateStr] !== undefined) {
            dailySpending[dateStr] += t.amount;
          }
        }
      } else {
        // Income
        totalIncome += t.amount;
      }
    });

    // Format Data for the Frontend Charts
    const categories = Object.keys(categoryTotals).map((name, index) => {
      // Assign specific theme colors based on index for the pie chart
      const colors = ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843', '#fbcfe8', '#f9a8d4'];
      return {
        name,
        amount: categoryTotals[name],
        color: colors[index % colors.length],
        legendFontColor: '#374151',
        legendFontSize: 12
      };
    }).sort((a, b) => b.amount - a.amount);

    const dailyTrend = {
      labels: Object.keys(dailySpending),
      data: Object.values(dailySpending)
    };

    res.json({
      totalSpentThisMonth,
      categories,
      dailyTrend,
      cashFlow: { income: totalIncome, expense: totalExpense }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

import Wallet from '../models/Wallet';
import User from '../models/User';
import { analyzeFraudRisk } from '../services/aiService';

// @desc    Transfer money (Scan & Pay)
// @route   POST /api/transactions/transfer
// @access  Private
router.post('/transfer', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { receiverId, amount } = req.body;
    const idempotencyKey = req.headers['idempotency-key'] as string;
    
    if (!receiverId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid receiver and amount are required' });
    }

    // --- Idempotency Check ---
    if (idempotencyKey) {
      const existingTransaction = await Transaction.findOne({ idempotencyKey });
      if (existingTransaction) {
        // If we've already processed this exact request, return success immediately!
        console.log(`Idempotency hit! Safely ignored duplicate request for key: ${idempotencyKey}`);
        return res.status(200).json({ 
          message: 'Transfer successful (Idempotent response)', 
          transaction: existingTransaction 
        });
      }
    }
    // -------------------------
    
    // Prevent self-transfer
    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot transfer money to yourself' });
    }

    // 1. Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // 2. Find both wallets
    const senderWallet = await Wallet.findOne({ user: req.user._id });
    const receiverWallet = await Wallet.findOne({ user: receiverId });

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({ error: 'Wallet not found for one of the users' });
    }

    // 3. Check if sender has enough balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // --- AI Fraud Detection ---
    // Fetch recent context for AI
    const recentTx = await Transaction.find({ senderId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const fraudAnalysis = await analyzeFraudRisk(amount, receiver.name, recentTx);
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (fraudAnalysis.score >= 30) riskLevel = 'MEDIUM';
    if (fraudAnalysis.score > 70) riskLevel = 'HIGH';

    if (riskLevel === 'HIGH') {
      // 1. Create a PENDING transaction requiring OTP
      const pendingTransaction = await Transaction.create({
        senderId: req.user._id,
        receiverId: receiverId,
        title: `Transfer to ${receiver.name}`,
        amount: amount,
        type: 'TRANSFER',
        status: 'PENDING',
        category: 'Transfer',
        reference: `TRF_${Date.now()}`,
        idempotencyKey: idempotencyKey,
        fraudScore: fraudAnalysis.score,
        fraudReasons: fraudAnalysis.reasons,
        riskLevel: riskLevel,
        requiresOTP: true
      });

      // 2. Return 403 Forbidden with OTP instructions
      return res.status(403).json({
        error: 'High Risk Transaction Detected',
        requiresOTP: true,
        transactionId: pendingTransaction._id,
        fraudScore: fraudAnalysis.score,
        fraudReasons: fraudAnalysis.reasons
      });
    }
    // -------------------------

    // 4. Perform the transfer (deduct from sender, add to receiver)
    senderWallet.balance -= amount;
    receiverWallet.balance += Number(amount);

    await senderWallet.save();
    await receiverWallet.save();
    
    // 5. Create a SINGLE transaction record for the ledger
    const transferTransaction = await Transaction.create({
      senderId: req.user._id,
      receiverId: receiverId,
      title: `Transfer to ${receiver.name}`,
      amount: amount,
      type: 'TRANSFER',
      status: 'SUCCESS', // P2P transfers are instant/synchronous
      category: 'Transfer',
      reference: `TRF_${Date.now()}`,
      idempotencyKey: idempotencyKey,
      fraudScore: fraudAnalysis.score,
      fraudReasons: fraudAnalysis.reasons,
      riskLevel: riskLevel
    });

    res.status(201).json({ message: 'Transfer successful', transaction: transferTransaction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Verify OTP for High Risk Transaction
// @route   POST /api/transactions/verify-otp
// @access  Private
router.post('/verify-otp', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { transactionId, otp } = req.body;

    if (!transactionId || !otp) {
      return res.status(400).json({ error: 'Transaction ID and OTP are required' });
    }

    // Mock OTP verification (accept any 6 digits for interview demo)
    if (otp.length !== 6) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.senderId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (transaction.status !== 'PENDING' || !transaction.requiresOTP) {
      return res.status(400).json({ error: 'Transaction does not require OTP verification' });
    }

    // Process the funds transfer
    const senderWallet = await Wallet.findOne({ user: req.user._id });
    const receiverWallet = await Wallet.findOne({ user: transaction.receiverId });

    if (!senderWallet || !receiverWallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (senderWallet.balance < transaction.amount) {
      transaction.status = 'FAILED';
      await transaction.save();
      return res.status(400).json({ error: 'Insufficient balance during OTP verify' });
    }

    senderWallet.balance -= transaction.amount;
    receiverWallet.balance += transaction.amount;

    await senderWallet.save();
    await receiverWallet.save();

    // Update Transaction
    transaction.status = 'SUCCESS';
    transaction.requiresOTP = false;
    await transaction.save();

    res.json({ message: 'OTP Verified, Transfer Successful', transaction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Withdraw money to Bank Account (Send to Bank)
// @route   POST /api/transactions/withdraw
// @access  Private
router.post('/withdraw', protect, async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { accountNumber, ifscCode, receiverName, amount } = req.body;
    
    if (!accountNumber || !ifscCode || !receiverName || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid bank details and amount are required' });
    }

    // 1. Find user's wallet
    const senderWallet = await Wallet.findOne({ user: req.user._id });
    if (!senderWallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // 2. Check if sender has enough balance
    if (senderWallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // 3. Deduct from sender's wallet
    senderWallet.balance -= amount;
    await senderWallet.save();
    
    // 4. Create a Transaction record
    const withdrawTransaction = await Transaction.create({
      senderId: req.user._id,
      title: `Transfer to ${receiverName} (${accountNumber.slice(-4)})`,
      amount: amount,
      type: 'WITHDRAWAL',
      status: 'SUCCESS',
      category: 'Bank Transfer',
      reference: `WD_${Date.now()}`,
    });

    res.status(201).json({ message: 'Withdrawal successful', transaction: withdrawTransaction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
