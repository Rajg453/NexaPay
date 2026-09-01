import mongoose from 'mongoose';

// This function connects our Express backend to the MongoDB database.
// In TypeScript, we can explicitly state that this function returns a Promise<void>
// meaning it does asynchronous work but doesn't return a specific value.
const connectDB = async (): Promise<void> => {
  try {
    // We try to connect to the MongoDB URI provided in our .env file.
    // If it's not there, we gracefully default to a local database named 'paystream'
    // NOTE: For a beginner, a local database is perfect for testing!
    const uri: string = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/paystream';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected beautifully: ${conn.connection.host}`);
  } catch (error: any) {
    // We cast error to 'any' to safely access the message property in TypeScript.
    console.error(`MongoDB Connection Error: ${error.message}`);
    // If we can't connect, we exit the process with an error code (1)
    process.exit(1);
  }
};

export default connectDB;
