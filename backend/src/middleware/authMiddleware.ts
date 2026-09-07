import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// Define a custom interface that extends the standard Express Request
// This allows us to safely attach the 'user' object to the request
export interface AuthRequest extends Request {
  user?: any;
}

// This middleware protects our routes so only logged-in users can access them
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Check if the request has an authorization header with a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token. We cast the decoded token to any to access the 'id' property.
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Get user from the token and attach it to the request (excluding their password for safety)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};
