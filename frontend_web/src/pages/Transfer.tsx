import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

export const Transfer = () => {
  const { receiverId } = useParams<{ receiverId: string }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');

  const handlePayClick = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus('Please enter a valid amount');
      return;
    }
    setShowPin(true); // Simulate asking for UPI PIN
  };

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      setStatus('PIN must be at least 4 digits');
      return;
    }
    
    setIsLoading(true);
    setStatus('Processing payment...');
    setShowPin(false);

    try {
      const res = await apiFetch('/transactions/transfer', {
        method: 'POST',
        body: JSON.stringify({
          receiverId,
          amount: Number(amount),
          paymentMethod: 'upi',
          // Hardcoding a generic bankAccountId for simulation
          bankAccountId: 'default_bank_id'
        })
      });
      
      if (res.message) {
        setStatus('Payment Successful! 🎉');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setStatus('Payment failed.');
      }
    } catch (error: any) {
      setStatus(error.message || 'Payment failed due to an error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '400px', margin: '40px auto', textAlign: 'center' }}>
      <h2 style={{ color: 'var(--text-main)' }}>Paying {receiverId}</h2>
      
      <div style={{ margin: '32px 0' }}>
        <span style={{ fontSize: '24px', color: 'var(--text-main)', marginRight: '8px' }}>₹</span>
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-main)',
            width: '200px',
            textAlign: 'center',
            outline: 'none'
          }}
          autoFocus
        />
      </div>

      {status && <p style={{ color: status.includes('Success') ? 'var(--success)' : 'var(--danger)', marginBottom: '16px' }}>{status}</p>}

      {!showPin ? (
        <button 
          className="btn-primary" 
          style={{ width: '100%' }} 
          onClick={handlePayClick}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : `Pay ₹${amount || '0'}`}
        </button>
      ) : (
        <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Enter 4-Digit UPI PIN</h4>
          <input 
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{
              fontSize: '24px',
              padding: '12px',
              width: '100px',
              textAlign: 'center',
              borderRadius: '8px',
              border: '1px solid var(--primary)',
              background: 'var(--bg-light)',
              color: 'var(--text-main)',
              marginBottom: '16px'
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" style={{ flex: 1, background: 'var(--border)', color: 'var(--text-main)' }} onClick={() => setShowPin(false)}>Cancel</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handlePinSubmit}>Submit</button>
          </div>
        </div>
      )}

      <button 
        style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        Go Back
      </button>
    </div>
  );
};
