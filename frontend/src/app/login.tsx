import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { apiFetch } from '../services/api';

export default function LoginScreen() {
  // useState hooks to store the text the user types into the input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');``
  
  // useRouter allows us to navigate between screens (like going to the Dashboard)
  const router = useRouter();

  // Helper to show alerts on both Mobile and Web
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // This function is called when the user presses the Login button
  const handleLogin = async () => {
    try {
      // 1. Send the login request to our backend using our apiFetch helper
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        // We convert our email and password into a JSON string to send over the internet
        body: JSON.stringify({ email, password }),
      });

      // 2. If the login is successful, the backend gives us a secure 'token'.
      // We save this token in the device's storage so the user stays logged in.
      await AsyncStorage.setItem('token', data.token);

      // 3. We navigate the user to the home screen (Dashboard)
      router.replace('/');
    } catch (err: any) {
      // 4. If the backend says the password is wrong (or any other error), we show a popup alert
      showAlert('Login Failed', err.message || 'Check your email and password');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to NexaPay</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail} // Updates the 'email' variable whenever the user types
        autoCapitalize="none" // Important so it doesn't capitalize the first letter of an email
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword} // Updates the 'password' variable
        secureTextEntry // This hides the text with dots (e.g., ••••••••)
      />
      
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/register')}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

// STYLING: Premium Dark Purple, Pink, and White Theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
    padding: 24,
    justifyContent: 'center', 
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b0764', // Very Dark Purple
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#faf5ff', // Very light purple tint
    color: '#3b0764', // Dark purple text
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff', // Light purple border
  },
  loginBtn: {
    backgroundColor: '#ec4899', // Vibrant Pink for primary action
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#ec4899',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  loginText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerBtn: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#6b21a8', // Medium dark purple for links
    fontSize: 14,
    fontWeight: '600',
  },
});
