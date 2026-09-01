import mongoose, { Document, Model } from 'mongoose';

// Define the TypeScript interface for a Wallet document.
export interface IWallet extends Document {
  user: mongoose.Schema.Types.ObjectId;
  balance: number;
  rewardPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new mongoose.Schema<IWallet>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links this wallet to a specific User
    required: true,
  },
  balance: {
    type: Number,
    default: 0, // Everyone starts with 0 balance
  },
  rewardPoints: {
    type: Number,
    default: 0, // Everyone starts with 0 reward points
  }
}, { timestamps: true });

const Wallet: Model<IWallet> = mongoose.model<IWallet>('Wallet', walletSchema);
export default Wallet;
