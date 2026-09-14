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

// This is the main Dashboard component, the first screen the user sees after logging in
export default function Dashboard() {
  // We create a state variable called 'balance' to store the user's money, starting at 0
  const [balance, setBalance] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0); // State for Rewards!
  const [sidebarVisible, setSidebarVisible] = useState(false); // State for Sidebar Modal
  // 'router' allows us to move to different screens (like '/login' or '/history')
  const router = useRouter();

  // useEffect runs this code once when the screen first loads
  useEffect(() => {
    // We create an async function to fetch the wallet balance from our server
    const fetchBalance = async () => {
      try {
        // We look inside the phone's storage to see if the user has a saved login token
        const token = await AsyncStorage.getItem('token');
        
        // If there's no token, the user is not logged in!
        if (!token) {
          // So we send them directly to the login screen
          router.replace('/login');
          // And we stop the function here so it doesn't try to fetch data
          return; 
        }

        // We ask our backend server for the current wallet balance using our API
        const data = await apiFetch('/wallet/balance');
        // We update our state with the numbers the server sent back
        setBalance(data.balance || 0);
        setRewardPoints(data.rewardPoints || 0);
      } catch (err: any) {
        // If the server throws an error, we catch it here
        // We check if the error is because the token is old or invalid
        if (err.message.includes('Not authorized') || err.message.includes('token')) {
          // If so, we delete the bad token from the phone
          await AsyncStorage.removeItem('token');
          // And force the user to log in again
          router.replace('/login');
        } else {
          // If it's a different error, we just print it to the console for debugging
          console.error(err);
        }
      }
    };
    // Now we actually call the function we just created above
    fetchBalance(); 
  }, []); // The empty brackets [] mean this only runs ONCE when the screen opens



  // This is what the screen will actually draw on the phone
  return (
    // SafeAreaView ensures our app doesn't go under the notch or status bar on modern phones
    <SafeAreaView style={styles.safeArea}>
      {/* StatusBar controls the color and text of the time/battery bar at the very top */}
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      {/* HEADER SECTION: Clean white header with Profile and Notifications */}
      <View style={styles.header}>
        {/* Left side: Profile Icon and Greeting */}
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
        {/* Right side: Notification Bell, Help, and Logout */}
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

      {/* ScrollView allows the user to scroll up and down if the content is too long */}
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* PRIMARY ACTION: The big 'Scan Any QR' button, prominent like GPay */}
        <View style={styles.scanContainer}>
          <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/scan')}>
            <Text style={styles.scanIcon}>📷</Text>
            <Text style={styles.scanText}>Scan Any QR</Text>
          </TouchableOpacity>
        </View>



        {/* WALLET & TOPUP SECTION: Shows balance and connects to Razorpay */}
        <View style={styles.card}>
          <View style={styles.walletHeader}>
            <Text style={styles.walletTitle}>NexaPay Wallet</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
               <Text style={styles.historyLink}>History ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.walletFlex}>
             <View>
                <Text style={styles.walletBalance}>₹{balance.toFixed(2)}</Text>
                {/* REWARDS BADGE */}
                <View style={styles.rewardsBadge}>
                   <Text style={styles.rewardsIcon}>🎁</Text>
                   <Text style={styles.rewardsText}>{rewardPoints} Rewards</Text>
                </View>
             </View>
             {/* This button will trigger Razorpay to add money */}
             <TouchableOpacity style={styles.topupButton} onPress={() => router.push('/add-money')}>
                <Text style={styles.topupButtonText}>+ Add Money</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* RECHARGE & PAY BILLS SECTION: A grid of utilities (BBPS Integration future) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recharge & Pay Bills</Text>
          <View style={styles.gridContainer}>
            {/* Mobile Recharge Button */}
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Mobile Recharge' } })}>
              <View style={styles.iconCircle}>
                <Text style={styles.gridIconText}>📱</Text>
              </View>
              <Text style={styles.gridText}>Mobile{'\n'}Recharge</Text>
            </TouchableOpacity>

            {/* DTH (TV) Recharge Button */}
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'DTH' } })}>
              <View style={styles.iconCircle}>
                <Text style={styles.gridIconText}>📺</Text>
              </View>
              <Text style={styles.gridText}>DTH</Text>
            </TouchableOpacity>

            {/* Electricity Bill Button */}
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Electricity' } })}>
              <View style={styles.iconCircle}>
                <Text style={styles.gridIconText}>💡</Text>
              </View>
              <Text style={styles.gridText}>Electricity</Text>
            </TouchableOpacity>

            {/* Gas Cylinder Button */}
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: '/pay-bill', params: { service: 'Gas Cylinder' } })}>
              <View style={styles.iconCircle}>
                <Text style={styles.gridIconText}>⛽</Text>
              </View>
              <Text style={styles.gridText}>Book a{'\n'}Cylinder</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OTHER PAYMENTS SECTION: Sending to Bank, Self, etc. */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Transfer Money</Text>
          <View style={styles.gridContainer}>
            {/* To Bank Account */}
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/to-bank')}>
              <View style={styles.iconCircleTransfer}>
                <MaterialIcons name="account-balance" size={26} color="#ffffff" />
              </View>
              <Text style={styles.gridText}>To Bank{'\n'}Account</Text>
            </TouchableOpacity>

            {/* To Self Account */}
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/to-self')}>
              <View style={styles.iconCircleTransfer}>
                <MaterialIcons name="autorenew" size={26} color="#ffffff" />
              </View>
              <Text style={styles.gridText}>To Self{'\n'}Account</Text>
            </TouchableOpacity>

            {/* Check Bank Balance */}
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/check-balance')}>
              <View style={styles.iconCircleTransfer}>
                <MaterialIcons name="account-balance-wallet" size={26} color="#ffffff" />
              </View>
              <Text style={styles.gridText}>Check{'\n'}Balance</Text>
            </TouchableOpacity>
            
            {/* Pay Contacts / Phone */}
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/pay-phone')}>
              <View style={styles.iconCircleTransfer}>
                <MaterialIcons name="contact-phone" size={26} color="#ffffff" />
              </View>
              <Text style={styles.gridText}>Pay{'\n'}Contacts</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

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

                {/* Add more sidebar items here in the future if needed */}

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </SafeAreaView>
  );
}

// STYLING: This is where we make things look pretty, like CSS for the web
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Unified white background
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff', // Light purple
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3e8ff', // Light purple
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitial: {
    color: '#3b0764', // Dark Purple
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b0764', // Dark Purple
  },
  upiIdText: {
    fontSize: 12,
    color: '#6b21a8', // Medium Purple
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  headerIcon: {
    fontSize: 22,
  },
  scanContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  scanButton: {
    backgroundColor: '#3b0764', // Dark Purple for main action
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#3b0764',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  scanIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  scanText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#ec4899', // Pink subtle shadow
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b0764', // Dark Purple
    marginBottom: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b0764', // Dark purple
  },
  historyLink: {
    color: '#ec4899', // Pink link
    fontSize: 14,
    fontWeight: 'bold',
  },
  walletFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b0764',
  },
  rewardsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f8', // Very light pink
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start', // Don't stretch across screen
  },
  rewardsIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  rewardsText: {
    color: '#db2777', // Darker pink for text
    fontSize: 12,
    fontWeight: 'bold',
  },
  topupButton: {
    backgroundColor: '#ec4899', // Vibrant pink button
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#ec4899',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topupButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#faf5ff', // Light purple
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircleTransfer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6b21a8', // Strong purple like PhonePe/GPay
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#6b21a8',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  gridIconText: {
    fontSize: 22,
  },
  gridText: {
    fontSize: 11,
    color: '#6b21a8', // Medium purple text
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
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
    borderBottomColor: '#f3e8ff',
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
});
