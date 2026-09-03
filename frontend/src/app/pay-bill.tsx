import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, TextInput, ScrollView, Modal, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiFetch } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

const COUNTRY_CODES = [
  { code: '+91', country: 'India 🇮🇳' },
  { code: '+1', country: 'USA/Canada 🇺🇸🇨🇦' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+61', country: 'Australia 🇦🇺' },
  { code: '+971', country: 'UAE 🇦🇪' },
  { code: '+65', country: 'Singapore 🇸🇬' },
];

const OPERATORS = ['Jio', 'Airtel', 'Vi', 'BSNL'];

export default function PayBill() {
  const { service } = useLocalSearchParams();
  const router = useRouter();
  
  const [paying, setPaying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // User Details
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Mobile Recharge Specific
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryModal, setShowCountryModal] = useState(false);

  const handlePayment = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    
    if (!customerName || !phoneNumber) {
      Alert.alert('Missing Details', 'Please enter your name and phone number.');
      return;
    }

    if (service === 'Mobile Recharge' && !selectedOperator) {
      Alert.alert('Select Operator', 'Please select your mobile operator.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardNumber || !expiry || !cvv) {
        Alert.alert('Missing Card Details', 'Please fill in all card details.');
        return;
      }
    }
    
    setPaying(true);
    try {
      const response = await apiFetch('/bills/pay', {
        method: 'POST',
        body: JSON.stringify({
          service: service || 'Utility',
          amount: numericAmount,
          paymentMethod: paymentMethod,
        })
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Could not process payment. Check balance.');
    } finally {
      setPaying(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{service} Payment</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Payment Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your name"
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={styles.phoneInputWrapper}>
              <TouchableOpacity style={styles.countryCodeButton} onPress={() => setShowCountryModal(true)}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
                <MaterialIcons name="arrow-drop-down" size={20} color="#6b7280" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneTextInput}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
          </View>

          {service === 'Mobile Recharge' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Operator</Text>
              <View style={styles.operatorGrid}>
                {OPERATORS.map((op) => (
                  <TouchableOpacity 
                    key={op} 
                    style={[styles.operatorPill, selectedOperator === op && styles.operatorPillSelected]}
                    onPress={() => setSelectedOperator(op)}
                  >
                    <Text style={[styles.operatorText, selectedOperator === op && styles.operatorTextSelected]}>
                      {op}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount:</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#fbcfe8"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
          </View>

          <View style={styles.paymentMethodContainer}>
            <Text style={styles.paymentMethodTitle}>Select Payment Method</Text>
            <View style={styles.paymentMethodOptions}>
              <TouchableOpacity 
                style={[styles.paymentMethodOption, paymentMethod === 'wallet' && styles.paymentMethodOptionSelected]}
                onPress={() => setPaymentMethod('wallet')}
              >
                <Text style={[styles.paymentMethodText, paymentMethod === 'wallet' && styles.paymentMethodTextSelected]}>Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.paymentMethodOption, paymentMethod === 'card' && styles.paymentMethodOptionSelected]}
                onPress={() => setPaymentMethod('card')}
              >
                <Text style={[styles.paymentMethodText, paymentMethod === 'card' && styles.paymentMethodTextSelected]}>Card</Text>
              </TouchableOpacity>
            </View>
          </View>

          {paymentMethod === 'card' && (
            <View style={styles.cardDetailsContainer}>
              <Text style={styles.cardSectionTitle}>Card Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0000 0000 0000 0000"
                  keyboardType="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                />
              </View>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Expiry</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="MM/YY"
                    maxLength={5}
                    value={expiry}
                    onChangeText={setExpiry}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="123"
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    value={cvv}
                    onChangeText={setCvv}
                  />
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.payButton, paying && styles.payButtonDisabled]} 
            onPress={handlePayment}
            disabled={paying}
          >
            <Text style={styles.payButtonText}>
              {paying ? 'Processing...' : amount ? `Pay ₹${amount}` : 'Pay'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Code Modal */}
      <Modal visible={showCountryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.countryItem}
                  onPress={() => {
                    setCountryCode(item.code);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryItemName}>{item.country}</Text>
                  <Text style={styles.countryItemCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCountryModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Our Custom Success Modal Dialog */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.successModalEmoji}>🎉</Text>
            <Text style={styles.successModalTitle}>Payment Successful!</Text>
            <Text style={styles.successModalMessage}>
              ₹{parseFloat(amount || '0').toFixed(2)} paid for {service}.
            </Text>
            <TouchableOpacity style={styles.successModalButton} onPress={handleModalClose}>
              <Text style={styles.successModalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e8ff',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b0764',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b0764',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
  },
  billCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#ec4899',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  billTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b0764',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountContainer: {
    backgroundColor: '#fdf2f8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#ec4899',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#db2777',
    marginRight: 5,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#db2777',
    minWidth: 100,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fbcfe8',
    paddingVertical: 0,
  },
  paymentMethodContainer: {
    marginBottom: 20,
  },
  paymentMethodTitle: {
    fontSize: 14,
    color: '#3b0764',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paymentMethodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  paymentMethodOptionSelected: {
    borderColor: '#ec4899',
    backgroundColor: '#fdf2f8',
  },
  paymentMethodText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  paymentMethodTextSelected: {
    color: '#db2777',
    fontWeight: 'bold',
  },
  cardDetailsContainer: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  payButton: {
    backgroundColor: '#3b0764',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
    backgroundColor: '#f3f4f6',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  phoneTextInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  operatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  operatorPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  operatorPillSelected: {
    backgroundColor: '#fdf2f8',
    borderColor: '#ec4899',
  },
  operatorText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  operatorTextSelected: {
    color: '#db2777',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  countryItemName: {
    fontSize: 16,
    color: '#1f2937',
  },
  countryItemCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  // Styles for our custom success modal dialog
  successModalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20
  },
  successModalContent: {
    backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', width: '100%', maxWidth: 400,
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4
  },
  successModalEmoji: { fontSize: 50, marginBottom: 15 },
  successModalTitle: { fontSize: 24, fontWeight: 'bold', color: '#3b0764', marginBottom: 10, textAlign: 'center' },
  successModalMessage: { fontSize: 16, color: '#4b5563', textAlign: 'center', marginBottom: 25 },
  successModalButton: { backgroundColor: '#3b0764', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 30, width: '100%', alignItems: 'center' },
  successModalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
