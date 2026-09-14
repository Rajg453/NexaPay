import React, { useState } from 'react';
import { apiFetch } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AddMoney = () => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    
    setIsLoading(true);
    try {
      // 1. Create order on backend
      const order = await apiFetch('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) * 100 }) // Razorpay expects paise
      });

      // 2. Initialize Razorpay options
      const options = {
        key: 'rzp_test_YOUR_KEY_ID', // In production, this should be fetched from backend or env
        amount: order.amount,
        currency: order.currency,
        name: 'NexaPay',
        description: 'Add Money to Wallet',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on backend
            await apiFetch('/payment/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: Number(amount)
              })
            });
            alert('Payment Successful!');
            navigate('/');
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name || 'User',
          email: user?.email || 'user@example.com',
        },
        theme: {
          color: '#6366f1'
        }
      };

      // @ts-ignore - Razorpay is loaded via script tag
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Failed to initiate payment", error);
      alert('Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ color: 'var(--text-main)', fontSize: '24px' }}>Add Money to Wallet</h2>
      <p style={{ color: 'var(--text-muted)' }}>Enter the amount you wish to add to your NexaPay wallet.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="number" 
          placeholder="₹ 0.00" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ 
            padding: '12px 16px', 
            fontSize: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            outline: 'none',
            background: 'var(--card-bg)'
          }} 
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setAmount('500')}>₹500</button>
          <button className="btn-secondary" onClick={() => setAmount('1000')}>₹1000</button>
          <button className="btn-secondary" onClick={() => setAmount('2000')}>₹2000</button>
        </div>
      </div>

      <button 
        className="btn-primary" 
        style={{ marginTop: '20px' }} 
        onClick={handlePayment}
        disabled={isLoading || !amount || Number(amount) <= 0}
      >
        {isLoading ? 'Processing...' : 'Proceed to Pay'}
      </button>
    </div>
  );
};
