// Import the mongoose library and the Document type from it. Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.
// Document is an interface that represents a MongoDB document.
import mongoose, { Document, Model } from 'mongoose';

// Define a TypeScript interface representing a bank account document in MongoDB.
// This interface inherits from the Document interface provided by mongoose.
// An interface defines the shape or structure that the data should have.
export interface IBankAccount extends Document {
  // 'user' field will store the unique identifier (ObjectId) of the user who owns this bank account.
  user: mongoose.Schema.Types.ObjectId;
  // 'bankName' is a required string that stores the name of the bank (e.g., "Chase", "Bank of America").
  bankName: string;
  // 'accountNumberLast4' is a string storing the last 4 digits of the account number for display purposes.
  accountNumberLast4: string;
  // 'balance' is a number representing the current balance in the bank account.
  balance: number;
  // 'createdAt' is a date field automatically managed by mongoose timestamps.
  createdAt: Date;
  // 'updatedAt' is a date field automatically managed by mongoose timestamps.
  updatedAt: Date;
}

// Create a new Mongoose schema for the bank account model.
// The schema defines the structure of the document, default values, validators, etc., at the database level.
// We pass the IBankAccount interface to generic Type so mongoose knows the structure.
const bankAccountSchema = new mongoose.Schema<IBankAccount>(
  {
    // Define the 'user' field in the schema
    user: {
      // Type is set to mongoose.Schema.Types.ObjectId which is used for references to other documents
      type: mongoose.Schema.Types.ObjectId,
      // Ref points to the 'User' model, meaning this ObjectId belongs to a user
      ref: 'User',
      // This field is required, so a bank account cannot be created without a linked user
      required: true,
    },
    // Define the 'bankName' field in the schema
    bankName: {
      // It is of type String
      type: String,
      // It must be provided (cannot be empty)
      required: true,
    },
    // Define the 'accountNumberLast4' field in the schema
    accountNumberLast4: {
      // It is of type String
      type: String,
      // It must be provided
      required: true,
    },
    // Define the 'balance' field in the schema
    balance: {
      // It is of type Number
      type: Number,
      // If no balance is provided when creating a new document, default it to 100000.
      default: 100000, // Dummy high balance to simulate a real bank account with funds
    }
  },
  // Options for the schema
  {
    // Enable timestamps. This will automatically add 'createdAt' and 'updatedAt' fields to the document.
    timestamps: true
  }
);

// Create the Mongoose model based on the schema and interface.
// A model is a compiled version of the schema, providing an interface for interacting with the database (creating, querying, updating, deleting).
// We specify the type of document it returns as IBankAccount.
const BankAccount: Model<IBankAccount> = mongoose.model<IBankAccount>('BankAccount', bankAccountSchema);

// Export the BankAccount model as the default export of this module.
// This allows other files to import it and use it to interact with the 'bankaccounts' collection in MongoDB.
export default BankAccount;
