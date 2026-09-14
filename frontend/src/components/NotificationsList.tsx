import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchNotifications, markNotificationAsRead } from '../services/notificationService';

// Detailed explanation: Define the structure of our Notification object to help TypeScript.
interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Detailed explanation: This component displays a list of notifications.
export const NotificationsList = () => {
  // We use state to hold our list of notifications and loading status.
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Detailed explanation: We load the notifications when the component first mounts.
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Detailed explanation: Fetch the data from our backend service.
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Detailed explanation: This function is called when a user taps a notification.
  const handleMarkAsRead = async (id: string) => {
    try {
      // We call the backend to mark it as read.
      await markNotificationAsRead(id);
      // We update our local state to reflect the change without needing to reload the whole list.
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Detailed explanation: This function renders an individual notification item in the list.
  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? styles.readItem : styles.unreadItem]}
      onPress={() => handleMarkAsRead(item._id)}
      disabled={item.read} // We disable tapping if it's already read
    >
      <Text style={[styles.message, item.read ? styles.readText : styles.unreadText]}>
        {item.message}
      </Text>
      <Text style={styles.dateText}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  // Detailed explanation: Show a loading spinner while fetching data.
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Detailed explanation: If there are no notifications, show a friendly message.
  if (notifications.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No notifications yet.</Text>
      </View>
    );
  }

  // Detailed explanation: We use a FlatList for efficient scrolling of large lists.
  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
};

// Detailed explanation: Styles for our component.
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  unreadItem: {
    backgroundColor: '#e6f7ff',
    borderColor: '#91d5ff',
  },
  readItem: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
  },
  message: {
    fontSize: 16,
    marginBottom: 8,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000',
  },
  readText: {
    fontWeight: 'normal',
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
