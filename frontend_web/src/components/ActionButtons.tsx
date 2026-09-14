import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanAndPay } from './ScanAndPay';
import { ReceiveMoneyQR } from './ReceiveMoneyQR';

export const ActionButtons = () => {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const navigate = useNavigate();

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setPaymentStatus('Initiating payment...');
      
      const orderRes = await fetch('http://localhost:3000/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 50000, currency: 'INR' }), 
      });
      const order = await orderRes.json();

      if (order.error) {
        setPaymentStatus(`Error: ${order.error}`);
        setIsLoading(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Paystream',
        description: 'Test Transfer',
        order_id: order.id,
        handler: async function (response: any) {
          setPaymentStatus('Verifying payment...');
          const verifyRes = await fetch('http://localhost:3000/api/payments/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          
          if (verifyRes.ok) {
            setPaymentStatus('Payment Successful! 🎉');
          } else {
            setPaymentStatus('Payment Verification Failed!');
          }
        },
        prefill: {
          name: 'Gorai',
          email: 'gorai@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setPaymentStatus('Payment Failed');
      });

      rzp.open();
      setPaymentStatus(''); 
    } catch (error) {
      setPaymentStatus('Error initiating payment');
    } finally {
      setIsLoading(false);
    }
  };

  const ActionIcon = ({ icon, label, onClick }: { icon: string, label: string, onClick?: () => void }) => (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        width: '70px'
      }}
    >
      <div style={{
        width: '50px',
        height: '50px',
        backgroundColor: 'var(--primary)',
        color: 'white',
        borderRadius: '16px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '12px', textAlign: 'center', fontWeight: '500', color: 'var(--text-main)', lineHeight: '1.2' }}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-main)' }}>Money Transfers</h3>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <ActionIcon icon="📷" label="Scan & Pay" onClick={() => setShowScanner(true)} />
        <ActionIcon icon="📱" label="To Mobile" onClick={handlePayment} />
        <ActionIcon icon="💳" label="Receive QR" onClick={() => setShowQR(true)} />
        <ActionIcon icon="🏦" label="To Bank" />
      </div>

      {showScanner && <ScanAndPay onClose={() => setShowScanner(false)} />}
      {showQR && <ReceiveMoneyQR onClose={() => setShowQR(false)} />}

      {paymentStatus && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: 'var(--border)', 
          color: 'var(--primary)', 
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          {paymentStatus}
        </div>
      )}
    </div>
  );
};
