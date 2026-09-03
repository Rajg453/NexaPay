import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { apiFetch } from '../services/api';

export default function Profile() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await apiFetch('/wallet/balance');
        setBalance(data.balance || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfileData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <Text style={styles.name}>User</Text>
          <Text style={styles.upiId}>user@nexapay</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem} onPress={() => router.push('/check-balance')}>
            <MaterialIcons name="account-balance" size={24} color="#6b21a8" />
            <Text style={styles.optionText}>Linked Bank Accounts</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <MaterialIcons name="qr-code-scanner" size={24} color="#6b21a8" />
            <Text style={styles.optionText}>My QR Code</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={() => router.push('/history')}>
            <MaterialIcons name="receipt-long" size={24} color="#6b21a8" />
            <Text style={styles.optionText}>Transaction History</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem} onPress={() => router.push('/add-money')}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#6b21a8" />
            <Text style={styles.optionText}>Wallet Balance: ₹{balance.toFixed(2)}</Text>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    backgroundColor: '#ffffff', padding: 15, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#3b0764' },
  scrollContent: { padding: 20 },
  profileCard: {
    backgroundColor: '#ffffff', padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 20,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#f3e8ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#3b0764' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  upiId: { fontSize: 14, color: '#6b7280', marginTop: 5 },
  optionsContainer: {
    backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', marginBottom: 20,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
  },
  optionItem: {
    flexDirection: 'row', alignItems: 'center', padding: 18,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
  },
  optionText: { fontSize: 16, color: '#374151', marginLeft: 15, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row', backgroundColor: '#fef2f2', padding: 18, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fecaca'
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});
