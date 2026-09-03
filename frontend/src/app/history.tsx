import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../services/api';

// This interface defines what a Transaction looks like from our backend
interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: 'sent' | 'received';
  category: string;
  createdAt: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // Calling our backend to get the 10 most recent transactions
      const data = await apiFetch('/transactions/recent');
      setTransactions(data);
      setErrorMessage(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      setErrorMessage(error.message || 'Could not fetch transactions. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  // This helper function picks an emoji icon based on the transaction category
  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'wallet': return '👛';
      case 'transfer': return '💸';
      case 'recharge': return '📱';
      default: return '🧾';
    }
  };

  // This is how a single transaction row is drawn
  const renderItem = ({ item }: { item: Transaction }) => {
    const isReceived = item.type === 'received';
    // Format the date to look nice (e.g., "Aug 25, 2026")
    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    return (
      <View style={styles.transactionCard}>
        <View style={styles.cardLeft}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{getIconForCategory(item.category)}</Text>
          </View>
          <View>
            <Text style={styles.transactionTitle}>{item.title}</Text>
            <Text style={styles.transactionDate}>{dateStr}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.amountText, isReceived ? styles.amountPositive : styles.amountNegative]}>
            {isReceived ? '+' : '-'}₹{item.amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 50 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : errorMessage ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Oops! Something went wrong.</Text>
          <Text style={styles.emptySubText}>{errorMessage}</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No transactions yet.</Text>
          <Text style={styles.emptySubText}>Make a payment using your wallet or bank account to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

// STYLING: Premium Dark Purple, Pink, and White Theme
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3e8ff', // Light purple
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b0764',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6b21a8',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    elevation: 2,
    shadowColor: '#ec4899',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#faf5ff', // Very light purple
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b0764',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#6b21a8',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountPositive: {
    color: '#10b981', // Emerald Green for money received
  },
  amountNegative: {
    color: '#3b0764', // Dark Purple/Black for money spent
  },
});
