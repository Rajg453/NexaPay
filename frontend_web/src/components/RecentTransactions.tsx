import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: 'sent' | 'received';
  createdAt: string;
};

// Displays a list of recent transactions from backend
export const RecentTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiFetch('/transactions/recent');
        setTransactions(data.slice(0, 4)); // Only show top 4 on dashboard
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      }
    };
    fetchTransactions();
  }, []);
  
  const TransactionItem = ({ name, date, amount, type }: { name: string, date: string, amount: string, type: 'sent' | 'received' }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: type === 'received' ? '#e6f4ea' : '#fce8e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          {type === 'received' ? '↙️' : '↗️'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text-main)' }}>{name}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{date}</span>
        </div>
      </div>
      
      <span style={{ 
        fontWeight: '600', 
        color: type === 'received' ? 'var(--success)' : 'var(--text-main)' 
      }}>
        {type === 'received' ? '+' : '-'}₹{amount}
      </span>
    </div>
  );

  return (
    <div className="glass-card">
      <div className="flex-row" style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: '0', fontSize: '16px', color: 'var(--text-main)' }}>Recent Transactions</h3>
        <span 
          style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
          onClick={() => navigate('/transactions')}
        >
          View All
        </span>
      </div>
      
      <div className="flex-col">
        {transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', padding: '20px 0' }}>No recent transactions</p>
        ) : (
          transactions.map(t => (
            <TransactionItem 
              key={t._id}
              name={t.title} 
              date={new Date(t.createdAt).toLocaleDateString()} 
              amount={t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} 
              type={t.type} 
            />
          ))
        )}
      </div>
    </div>
  );
};
