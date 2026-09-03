import React, { useState } from 'react';
// Importing necessary UI components from react-native, including Modal for our dialog
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, TextInput, ScrollView, Platform, Modal } from 'react-native';
// Importing useRouter for navigation between screens
import { useRouter } from 'expo-router';
// Importing our custom API fetch helper
import { apiFetch } from '../services/api';

export default function ToBank() {
  // Initialize the router for navigation
  const router = useRouter();
  
  // State variables to hold the user's input for various fields
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [amount, setAmount] = useState('');
  
  // State to show loading/processing status
  const [processing, setProcessing] = useState(false);
  // State to hold any validation error messages to show on the screen
  const [errorMessage, setErrorMessage] = useState('');
  // State to control when to show our custom success dialog modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Function called when the user presses the "Proceed to Pay" button
  const handleTransfer = async () => {
    // Clear any previous error messages
    setErrorMessage('');

    // Check if any of the required fields are empty
    if (!accountNumber || !confirmAccountNumber || !ifscCode || !receiverName || !amount) {
      const errorMsg = 'Please fill in all the details.';
      setErrorMessage(errorMsg); // Set error message state
      if (Platform.OS !== 'web') Alert.alert('Missing Details', errorMsg); // Show native alert if not on web
      return; // Stop execution if validation fails
    }

    // Check if the account numbers entered in both fields match
    if (accountNumber !== confirmAccountNumber) {
      const errorMsg = 'Account numbers do not match.';
      setErrorMessage(errorMsg);
      if (Platform.OS !== 'web') Alert.alert('Mismatch', errorMsg);
      return; // Stop execution
    }

    // Convert the amount string to a number for validation
    const numericAmount = parseFloat(amount);
    // Check if the amount is a valid positive number
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const errorMsg = 'Please enter a valid transfer amount.';
      setErrorMessage(errorMsg);
      if (Platform.OS !== 'web') Alert.alert('Invalid Amount', errorMsg);
      return; // Stop execution
    }

    // Set processing state to true so the button disables and shows "Processing..."
    setProcessing(true);
    try {
      // Make a POST request to our backend API to process the transfer
      // The await keyword pauses execution until the API responds
      const response = await apiFetch('/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: receiverName, // We are using receiverName as the receiverId here
          amount: numericAmount, // The validated amount
          paymentMethod: 'wallet', // Transferring out from wallet
        })
      });
      
      // If successful, show our custom success dialog modal
      setShowSuccessModal(true);
    } catch (error: any) {
      // If the API call fails, show the error message
      const errorMsg = error.message || 'Could not process transfer.';
      setErrorMessage(errorMsg);
    } finally {
      // Always set processing to false at the end, whether success or failure
      setProcessing(false);
    }
  };

  // Function to handle closing the modal and navigating back
  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.replace('/');
  };

  return (
    // SafeAreaView ensures content is visible within the safe area of device screens
    <SafeAreaView style={styles.container}>
      {/* Header section with a back button and title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send to Bank</Text>
      </View>

      {/* ScrollView allows the screen to be scrollable if the content is long */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Recipient Bank Details</Text>

          {/* Display error message if it exists */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          
          {/* Account Number Input Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Account Number"
              keyboardType="numeric" // Shows numeric keyboard on mobile
              // Removed secureTextEntry so the account number is visible as requested
              value={accountNumber}
              onChangeText={setAccountNumber} // Updates state when text changes
            />
          </View>

          {/* Re-enter Account Number Input Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Re-enter Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm Account Number"
              keyboardType="numeric"
              value={confirmAccountNumber}
              onChangeText={setConfirmAccountNumber}
            />
          </View>

          {/* IFSC Code Input Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. SBIN0001234"
              autoCapitalize="characters" // Automatically capitalizes characters
              value={ifscCode}
              onChangeText={setIfscCode}
            />
          </View>

          {/* Receiver Name Input Group */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Receiver Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Receiver's Name"
              value={receiverName}
              onChangeText={setReceiverName}
            />
          </View>

          {/* Transfer Amount Input Group */}
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

          {/* Proceed to Pay Button */}
          <TouchableOpacity 
            style={[styles.transferButton, processing && styles.disabledButton]} 
            onPress={handleTransfer} // Calls handleTransfer when clicked
            disabled={processing} // Disables the button when processing is true
          >
            <Text style={styles.buttonText}>
              {/* Show 'Processing...' if true, else show amount if available, else just 'Proceed to Pay' */}
              {processing ? 'Processing...' : amount ? `Proceed to Pay ₹${amount}` : 'Proceed to Pay'}
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
              ₹{parseFloat(amount || '0').toFixed(2)} was successfully sent to {receiverName}.
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

// StyleSheet for the component
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
  errorText: { color: 'red', marginBottom: 15, fontWeight: 'bold', textAlign: 'center' }, // Style for error message
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: '#6b7280', marginBottom: 5, fontWeight: '500' },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12,
    fontSize: 16, backgroundColor: '#f9fafb', color: '#1f2937'
  },
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
