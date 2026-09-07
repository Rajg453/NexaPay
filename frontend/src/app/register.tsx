import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { apiFetch } from '../services/api';

export default function RegisterScreen() {
  // State hooks for storing user input
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Router for navigation
  const router = useRouter();

  // Helper to show alerts on both Mobile and Web
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Function to handle the registration process
  const handleRegister = async () => {
    // Basic validation to ensure fields aren't empty
    if (!name || !email || !password) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    try {
      // 1. Send the registration data to the backend API
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      // 2. If registration returns a token automatically (auto-login), save it
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        router.replace('/');
      } else {
        // Otherwise, send them to login screen to sign in manually
        showAlert('Success', 'Account created! Please log in.');
        router.replace('/login');
      }
    } catch (err: any) {
      // 3. Catch errors (e.g., email already exists)
      showAlert('Registration Failed', err.message || 'Something went wrong');
    }
  };

  return (
    // KeyboardAvoidingView prevents the keyboard from covering the inputs
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started with NexaPay</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              value={name}
              onChangeText={setName} 
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              value={email}
              onChangeText={setEmail} 
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput 
              style={styles.input} 
              value={password}
              onChangeText={setPassword} 
              secureTextEntry // Hides the password dots
            />
            
            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
              <Text style={styles.registerText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </View>
          
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// STYLING: Premium Dark Purple, Pink, and White Theme
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Clean white background
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b0764', // Dark Purple
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b21a8', // Medium Purple
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b0764', // Dark Purple
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#faf5ff', // Very light purple tint
    color: '#3b0764',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  registerBtn: {
    backgroundColor: '#ec4899', // Vibrant Pink
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
  registerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#6b21a8',
    fontSize: 14,
  },
  loginLink: {
    color: '#ec4899', // Pink link
    fontSize: 14,
    fontWeight: 'bold',
  },
});
