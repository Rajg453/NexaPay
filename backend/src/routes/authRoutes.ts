import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Wallet from '../models/Wallet';

const generateTokens = (id: string) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '15m', // Short-lived access token
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refreshSecret123', {
    expiresIn: '7d', // Long-lived refresh token
  });
  return { accessToken, refreshToken };
};

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

    // Generate secure JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: accessToken, // Send access token in response body
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
      // Generate secure JWT tokens
      const { accessToken, refreshToken } = generateTokens(user._id.toString());

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: accessToken, // Send access token in response body
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get user basic details for QR code verification
// @route   GET /api/auth/user/:id
router.get('/user/:id', async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const user = await User.findById(req.params.id).select('name');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ _id: user._id, name: user.name });
  } catch (error: any) {
    res.status(500).json({ error: 'Invalid User ID or server error' });
  }
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Not authorized, no refresh token' });
    }

    const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret123');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Not authorized, user not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ token: accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
});

// @desc    Logout user and clear cookie
// @route   POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
