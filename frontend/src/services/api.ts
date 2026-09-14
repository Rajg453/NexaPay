import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use environment variable if provided (e.g. on Render, Vercel, or Netlify), 
// otherwise fallback to localhost/local IP for local development.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : 'http://10.175.222.213:5000/api');

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
