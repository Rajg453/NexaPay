import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme, Platform } from 'react-native';

export default function AppTabs() {
  const scheme = useColorScheme();

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#ec4899', // NexaPay Pink
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f3f4f6',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        }
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <MaterialIcons name="receipt-long" size={28} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={28} color={color} />
        }} 
      />

      {/* Hide all other screens from the tab bar so they behave like stack screens */}
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
      <Tabs.Screen name="pay-bill" options={{ href: null }} />
      <Tabs.Screen name="add-money" options={{ href: null }} />
      <Tabs.Screen name="check-balance" options={{ href: null }} />
      <Tabs.Screen name="add-bank" options={{ href: null }} />
      <Tabs.Screen name="to-bank" options={{ href: null }} />
      <Tabs.Screen name="to-self" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="pay-phone" options={{ href: null }} />
    </Tabs>
  );
}
