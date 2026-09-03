import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function PayPhone() {
  const router = useRouter();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifiedUser, setVerifiedUser] = useState<{name: string, upiId: string} | null>(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleVerify = () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
      return;
    }
    
    setVerifying(true);
    // Simulate API lookup
    setTimeout(() => {
      setVerifying(false);
      setVerifiedUser({
        name: 'Rahul Sharma',
        upiId: `${phoneNumber}@nexapay`
      });
    }, 1000);
  };

  const handlePay = async () => {
    if (!verifiedUser) return;
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }

    setProcessing(true);
    try {
      await apiFetch('/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: verifiedUser.upiId,
          amount: numericAmount,
          paymentMethod: 'wallet',
        })
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Could not process payment.');
    } finally {
      setProcessing(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Contacts</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.card}>
            <Text style={styles.title}>Enter Phone Number or UPI ID</Text>
            
            <View style={styles.searchContainer}>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="search" size={24} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="e.g. 9876543210"
                  keyboardType="numeric"
                  maxLength={10}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    setVerifiedUser(null);
                  }}
                />
              </View>
              
              {!verifiedUser && (
                <TouchableOpacity 
                  style={[styles.verifyButton, phoneNumber.length < 10 && styles.disabledButton]} 
                  onPress={handleVerify}
                  disabled={phoneNumber.length < 10 || verifying}
                >
                  <Text style={styles.verifyButtonText}>{verifying ? '...' : 'Verify'}</Text>
                </TouchableOpacity>
              )}
            </View>

            {verifiedUser && (
              <View style={styles.verifiedContainer}>
                <View style={styles.userIcon}>
                  <Text style={styles.userInitial}>{verifiedUser.name.charAt(0)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{verifiedUser.name}</Text>
                  <Text style={styles.userUpi}>{verifiedUser.upiId}</Text>
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons name="verified" size={14} color="#10b981" />
                    <Text style={styles.verifiedText}>Verified Name</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {verifiedUser && (
            <View style={styles.card}>
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Paying {verifiedUser.name}</Text>
                <View style={styles.amountWrapper}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    autoFocus
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.payButton, (processing || !amount) && styles.disabledButton]} 
                onPress={handlePay}
                disabled={processing || !amount}
              >
                <Text style={styles.payButtonText}>
                  {processing ? 'Processing securely...' : amount ? `Pay ₹${amount}` : 'Enter Amount to Pay'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Our Custom Success Modal Dialog */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Payment Successful!</Text>
            <Text style={styles.modalMessage}>
              ₹{parseFloat(amount || '0').toFixed(2)} sent securely to {verifiedUser?.name}.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  card: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 20, elevation: 3, marginBottom: 20,
    shadowColor: '#ec4899', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  searchContainer: { flexDirection: 'row', alignItems: 'center' },
  inputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6',
    borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e5e7eb'
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#1f2937' },
  verifyButton: {
    backgroundColor: '#3b0764', paddingHorizontal: 20, paddingVertical: 15,
    borderRadius: 12, marginLeft: 10, justifyContent: 'center'
  },
  verifyButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  disabledButton: { backgroundColor: '#9ca3af' },
  
  verifiedContainer: {
    flexDirection: 'row', alignItems: 'center', marginTop: 20, padding: 15,
    backgroundColor: '#f0fdf4', borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0'
  },
  userIcon: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#d1fae5',
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  userInitial: { fontSize: 24, fontWeight: 'bold', color: '#047857' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#064e3b' },
  userUpi: { fontSize: 14, color: '#059669', marginBottom: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center' },
  verifiedText: { fontSize: 12, color: '#10b981', marginLeft: 4, fontWeight: 'bold' },
  
  amountContainer: { alignItems: 'center', marginBottom: 25 },
  amountLabel: { fontSize: 14, color: '#6b7280', marginBottom: 10, fontWeight: '500' },
  amountWrapper: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 40, fontWeight: 'bold', color: '#3b0764', marginRight: 8 },
  amountInput: {
    fontSize: 40, fontWeight: 'bold', color: '#3b0764', minWidth: 120, textAlign: 'center',
    borderBottomWidth: 2, borderBottomColor: '#f3e8ff', paddingVertical: 0
  },
  payButton: {
    backgroundColor: '#ec4899', padding: 16, borderRadius: 12, alignItems: 'center',
    elevation: 2, shadowColor: '#ec4899', shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  payButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  // Styles for our custom modal dialog
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalContent: {
    backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', width: '100%', maxWidth: 400,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4
  },
  modalEmoji: { fontSize: 50, marginBottom: 15 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#3b0764', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 16, color: '#4b5563', textAlign: 'center', marginBottom: 25 },
  modalButton: { backgroundColor: '#3b0764', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 30, width: '100%', alignItems: 'center' },
  modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
