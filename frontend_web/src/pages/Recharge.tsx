import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

interface BankAccount {
  _id: string;
  bankName: string;
  accountNumberLast4: string;
  balance: number;
}

export const Recharge = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet'>('wallet');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityCode, setSecurityCode] = useState('');

  // Fetch Banks and Wallet Balance on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [banksData, walletData] = await Promise.all([
          apiFetch('/banks'),
          apiFetch('/wallet/balance')
        ]);
        setBanks(banksData);
        setWalletBalance(walletData.balance);
        if (banksData.length > 0) {
          setPaymentMethod('upi');
          setSelectedBankId(banksData[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch payment methods", error);
      }
    };
    fetchData();
  }, []);
  
  const getTitle = () => {
    switch (type) {
      case 'mobile': return 'Mobile Recharge';
      case 'dth': return 'DTH Recharge';
      case 'electricity': return 'Pay Electricity Bill';
      case 'credit-card': return 'Pay Credit Card Bill';
      default: return 'Bill Payment';
    }
  };

  const handleInitialPaymentClick = () => {
    if (!identifier || !amount) {
      alert("Please enter both identifier and amount");
      return;
    }
    
    if (paymentMethod === 'wallet') {
      // Wallet doesn't need a PIN in our app
      processPayment();
    } else {
      // UPI and Card need a PIN/CVV
      setShowSecurityModal(true);
      setSecurityCode('');
    }
  };

  const processPayment = async () => {
    setStatus('loading');
    setErrorMsg('');
    setShowSecurityModal(false);
    
    try {
      await apiFetch('/bills/pay', {
        method: 'POST',
        body: JSON.stringify({
          service: getTitle(),
          amount: Number(amount),
          paymentMethod,
          bankAccountId: selectedBankId
        })
      });
      setStatus('success');
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMsg(error.message || 'Payment failed');
    }
  };

  if (status === 'success') {
    return (
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '64px', color: 'var(--success)', animation: 'bounce 0.5s ease' }}>✓</div>
        <h2 style={{ color: 'var(--success)' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-muted)' }}>Your {getTitle()} of ₹{amount} was successful via {paymentMethod.toUpperCase()}.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      <h2 style={{ color: 'var(--text-main)', fontSize: '24px', fontWeight: 600 }}>{getTitle()}</h2>
      
      {status === 'error' && (
        <div style={{ color: 'var(--error)', backgroundColor: '#fce8e6', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}

      {/* Inputs Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="flex-col" style={{ gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Identifier / Number</label>
          <input 
            type="text" 
            placeholder="Enter details..." 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            style={{ 
              padding: '14px 16px', 
              fontSize: '16px', 
              borderRadius: '12px', 
              border: '1px solid var(--border)',
              outline: 'none',
              background: 'var(--bg-main)',
              color: 'var(--text-main)',
              transition: 'border-color 0.2s ease'
            }} 
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        
        <div className="flex-col" style={{ gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Amount</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }}>₹</span>
            <input 
              type="number" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ 
                width: '100%',
                padding: '14px 16px 14px 40px', 
                fontSize: '18px', 
                fontWeight: 600,
                borderRadius: '12px', 
                border: '1px solid var(--border)',
                outline: 'none',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                transition: 'border-color 0.2s ease',
                boxSizing: 'border-box'
              }} 
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
      </div>

      {/* Payment Options (PhonePe / GPay Style) */}
      <div style={{ marginTop: '10px' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: 600 }}>Pay Using</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. Linked Banks (UPI) */}
          {banks.map((bank) => (
            <div 
              key={bank._id}
              onClick={() => { setPaymentMethod('upi'); setSelectedBankId(bank._id); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                borderRadius: '16px',
                border: `2px solid ${paymentMethod === 'upi' && selectedBankId === bank._id ? 'var(--primary)' : 'var(--border)'}`,
                background: paymentMethod === 'upi' && selectedBankId === bank._id ? 'rgba(99, 102, 241, 0.05)' : 'var(--card-bg)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '20px' }}>🏦</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{bank.bankName}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>•••• {bank.accountNumberLast4}</div>
              </div>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'upi' && selectedBankId === bank._id ? 'var(--primary)' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === 'upi' && selectedBankId === bank._id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />}
              </div>
            </div>
          ))}

          {/* 2. Debit / Credit Card */}
          <div 
            onClick={() => setPaymentMethod('card')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              borderRadius: '16px',
              border: `2px solid ${paymentMethod === 'card' ? 'var(--primary)' : 'var(--border)'}`,
              background: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.05)' : 'var(--card-bg)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '20px' }}>💳</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Debit / Credit Card</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Add new card to pay</div>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'card' ? 'var(--primary)' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {paymentMethod === 'card' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />}
            </div>
          </div>

          {/* 3. Wallet Option */}
          <div 
            onClick={() => setPaymentMethod('wallet')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              borderRadius: '16px',
              border: `2px solid ${paymentMethod === 'wallet' ? 'var(--primary)' : 'var(--border)'}`,
              background: paymentMethod === 'wallet' ? 'rgba(99, 102, 241, 0.05)' : 'var(--card-bg)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', fontSize: '20px' }}>👛</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Paystream Wallet</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Balance: ₹{walletBalance}</div>
            </div>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'wallet' ? 'var(--primary)' : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {paymentMethod === 'wallet' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleInitialPaymentClick}
        disabled={status === 'loading' || !amount}
        style={{
          marginTop: '10px',
          padding: '16px',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          opacity: (status === 'loading' || !amount) ? 0.7 : 1,
          transition: 'opacity 0.2s ease',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
        }}
      >
        {status === 'loading' ? 'Processing...' : `Pay ₹${amount || '0'}`}
      </button>

      {/* Security Code Modal (UPI PIN / CVV Simulation) */}
      {showSecurityModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg)',
            padding: '30px',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '350px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ textAlign: 'center', margin: 0, color: 'var(--text-main)' }}>
              {paymentMethod === 'upi' ? 'Enter UPI PIN' : 'Enter Card CVV'}
            </h3>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
              {paymentMethod === 'upi' ? 'Enter any 4 or 6 digit PIN to simulate payment.' : 'Enter any 3 digit CVV to simulate payment.'}
            </p>
            <input
              type="password"
              maxLength={6}
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              style={{
                letterSpacing: '8px',
                textAlign: 'center',
                fontSize: '24px',
                padding: '15px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowSecurityModal(false)}
                style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-main)' }}
              >
                Cancel
              </button>
              <button 
                onClick={processPayment}
                disabled={securityCode.length < 3}
                style={{ flex: 1, padding: '12px', background: 'var(--primary)', border: 'none', borderRadius: '10px', cursor: 'pointer', color: 'white', opacity: securityCode.length < 3 ? 0.5 : 1 }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
