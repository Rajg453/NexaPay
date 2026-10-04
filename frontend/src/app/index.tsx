// Import React and hooks for managing state and lifecycle
import React, { useEffect, useState } from 'react';
// Import UI components from React Native
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, FlatList, Modal, TouchableWithoutFeedback } from 'react-native';
// Import AsyncStorage for saving data (like login tokens) locally on the phone
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import our custom API fetching tool to talk to the backend
import { apiFetch } from '../services/api';
// Import Expo Router for navigating between screens
import { useRouter } from 'expo-router';
// Import vector icons for professional UI
import { MaterialIcons } from '@expo/vector-icons';
// Import the Floating AI Assistant
import { NexaAI } from '../components/NexaAI';

// This is the main Dashboard component, the first screen the user sees after logging in
export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          router.replace('/login');
          return; 
        }

        const data = await apiFetch('/wallet/balance');
        setBalance(data.balance || 0);
        setRewardPoints(data.rewardPoints || 0);
      } catch (err: any) {
        if (err.message.includes('Not authorized') || err.message.includes('token')) {
          await AsyncStorage.removeItem('token');
          router.replace('/login');
        } else {
          console.error(err);
        }
      }
    };
    fetchBalance(); 
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fdf2f8" barStyle="dark-content" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.profileIconPlaceholder}
            onPress={() => setSidebarVisible(true)}
          >
            <Text style={styles.profileInitial}>U</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.greetingText}>Hello, User</Text>
            <Text style={styles.upiIdText}>user@nexapay</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.headerIcon}>❓</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={async () => {
              await AsyncStorage.removeItem('token');
              router.replace('/login');
            }}
          >
            <MaterialIcons name="logout" size={24} color="#ec4899" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* WALLET CARD - Mirrors the Web WalletCard */}
        <View style={styles.glassCard}>
          <View style={styles.flexRow}>
            <View style={styles.flexCol}>
              <Text style={styles.textMuted}>Available Balance</Text>
              <Text style={styles.walletBalance}>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
            
            <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/add-money')}>
              <Text style={styles.btnPrimaryText}>+ Add Money</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.flexRow}>
            <Text style={styles.textMutedSmall}>
              Reward Points: <Text style={styles.pointsText}>{rewardPoints}</Text>
            </Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.viewRewardsText}>View Rewards ➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTION BUTTONS (Scan, Bank, Mobile, Receive) */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>Money Transfers</Text>
          <View style={styles.gridContainer}>
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/scan')}>
              <View style={styles.iconCircleTransfer}>
                 <MaterialIcons name="qr-code-scanner" size={28} color="#ffffff" />
              </View>
              <Text style={styles.gridText}>Scan & Pay</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/pay-phone')}>
              <View style={styles.iconCircleTransfer}>
                 <MaterialIcons name="phone-android" size={28} color="#ffffff" />
              </View>
              <Text style={styles.gridText}>To Mobile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/check-balance')}>
              <View style={styles.iconCircleTransfer}>
                 <MaterialIcons name="credit-card" size={28} color="#ffffff" />
              </View>
              <Text style={styles.gridText}>Receive QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/to-bank')}>
              <View style={styles.iconCircleTransfer}>
                 <MaterialIcons name="account-balance" size={28} color="#ffffff" />
              </View>
              <Text style={styles.gridText}>To Bank</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SERVICES - RECHARGE & PAY BILLS */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionTitle}>Recharge & Pay Bills</Text>
          <View style={styles.gridContainerThreeCol}>
            <TouchableOpacity style={styles.gridItemThreeCol} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Mobile' } })}>
              <View style={styles.iconCirclePink}>
                <Text style={styles.gridIconText}>📱</Text>
              </View>
              <Text style={styles.gridTextPurple}>Mobile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItemThreeCol} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'DTH' } })}>
              <View style={styles.iconCirclePink}>
                <Text style={styles.gridIconText}>📺</Text>
              </View>
              <Text style={styles.gridTextPurple}>DTH</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItemThreeCol} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Electricity' } })}>
              <View style={styles.iconCirclePink}>
                <Text style={styles.gridIconText}>💡</Text>
              </View>
              <Text style={styles.gridTextPurple}>Electricity</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItemThreeCol} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Credit Card' } })}>
              <View style={styles.iconCirclePink}>
                <Text style={styles.gridIconText}>💳</Text>
              </View>
              <Text style={styles.gridTextPurple}>Credit Card</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItemThreeCol} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Rent' } })}>
              <View style={styles.iconCirclePink}>
                <Text style={styles.gridIconText}>🏠</Text>
              </View>
              <Text style={styles.gridTextPurple}>Rent</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItemThreeCol} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Water' } })}>
              <View style={styles.iconCirclePink}>
                <Text style={styles.gridIconText}>💧</Text>
              </View>
              <Text style={styles.gridTextPurple}>Water</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItemThreeCol} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Gas' } })}>
              <View style={styles.iconCirclePink}>
                <Text style={styles.gridIconText}>⛽</Text>
              </View>
              <Text style={styles.gridTextPurple}>Gas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.gridItemThreeCol} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Education' } })}>
              <View style={styles.iconCirclePink}>
                <Text style={styles.gridIconText}>🎓</Text>
              </View>
              <Text style={styles.gridTextPurple}>Education</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECENT TRANSACTIONS */}
        <View style={styles.glassCard}>
          <View style={styles.flexRow}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.viewRewardsText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <Text style={{ color: '#6b21a8', fontSize: 16 }}>No recent transactions</Text>
          </View>
        </View>

      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navText}>Stores</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🛡️</Text>
          <Text style={styles.navText}>Insurance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📈</Text>
          <Text style={styles.navText}>Wealth</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
          <Text style={styles.navIcon}>📜</Text>
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
      </View>

      {/* SIDEBAR MODAL */}
      <Modal
        visible={sidebarVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSidebarVisible(false)}>
          <View style={styles.sidebarOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sidebarContent}>
                <View style={styles.sidebarHeader}>
                  <View style={styles.profileIconPlaceholder}>
                    <Text style={styles.profileInitial}>U</Text>
                  </View>
                  <Text style={styles.sidebarName}>User</Text>
                  <Text style={styles.sidebarUpi}>user@nexapay</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/analytics');
                  }}
                >
                  <MaterialIcons name="pie-chart" size={24} color="#ec4899" />
                  <Text style={styles.sidebarItemText}>Dashboard</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Floating AI Assistant */}
      <NexaAI />
    </SafeAreaView>
  );
}

// STYLING: Matching the Vercel App Theme
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fdf2f8', // var(--bg-dark)
  },
  container: {
    flex: 1,
    backgroundColor: '#fdf2f8',
    width: '100%',
    maxWidth: 600, // Make it look like a mobile app even on desktop browsers
    alignSelf: 'center', // Center it on large screens
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fbcfe8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitial: {
    color: '#3b0764', // var(--text-main)
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b0764', 
  },
  upiIdText: {
    fontSize: 12,
    color: '#6b21a8', // var(--text-muted)
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
  headerIcon: {
    fontSize: 20,
  },
  
  /* GLASS CARD STYLES */
  glassCard: {
    backgroundColor: '#ffffff', // var(--card-bg)
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fbcfe8', // var(--border)
    marginBottom: 16,
    shadowColor: '#ec4899',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexCol: {
    flexDirection: 'column',
  },
  textMuted: {
    color: '#6b21a8',
    fontSize: 14,
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b0764',
  },
  btnPrimary: {
    backgroundColor: '#ec4899', // var(--primary)
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#fbcfe8',
    marginVertical: 20,
  },
  textMutedSmall: {
    color: '#6b21a8',
    fontSize: 14,
  },
  pointsText: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  viewRewardsText: {
    color: '#ec4899',
    fontSize: 14,
    fontWeight: '600',
  },
  
  /* SECTIONS */
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b0764',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridContainerThreeCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 16, // Use gap for easy spacing
  },
  gridItemThreeCol: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fbcfe8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCirclePink: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fdf2f8', // Very light pink background from screenshot
    borderWidth: 1,
    borderColor: '#fbcfe8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircleTransfer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#ec4899', // primary vibrant pink
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#ec4899',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  gridIconText: {
    fontSize: 22,
  },
  gridText: {
    fontSize: 12,
    color: '#3b0764',
    textAlign: 'center',
    fontWeight: '600',
  },
  gridTextPurple: {
    fontSize: 13,
    color: '#6b21a8', // Matching the lighter purple in screenshot
    textAlign: 'center',
    fontWeight: '500',
  },

  /* SIDEBAR */
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarContent: {
    width: '75%',
    maxWidth: 300,
    backgroundColor: '#ffffff',
    height: '100%',
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#fbcfe8',
    alignItems: 'center',
    marginBottom: 10,
  },
  sidebarName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b0764',
    marginTop: 10,
  },
  sidebarUpi: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 20,
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b0764',
    marginLeft: 15,
  },
  
  /* BOTTOM NAVIGATION */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#fbcfe8',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#6b21a8', // Purple
    fontWeight: '500',
  },
  navTextActive: {
    fontSize: 12,
    color: '#ec4899', // Pink
    fontWeight: 'bold',
  }
});

