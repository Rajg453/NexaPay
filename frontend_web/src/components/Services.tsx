import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Services = () => {
  const navigate = useNavigate();

  const ServiceIcon = ({ icon, label, path }: { icon: string, label: string, path: string }) => (
    <div 
      onClick={() => navigate(path)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
      }}
    >
      <div style={{
        fontSize: '28px',
        backgroundColor: 'var(--bg-dark)',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border)'
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-main)' }}>Recharge & Pay Bills</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', 
        gap: '20px 12px' 
      }}>
        <ServiceIcon icon="📱" label="Mobile" path="/recharge/mobile" />
        <ServiceIcon icon="📺" label="DTH" path="/recharge/dth" />
        <ServiceIcon icon="💡" label="Electricity" path="/recharge/electricity" />
        <ServiceIcon icon="💳" label="Credit Card" path="/recharge/credit-card" />
        <ServiceIcon icon="🏠" label="Rent" path="/recharge/rent" />
        <ServiceIcon icon="💧" label="Water" path="/recharge/water" />
        <ServiceIcon icon="⛽" label="Gas" path="/recharge/gas" />
        <ServiceIcon icon="🎓" label="Education" path="/recharge/education" />
      </div>
    </div>
  );
};
