import mongoose, { Document, Model } from 'mongoose';

// Define the TypeScript interface for a Transaction document.
export interface ITransaction extends Document {
  senderId?: mongoose.Schema.Types.ObjectId;   // Optional: Null for system deposits
  receiverId?: mongoose.Schema.Types.ObjectId; // Optional: Null for external withdrawals
  title: string;
  amount: number;
  fee: number;
  currency: string;
  category: string;
  type: 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'BILL_PAYMENT';
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  reference?: string; // e.g., Razorpay order ID
  idempotencyKey?: string; // Unique key to prevent duplicate processing
  fraudScore?: number;
  fraudReasons?: string[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresOTP?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  title: {
    type: String,
    required: true, // e.g., "Transfer to Rahul", "Wallet Deposit"
  },
  amount: {
    type: Number,
    required: true,
  },
  fee: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  category: {
    type: String,
    default: 'General', 
  },
  type: {
    type: String,
    enum: ['TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'BILL_PAYMENT'],
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
    required: true,
  },
  reference: {
    type: String,
    required: false,
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true, // Only enforces uniqueness if the field exists
    required: false,
  },
  fraudScore: {
    type: Number,
    required: false,
  },
  fraudReasons: {
    type: [String],
    required: false,
  },
  riskLevel: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: false,
  },
  requiresOTP: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
