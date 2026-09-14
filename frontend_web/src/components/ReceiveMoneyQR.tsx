import React, { useState } from 'react';
import QRCode from 'react-qr-code';

export const ReceiveMoneyQR = ({ onClose }: { onClose: () => void }) => {
  // We'll hardcode the user ID for now since we don't have full auth state context here, 
  // but in a real app, this would come from a global state like Redux or Context API.
  const [userId, setUserId] = useState('650c1f1f1c9d440000a1b2c3'); // Example Mock ID
  const [amount, setAmount] = useState('');

  // The data that will be encoded into the QR code
  const qrData = JSON.stringify({
    userId,
    amount: amount ? Number(amount) : undefined,
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)',
    }}>
      <div className="glass-card" style={{
        padding: '30px',
        width: '90%',
        maxWidth: '350px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: '#111827', // Using a premium dark color
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px', right: '15px',
            background: 'none', border: 'none',
            fontSize: '24px', cursor: 'pointer',
            color: '#9CA3AF',
          }}
        >
          ✖
        </button>

        <h2 style={{ marginTop: 0, color: 'white', fontWeight: 600 }}>Receive Money</h2>
        <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
          Show this QR code to the sender.
        </p>

        {/* The actual QR Code component */}
        <div style={{ background: 'white', padding: '16px', borderRadius: '16px' }}>
          <QRCode 
            value={qrData} 
            size={200}
            fgColor="#111827" 
          />
        </div>

        {/* Input for Dynamic QR (Specific Amount) */}
        <div style={{ marginTop: '24px', width: '100%' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#9CA3AF', marginBottom: '8px' }}>
            Set specific amount (Optional)
          </label>
          <input
            type="number"
            placeholder="₹0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #374151',
              backgroundColor: '#1F2937',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
    </div>
  );
};
