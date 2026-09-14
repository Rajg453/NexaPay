import { apiFetch } from './api';

// Detailed explanation: This function fetches all notifications for the currently logged-in user.
// We use the apiFetch utility which automatically attaches the user's authentication token.
export const fetchNotifications = async () => {
  // Detailed explanation: We call our backend API endpoint to get the list of notifications.
  // We await the result and return it so the component can use it.
  const response = await apiFetch('/notifications', {
    method: 'GET',
  });
  return response;
};

// Detailed explanation: This function marks a specific notification as 'read'.
export const markNotificationAsRead = async (id: string) => {
  // Detailed explanation: We call our backend API to update the notification status.
  const response = await apiFetch(`/notifications/${id}/read`, {
    method: 'PUT',
  });
  return response;
};
