import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

// Detailed explanation: We create a new Express router. This allows us to define
// routes that will be grouped together under a specific path (like /api/notifications).
const router = express.Router();

// Detailed explanation: We define a GET route for the root of this router (/).
// We use the 'protect' middleware to ensure only logged-in users can access it.
// If the user is authenticated, it calls the 'getNotifications' controller function.
router.get('/', protect, getNotifications);

// Detailed explanation: We define a PUT route to update a specific notification by its ID.
// The ':id' part is a dynamic parameter that we can access in the controller using req.params.id.
// Again, we use the 'protect' middleware for security.
router.put('/:id/read', protect, markAsRead);

export default router;
