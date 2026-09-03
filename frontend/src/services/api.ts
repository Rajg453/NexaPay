import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Since we are running on a mobile device, 'localhost' points to the phone itself.
// But on web, localhost points to the computer running the backend.
const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/api'
  : 'http://10.175.222.213:3000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Use AsyncStorage instead of localStorage for mobile
  const token = await AsyncStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  headers.set('Content-Type', 'application/json');

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong');
  }

  return data;
};
