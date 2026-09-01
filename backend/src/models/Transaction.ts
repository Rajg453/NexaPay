import mongoose, { Document, Model } from 'mongoose';

// Define the TypeScript interface for a Transaction document.
export interface ITransaction extends Document {
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  type: 'sent' | 'received';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new mongoose.Schema<ITransaction>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // The user who owns this transaction record
  },
  title: {
    type: String,
    required: true, // e.g., "Amazon Online", "Rahul Sharma"
  },
  amount: {
    type: Number,
    required: true, // The monetary amount
  },
  category: {
    type: String,
    default: 'General', // Default category, AI will try to override this!
  },
  type: {
    type: String,
    enum: ['sent', 'received'], // A transaction is either money sent out or money received
    required: true,
  }
}, { timestamps: true });

const Transaction: Model<ITransaction> = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction;
