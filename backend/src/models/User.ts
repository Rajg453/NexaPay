import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the TypeScript interface for a User document.
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  // Method signature for matchPassword
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Best Practice: No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt dates

// Temporary: Store password as plain text (Do not do this in production!)
// userSchema.pre<IUser>('save', ...) is removed.

// Helper method to check if a typed password matches the saved one
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return enteredPassword === this.password; // Plain text comparison
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
