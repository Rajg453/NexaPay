import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

export default function CheckBalance() {
  const router = useRouter();
  
  const [banks, setBanks] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Pin Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [checkingBankId, setCheckingBankId] = useState<string | null>(null);
  const [checkingWallet, setCheckingWallet] = useState(false);
  
  // Balances to reveal
  const [revealedBalances, setRevealedBalances] = useState<{ [key: string]: number }>({});
  const [walletRevealed, setWalletRevealed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [banksData, walletData] = await Promise.all([
          apiFetch('/banks'),
          apiFetch('/wallet/balance')
        ]);
        setBanks(banksData);
        setWalletBalance(walletData.balance);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to fetch accounts.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openPinModal = (bankId?: string) => {
    if (bankId) {
      setCheckingBankId(bankId);
      setCheckingWallet(false);
    } else {
      setCheckingWallet(true);
      setCheckingBankId(null);
    }
    setPin('');
    setShowPinModal(true);
  };

  const handleVerifyPin = () => {
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit or 6-digit PIN.');
      return;
    }

    // Simulate PIN Verification
    setShowPinModal(false);
    
    setTimeout(() => {
      if (checkingWallet) {
        setWalletRevealed(true);
      } else if (checkingBankId) {
        const bank = banks.find(b => b._id === checkingBankId);
        if (bank) {
          setRevealedBalances(prev => ({ ...prev, [checkingBankId]: bank.balance }));
        }
      }
    }, 500); // Fake delay for verifying
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
        <Text style={styles.headerTitle}>Check Balance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Wallet Balance Section */}
        <Text style={styles.sectionHeader}>NexaPay Wallet</Text>
        <View style={styles.accountCard}>
          <View style={styles.accountInfo}>
            <MaterialIcons name="account-balance-wallet" size={32} color="#ec4899" />
            <View style={styles.accountTextContainer}>
              <Text style={styles.accountName}>Wallet Balance</Text>
            </View>
          </View>
          
          {walletRevealed ? (
            <Text style={styles.balanceText}>₹{walletBalance?.toFixed(2)}</Text>
          ) : (
            <TouchableOpacity style={styles.checkButton} onPress={() => openPinModal()}>
              <Text style={styles.checkButtonText}>Check Balance</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bank Accounts Section */}
        <Text style={styles.sectionHeader}>Linked Bank Accounts</Text>
        
        {banks.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="account-balance" size={60} color="#d1d5db" style={{ marginBottom: 15 }} />
            <Text style={styles.noBanksText}>No bank accounts linked yet.</Text>
            <TouchableOpacity style={styles.addBankPrimaryButton} onPress={() => router.push('/add-bank')}>
              <Text style={styles.addBankPrimaryText}>+ Link Bank Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {banks.map(bank => (
              <View key={bank._id} style={styles.accountCard}>
                <View style={styles.accountInfo}>
                  <View style={styles.bankIconPlaceholder}>
                    <MaterialIcons name="account-balance" size={24} color="#6b21a8" />
                  </View>
                  <View style={styles.accountTextContainer}>
                    <Text style={styles.accountName}>{bank.bankName}</Text>
                    <Text style={styles.accountNumber}>XXXX {bank.accountNumberLast4}</Text>
                  </View>
                </View>
                
                {revealedBalances[bank._id] !== undefined ? (
                  <Text style={styles.balanceText}>₹{revealedBalances[bank._id].toFixed(2)}</Text>
                ) : (
                  <TouchableOpacity style={styles.checkButton} onPress={() => openPinModal(bank._id)}>
                    <Text style={styles.checkButtonText}>Check Balance</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            
            <TouchableOpacity style={styles.addBankSecondaryButton} onPress={() => router.push('/add-bank')}>
              <MaterialIcons name="add-circle-outline" size={20} color="#ec4899" />
              <Text style={styles.addBankSecondaryText}>Add Another Bank Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* UPI PIN Modal Simulator */}
      <Modal visible={showPinModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter UPI PIN</Text>
            <Text style={styles.modalSubtitle}>To check your balance securely</Text>
            
            <TextInput
              style={styles.pinInput}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              autoFocus
              value={pin}
              onChangeText={setPin}
              placeholder="* * * *"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPinModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyPin}>
                <Text style={styles.verifyButtonText}>Verify</Text>
              </TouchableOpacity>
            </View>
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
  sectionHeader: {
    fontSize: 14, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase',
    marginBottom: 10, marginTop: 10,
  },
  accountCard: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 20, marginBottom: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  accountInfo: { flexDirection: 'row', alignItems: 'center' },
  bankIconPlaceholder: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#f3e8ff',
    justifyContent: 'center', alignItems: 'center',
  },
  accountTextContainer: { marginLeft: 15 },
  accountName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  accountNumber: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  checkButton: {
    backgroundColor: '#3b0764', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20,
  },
  checkButtonText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  balanceText: { fontSize: 18, fontWeight: 'bold', color: '#10b981' }, // Green for money
  
  // Empty State and Add Bank Button Styles
  emptyStateContainer: { alignItems: 'center', paddingVertical: 40 },
  noBanksText: { fontSize: 16, color: '#6b7280', marginBottom: 20, textAlign: 'center' },
  addBankPrimaryButton: {
    backgroundColor: '#ec4899', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30,
    elevation: 3, shadowColor: '#ec4899', shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: { width: 0, height: 3 },
  },
  addBankPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  addBankSecondaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15,
    marginTop: 10, borderWidth: 1, borderColor: '#ec4899', borderRadius: 12, borderStyle: 'dashed'
  },
  addBankSecondaryText: { color: '#ec4899', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#ffffff', width: '85%', maxWidth: 400, borderRadius: 16, padding: 25, alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 25 },
  pinInput: {
    fontSize: 24, letterSpacing: 10, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: '#ec4899',
    width: '60%', paddingVertical: 10, marginBottom: 30, color: '#1f2937'
  },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelButton: { flex: 1, padding: 12, alignItems: 'center', marginRight: 10 },
  cancelButtonText: { color: '#6b7280', fontWeight: 'bold', fontSize: 16 },
  verifyButton: { flex: 1, backgroundColor: '#ec4899', padding: 12, borderRadius: 12, alignItems: 'center' },
  verifyButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});
