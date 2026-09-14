// Import the tools we need to build our server
import express, { Express } from 'express';
import connectDB from './config/db';
// cors: Allows our React frontend (running on a different port) to talk to this backend
import cors from 'cors';
// cookie-parser: Allows us to securely read HTTP-only cookies (like refresh tokens)
import cookieParser from 'cookie-parser';
// dotenv: Helps us read secret variables (like our AI token) from the .env file securely
import dotenv from 'dotenv';
dotenv.config(); // Make sure we load the .env from the root of backend folder

// Import our API routes
import aiRoutes from './routes/aiRoutes';
import paymentRoutes from './routes/paymentRoutes';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';
import transactionRoutes from './routes/transactionRoutes';
import billRoutes from './routes/billRoutes';
import bankRoutes from './routes/bankRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app: Express = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(cors({ origin: true, credentials: true })); // Allows your React frontend to make requests to this backend, and accept cookies
app.use(express.json()); // Allows us to easily handle JSON data sent from the frontend
app.use(cookieParser()); // Allows us to read cookies
app.use('/api', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/notifications', notificationRoutes);

// Finally, tell the server to actually start listening for requests
app.listen(PORT, () => {
    console.log(`Server is running beautifully on http://localhost:${PORT}`);
});
