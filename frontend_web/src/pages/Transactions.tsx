import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

type Transaction = {
  _id: string;
  title: string;
  amount: number;
  type: 'sent' | 'received';
  createdAt: string;
};

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await apiFetch('/transactions/recent');
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const TransactionItem = ({ name, date, amount, type }: { name: string, date: string, amount: string, type: 'sent' | 'received' }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          backgroundColor: type === 'received' ? '#e6f4ea' : '#fce8e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          {type === 'received' ? '↙️' : '↗️'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '500', fontSize: '16px', color: 'var(--text-main)' }}>{name}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{date}</span>
        </div>
      </div>
      
      <span style={{ 
        fontWeight: 'bold', 
        fontSize: '16px',
        color: type === 'received' ? 'var(--success)' : 'var(--text-main)' 
      }}>
        {type === 'received' ? '+' : '-'}₹{amount}
      </span>
    </div>
  );

  return (
    <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ color: 'var(--text-main)', fontSize: '24px', marginBottom: '20px' }}>Transaction History</h2>
      
      <div className="flex-col">
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</p>
        ) : (
          transactions.map(t => (
            <TransactionItem 
              key={t._id}
              name={t.title} 
              date={new Date(t.createdAt).toLocaleString()} 
              amount={t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} 
              type={t.type} 
            />
          ))
        )}
      </div>
    </div>
  );
};

