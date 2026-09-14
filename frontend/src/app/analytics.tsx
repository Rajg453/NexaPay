import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { apiFetch } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/transactions/analytics/dashboard');
      setData(res);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`, // Pink color
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
    propsForLabels: {
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#6b7280'
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
          <Text style={styles.loadingText}>Analyzing your spending...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spent This Month</Text>
            <Text style={styles.summaryAmount}>₹{data?.totalSpentThisMonth?.toLocaleString()}</Text>
          </View>

          {/* Line Chart: Daily Trend */}
          {data?.dailyTrend && data.dailyTrend.data.some((d: number) => d > 0) && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Spending Trend (Last 7 Days)</Text>
              <LineChart
                data={{
                  labels: data.dailyTrend.labels,
                  datasets: [{ data: data.dailyTrend.data }]
                }}
                width={Math.min(screenWidth - 40, 600)}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chartStyle}
                withInnerLines={false}
              />
            </View>
          )}

          {/* Pie Chart: Categories */}
          {data?.categories && data.categories.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Category Breakdown</Text>
              <PieChart
                data={data.categories}
                width={Math.min(screenWidth - 40, 600)}
                height={220}
                chartConfig={chartConfig}
                accessor={"amount"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>
          )}

          {/* Bar Chart: Cash Flow */}
          {data?.cashFlow && (data.cashFlow.income > 0 || data.cashFlow.expense > 0) && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Income vs Expense</Text>
              <BarChart
                data={{
                  labels: ["Income", "Expense"],
                  datasets: [
                    {
                      data: [data.cashFlow.income, data.cashFlow.expense]
                    }
                  ]
                }}
                width={Math.min(screenWidth - 40, 600)}
                height={220}
                yAxisLabel="₹"
                yAxisSuffix=""
                chartConfig={chartConfig}
                style={styles.chartStyle}
                withInnerLines={false}
                showValuesOnTopOfBars={true}
              />
            </View>
          )}

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e8ff', // Light purple background
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#ec4899',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 50,
  },
  summaryCard: {
    backgroundColor: '#3b0764', // Deep purple
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  summaryLabel: {
    color: '#fbcfe8',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryAmount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    width: '100%',
    maxWidth: 600,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#ec4899',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center'
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    alignSelf: 'flex-start',
    marginBottom: 15,
    marginLeft: 5,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16
  }
});
