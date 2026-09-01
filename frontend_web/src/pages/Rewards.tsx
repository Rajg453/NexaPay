import React from 'react';

export const Rewards = () => {
  return (
    <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'var(--text-main)', fontSize: '24px', margin: 0 }}>My Rewards</h2>
        <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
          Total: 1,250 Pts
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '10px' }}>
        {/* Mock Scratch Cards */}
        <div style={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
          borderRadius: '16px', 
          padding: '30px 20px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Scratch Me! ✨</span>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', 
          borderRadius: '16px', 
          padding: '30px 20px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Scratch Me! ✨</span>
        </div>
      </div>
      
      <h3 style={{ marginTop: '20px', color: 'var(--text-main)' }}>Recent Cashbacks</h3>
      <div className="flex-col" style={{ gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-main)' }}>Mobile Recharge</span>
          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>+ ₹25.00</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-main)' }}>Electricity Bill</span>
          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>+ ₹50.00</span>
        </div>
      </div>
    </div>
  );
};
