import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface MobileTransferModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (fullNumber: string) => void;
}

export const MobileTransferModal: React.FC<MobileTransferModalProps> = ({ visible, onClose, onSubmit }) => {
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleProceed = () => {
    // Basic validation
    if (phoneNumber.length < 7 || phoneNumber.length > 15) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    onSubmit(`${countryCode}${phoneNumber}`);
    setPhoneNumber(''); // Reset on submit
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Send to Mobile</Text>
              
              <Text style={styles.label}>Enter recipient's mobile number</Text>
              
              <View style={styles.inputRow}>
                {/* Simplified Country Code Picker */}
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={countryCode}
                    style={styles.picker}
                    onValueChange={(itemValue) => setCountryCode(itemValue)}
                    dropdownIconColor="#fff"
                  >
                    <Picker.Item label="+91 (IN)" value="+91" color="#fff" />
                    <Picker.Item label="+1 (US)" value="+1" color="#fff" />
                    <Picker.Item label="+44 (UK)" value="+44" color="#fff" />
                    <Picker.Item label="+61 (AU)" value="+61" color="#fff" />
                  </Picker>
                </View>
                
                <TextInput
                  style={styles.phoneInput}
                  placeholder="000 000 0000"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  maxLength={15}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.proceedBtn, phoneNumber.length < 7 && styles.disabledBtn]} 
                  onPress={handleProceed}
                  disabled={phoneNumber.length < 7}
                >
                  <Text style={styles.proceedBtnText}>Proceed</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    color: '#fff',
  },
  phoneInput: {
    flex: 2,
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#ccc',
    fontWeight: '600',
    fontSize: 16,
  },
  proceedBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#444',
  },
  proceedBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
