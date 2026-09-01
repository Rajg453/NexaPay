import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export const WalletCard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const data = await apiFetch('/wallet/balance');
        setBalance(data.balance);
        setPoints(data.rewardPoints);
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      }
    };
    
    fetchWallet();
  }, []);

  return (
    <div className="glass-card">
      <div className="flex-row">
        <div className="flex-col">
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>
            Available Balance
          </span>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-main)' }}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        
        <button className="btn-primary" onClick={() => navigate('/add-money')}>
          + Add Money
        </button>
      </div>
      
      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '20px 0' }}></div>
      
      <div className="flex-row">
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Reward Points: <strong style={{color: '#f59e0b'}}>{points.toLocaleString()}</strong></span>
        <span 
          style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
          onClick={() => navigate('/rewards')}
        >
          View Rewards ➔
        </span>
      </div>
    </div>
  );
};
