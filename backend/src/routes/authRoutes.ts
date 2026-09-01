import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Wallet from '../models/Wallet';

const router = express.Router();

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create the new user
    const user = await User.create({ name, email, password });
    
    // Best Practice: Automatically create a blank wallet for them as soon as they sign up!
    await Wallet.create({ user: user._id as any });

    // Generate a secure JWT token so they stay logged in
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: '30d',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
