import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: string;
  status: string;
  senderId?: { _id: string; name: string; email: string } | string;
  receiverId?: { _id: string; name: string; email: string } | string;
  createdAt: string;
};

// Displays a list of recent transactions from backend
export const RecentTransactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  
  const TransactionItem = ({ tx }: { tx: Transaction }) => {
    // Determine if the current user is the receiver or sender
    let isReceived = false;
    
    // Check if receiverId matches current user (handle both populated object or plain string cases)
    if (tx.receiverId) {
      const rxId = typeof tx.receiverId === 'string' ? tx.receiverId : tx.receiverId._id;
      isReceived = rxId === user?._id;
    }
    
    // For deposits/withdrawals, logic might be simpler:
    if (tx.type === 'DEPOSIT') isReceived = true;
    if (tx.type === 'WITHDRAWAL') isReceived = false;

    // Status colors
    let statusColor = '#9CA3AF'; // PENDING / Default
    if (tx.status === 'SUCCESS') statusColor = '#10B981'; // Green
    if (tx.status === 'FAILED') statusColor = '#EF4444'; // Red

    return (
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
            backgroundColor: isReceived ? '#e6f4ea' : '#fce8e6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            {isReceived ? '↙️' : '↗️'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text-main)' }}>{tx.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {new Date(tx.createdAt).toLocaleDateString()}
              </span>
              <span style={{ 
                fontSize: '10px', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                backgroundColor: `${statusColor}20`, // 20% opacity
                color: statusColor,
                fontWeight: '600'
              }}>
                {tx.status}
              </span>
            </div>
          </div>
        </div>
        
        <span style={{ 
          fontWeight: '600', 
          color: isReceived ? 'var(--success)' : 'var(--text-main)' 
        }}>
          {isReceived ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>
    );
  };

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
              tx={t}
            />
          ))
        )}
      </div>
    </div>
  );
};
