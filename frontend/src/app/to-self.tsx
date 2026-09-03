import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, TextInput, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function ToSelf() {
  const router = useRouter();
  
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [source, setSource] = useState('wallet');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const data = await apiFetch('/banks');
        setBanks(data);
        if (data.length > 0) {
          setDestination(data[0]._id);
        }
      } catch (error) {
        console.error('Failed to fetch banks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const handleTransfer = async () => {
    if (source === destination) {
      Alert.alert('Invalid Selection', 'Source and destination cannot be the same.');
      return;
    }

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
          receiverId: 'Self',
          amount: numericAmount,
          paymentMethod: 'wallet', 
        })
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Transfer Failed', error.message || 'Could not process transfer.');
    } finally {
      setProcessing(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3b0764" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>To Self Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Transfer Details</Text>
          
          <Text style={styles.label}>Transfer From</Text>
          <View style={styles.accountList}>
            <TouchableOpacity 
              style={[styles.accountOption, source === 'wallet' && styles.selectedOption]}
              onPress={() => setSource('wallet')}
            >
              <MaterialIcons name="account-balance-wallet" size={24} color={source === 'wallet' ? '#db2777' : '#6b7280'} />
              <Text style={[styles.accountText, source === 'wallet' && styles.selectedText]}>NexaPay Wallet</Text>
            </TouchableOpacity>
            
            {banks.map(bank => (
              <TouchableOpacity 
                key={`src-${bank._id}`}
                style={[styles.accountOption, source === bank._id && styles.selectedOption]}
                onPress={() => setSource(bank._id)}
              >
                <MaterialIcons name="account-balance" size={24} color={source === bank._id ? '#db2777' : '#6b7280'} />
                <Text style={[styles.accountText, source === bank._id && styles.selectedText]}>
                  {bank.bankName} (...{bank.accountNumberLast4})
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.addBankButton} onPress={() => router.push('/add-bank')}>
              <MaterialIcons name="add-circle-outline" size={24} color="#ec4899" />
              <Text style={styles.addBankButtonText}>Add New Bank Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.arrowContainer}>
             <MaterialIcons name="arrow-downward" size={24} color="#6b21a8" />
          </View>

          <Text style={styles.label}>Transfer To</Text>
          <View style={styles.accountList}>
            <TouchableOpacity 
              style={[styles.accountOption, destination === 'wallet' && styles.selectedOption]}
              onPress={() => setDestination('wallet')}
            >
              <MaterialIcons name="account-balance-wallet" size={24} color={destination === 'wallet' ? '#db2777' : '#6b7280'} />
              <Text style={[styles.accountText, destination === 'wallet' && styles.selectedText]}>NexaPay Wallet</Text>
            </TouchableOpacity>
            
            {banks.map(bank => (
              <TouchableOpacity 
                key={`dest-${bank._id}`}
                style={[styles.accountOption, destination === bank._id && styles.selectedOption]}
                onPress={() => setDestination(bank._id)}
              >
                <MaterialIcons name="account-balance" size={24} color={destination === bank._id ? '#db2777' : '#6b7280'} />
                <Text style={[styles.accountText, destination === bank._id && styles.selectedText]}>
                  {bank.bankName} (...{bank.accountNumberLast4})
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.addBankButton} onPress={() => router.push('/add-bank')}>
              <MaterialIcons name="add-circle-outline" size={24} color="#ec4899" />
              <Text style={styles.addBankButtonText}>Add New Bank Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Transfer Amount</Text>
            <View style={styles.amountWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.transferButton, processing && styles.disabledButton]} 
            onPress={handleTransfer}
            disabled={processing}
          >
            <Text style={styles.buttonText}>
              {processing ? 'Processing...' : amount ? `Transfer ₹${amount}` : 'Transfer'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Our Custom Success Modal Dialog */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Transfer Successful!</Text>
            <Text style={styles.modalMessage}>
              ₹{parseFloat(amount || '0').toFixed(2)} transferred to your account.
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
  container: { flex: 1, backgroundColor: '#f3e8ff' },
  header: {
    backgroundColor: '#ffffff', padding: 15, flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb'
  },
  backButton: { padding: 5, marginRight: 15 },
  backButtonText: { fontSize: 16, color: '#3b0764', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#3b0764' },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 20, elevation: 4,
    shadowColor: '#ec4899', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    maxWidth: 600, width: '100%', alignSelf: 'center',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#3b0764', marginBottom: 20 },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 10, fontWeight: 'bold' },
  accountList: { marginBottom: 10 },
  accountOption: {
    flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12,
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10, backgroundColor: '#f9fafb'
  },
  selectedOption: { borderColor: '#ec4899', backgroundColor: '#fdf2f8' },
  accountText: { marginLeft: 10, fontSize: 16, color: '#4b5563', fontWeight: '500' },
  selectedText: { color: '#db2777', fontWeight: 'bold' },
  arrowContainer: { alignItems: 'center', marginVertical: 5 },
  addBankButton: {
    flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12,
    borderWidth: 1, borderColor: '#ec4899', borderStyle: 'dashed', marginBottom: 10, backgroundColor: '#ffffff'
  },
  addBankButtonText: { marginLeft: 10, fontSize: 16, color: '#ec4899', fontWeight: 'bold' },
  amountContainer: {
    backgroundColor: '#fdf2f8', padding: 15, borderRadius: 12, alignItems: 'center', marginVertical: 20
  },
  amountLabel: { fontSize: 14, color: '#ec4899', marginBottom: 10, fontWeight: 'bold' },
  amountWrapper: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 36, fontWeight: 'bold', color: '#db2777', marginRight: 5 },
  amountInput: {
    fontSize: 36, fontWeight: 'bold', color: '#db2777', minWidth: 120, textAlign: 'center',
    borderBottomWidth: 1, borderBottomColor: '#fbcfe8', paddingVertical: 0
  },
  transferButton: {
    backgroundColor: '#3b0764', padding: 15, borderRadius: 12, alignItems: 'center'
  },
  disabledButton: { backgroundColor: '#9ca3af' },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
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
