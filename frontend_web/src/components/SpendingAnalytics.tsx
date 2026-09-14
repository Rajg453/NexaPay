import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

type AnalyticsData = {
  total: number;
  categories: { name: string; amount: number }[];
};

export const SpendingAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await apiFetch('/transactions/analytics/monthly');
        setData(result);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': '#F59E0B',
      'Shopping': '#EC4899',
      'Bills': '#3B82F6',
      'Travel': '#10B981',
      'Transfer': '#8B5CF6',
      'General': '#6B7280'
    };
    // Return predefined color or generate a consistent one based on name length
    return colors[category] || `hsl(${(category.length * 15) % 360}, 70%, 60%)`;
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)' }}>This Month's Spending</h3>
        <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 500, backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '4px 8px', borderRadius: '12px' }}>Analytics</span>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your insights...
        </div>
      ) : !data || data.total === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No spending recorded this month.
        </div>
      ) : (
        <div className="flex-col" style={{ gap: '16px' }}>
          
          {/* Main Total */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Spent</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              ₹{data.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Progress Bar (Visual representation) */}
          <div style={{ width: '100%', height: '8px', borderRadius: '4px', display: 'flex', overflow: 'hidden', backgroundColor: 'var(--border)' }}>
            {data.categories.map((cat, idx) => (
              <div 
                key={idx} 
                style={{ 
                  height: '100%', 
                  width: `${(cat.amount / data.total) * 100}%`,
                  backgroundColor: getCategoryColor(cat.name)
                }} 
              />
            ))}
          </div>

          {/* Category List */}
          <div className="flex-col" style={{ gap: '12px', marginTop: '8px' }}>
            {data.categories.map((cat, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getCategoryColor(cat.name) }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>{cat.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 600 }}>
                    ₹{cat.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '35px', textAlign: 'right' }}>
                    {Math.round((cat.amount / data.total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
