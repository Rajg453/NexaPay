import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

// Detailed explanation: This function fetches all notifications for the currently logged-in user.
// It is an async function because it needs to query the MongoDB database.
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    // We use the req.user object attached by the authMiddleware to get the user's ID.
    // We sort by 'createdAt' in descending order (-1) so the newest notifications are first.
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // We send back the list of notifications as a JSON response with a 200 OK status.
    res.status(200).json(notifications);
  } catch (error) {
    // If something goes wrong, we log the error and send a 500 Internal Server Error status.
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error while fetching notifications' });
  }
};

// Detailed explanation: This function marks a specific notification as 'read'.
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    // We extract the notification ID from the URL parameters (e.g., /api/notifications/:id/read)
    const { id } = req.params;

    // We find the notification by its ID. We also check that it belongs to the logged-in user
    // for security reasons (so a user can't mark someone else's notification as read).
    const notification = await Notification.findOne({ _id: id, user: req.user._id });

    if (!notification) {
      // If no notification is found, we return a 404 Not Found error.
      return res.status(404).json({ error: 'Notification not found' });
    }

    // We update the 'read' property to true.
    notification.read = true;
    
    // We save the updated notification back to the database.
    await notification.save();

    // We send back a success message.
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Server error while updating notification' });
  }
};

// Detailed explanation: This is a helper function to create a new notification.
// It is NOT directly an Express route handler, but a utility we can call from other controllers 
// (like when a payment succeeds).
export const createNotification = async (userId: string, message: string) => {
  try {
    // We create a new notification document in the database.
    const newNotification = await Notification.create({
      user: userId,
      message,
    });
    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // We don't crash the server here, just log the error if notification fails.
  }
};
