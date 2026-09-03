import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const POPULAR_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Kotak Mahindra Bank'
];

export default function AddBank() {
  const router = useRouter();
  
  const [loadingStep, setLoadingStep] = useState<number>(0); 
  // 0: idle, 1: verifying mobile, 2: fetching accounts, 3: linking, 4: success
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const handleSelectBank = async (bankName: string) => {
    setSelectedBank(bankName);
    
    // Simulate real-world delay step 1
    setLoadingStep(1);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate step 2
    setLoadingStep(2);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Call the actual API
    setLoadingStep(3);
    try {
      await apiFetch('/banks/add', {
        method: 'POST',
        body: JSON.stringify({ bankName })
      });
      
      // Show success
      setLoadingStep(4);
      setTimeout(() => {
        Alert.alert('Success!', `${bankName} linked successfully!`, [
          { text: 'Awesome', onPress: () => router.back() }
        ]);
      }, 500);
      
    } catch (error: any) {
      setLoadingStep(0);
      setSelectedBank(null);
      Alert.alert('Link Failed', error.message || 'Could not link bank account.');
    }
  };

  if (loadingStep > 0 && loadingStep < 4) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" style={{ marginBottom: 20 }} />
        <Text style={styles.loadingTitle}>
          {loadingStep === 1 && 'Verifying mobile number...'}
          {loadingStep === 2 && 'Fetching accounts securely...'}
          {loadingStep === 3 && 'Linking to NexaPay...'}
        </Text>
        <Text style={styles.loadingSubtitle}>Please do not press back or close the app.</Text>
      </SafeAreaView>
    );
  }

  if (loadingStep === 4) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <MaterialIcons name="check-circle" size={80} color="#10b981" style={{ marginBottom: 20 }} />
        <Text style={styles.successTitle}>Bank Linked Successfully!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Bank Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Popular Banks</Text>
        <Text style={styles.subtitle}>Select your bank to link it with NexaPay securely.</Text>

        <View style={styles.banksGrid}>
          {POPULAR_BANKS.map((bank, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.bankCard}
              onPress={() => handleSelectBank(bank)}
            >
              <View style={styles.bankIconPlaceholder}>
                <MaterialIcons name="account-balance" size={28} color="#6b21a8" />
              </View>
              <Text style={styles.bankName}>{bank}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#ffffff', padding: 15, flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb'
  },
  backButton: { padding: 5, marginRight: 15 },
  backButtonText: { fontSize: 16, color: '#3b0764', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#3b0764' },
  scrollContent: { padding: 20 },
  sectionHeader: {
    fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 5,
  },
  subtitle: {
    fontSize: 14, color: '#6b7280', marginBottom: 20,
  },
  banksGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'
  },
  bankCard: {
    backgroundColor: '#ffffff', width: '48%', padding: 15, borderRadius: 12,
    alignItems: 'center', marginBottom: 15, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
    borderWidth: 1, borderColor: '#f3f4f6'
  },
  bankIconPlaceholder: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#f3e8ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  bankName: {
    fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center'
  },
  
  // Loading & Success States
  loadingContainer: {
    flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', padding: 20
  },
  loadingTitle: {
    fontSize: 20, fontWeight: 'bold', color: '#3b0764', textAlign: 'center', marginBottom: 10
  },
  loadingSubtitle: {
    fontSize: 14, color: '#6b7280', textAlign: 'center'
  },
  successContainer: {
    flex: 1, backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center', padding: 20
  },
  successTitle: {
    fontSize: 24, fontWeight: 'bold', color: '#047857', textAlign: 'center'
  }
});
