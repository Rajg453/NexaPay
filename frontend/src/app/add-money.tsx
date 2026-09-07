import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../services/api';

// For TypeScript to know about the global window object on Web
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AddMoneyScreen() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  // Helper to show alerts across platforms
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      // Alert imported from react-native (mocking here for brevity, usually you'd import it)
      console.log(title, message);
    }
  };

  // Load the Razorpay script dynamically on the web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount);
    
    if (isNaN(topUpAmount) || topUpAmount < 1) {
      showAlert('Invalid Amount', 'Please enter a valid amount of at least ₹1.');
      return;
    }

    setLoading(true);

    try {
      // 1. Ask backend to create a Razorpay Order
      // Razorpay expects amount in paise (1 INR = 100 paise)
      const order = await apiFetch('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: topUpAmount * 100, currency: 'INR' }),
      });

      // 2. Open Razorpay Checkout (Web Implementation)
      if (Platform.OS === 'web') {
        if (!window.Razorpay) {
          showAlert('Error', 'Razorpay SDK failed to load. Are you online?');
          setLoading(false);
          return;
        }

        const options = {
          key: order.key_id, // Sent from our backend
          amount: order.amount,
          currency: order.currency,
          name: 'NexaPay Wallet',
          description: 'Add money to wallet',
          order_id: order.id,
          // Callback when payment succeeds
          handler: async function (response: any) {
            try {
              // 3. Send success details to backend for verification
              await apiFetch('/payments/verify-payment', {
                method: 'POST',
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: topUpAmount, // original INR amount to add to wallet
                }),
              });
              
              setShowSuccessModal(true);
            } catch (err: any) {
              showAlert('Verification Failed', err.message || 'We could not verify your payment.');
            }
          },
          prefill: {
            name: 'NexaPay User', // In a real app, fetch from user profile
          },
          theme: {
            color: '#ec4899', // Matches our new vibrant pink brand color
          },
        };

        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response: any) {
          showAlert('Payment Failed', response.error.description);
        });

        rzp.open();
      } else {
        // Mobile implementation would go here using react-native-razorpay
        showAlert('Not Supported', 'Mobile Razorpay is not implemented yet in this Expo Go preview. Please test on Web.');
      }
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Money</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Enter Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
          
          <View style={styles.quickAmounts}>
            {[100, 500, 1000, 2000].map((val) => (
              <TouchableOpacity key={val} style={styles.quickChip} onPress={() => setAmount(val.toString())}>
                <Text style={styles.quickChipText}>+₹{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.payButton, loading && styles.payButtonDisabled]} 
          onPress={handleTopUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Proceed to Pay</Text>
          )}
        </TouchableOpacity>
      </View>


      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Top-up Successful!</Text>
            <Text style={styles.modalMessage}>
              ₹{parseFloat(amount || '0').toFixed(2)} was added to your NexaPay Wallet.
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
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff', // Very light purple border
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 16,
    color: '#3b0764', // Dark Purple
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b0764',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#ec4899', // Pink shadow for flair
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  label: {
    fontSize: 16,
    color: '#6b21a8', // Medium Purple
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ec4899', // Pink underline
    paddingBottom: 10,
    marginBottom: 30,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3b0764',
    marginRight: 8,
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#3b0764', // Dark Purple text
    minWidth: 100,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickChip: {
    borderWidth: 1,
    borderColor: '#f3e8ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#faf5ff',
  },
  quickChipText: {
    color: '#ec4899', // Pink text
    fontWeight: '600',
    fontSize: 14,
  },
  payButton: {
    backgroundColor: '#ec4899', // Vibrant Pink
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#ec4899',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: '#fbcfe8', // Light pink
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
