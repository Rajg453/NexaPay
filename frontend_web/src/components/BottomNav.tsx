import React from 'react';

export const BottomNav = () => {
  const NavItem = ({ icon, label, isActive = false }: { icon: string, label: string, isActive?: boolean }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
      cursor: 'pointer'
    }}>
      <span style={{ fontSize: '24px' }}>{icon}</span>
      <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '400' }}>{label}</span>
    </div>
  );

  return (
    // We added the "mobile-only" class so this completely hides on desktop screens!
    <div className="mobile-only" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      justifyContent: 'space-around',
      padding: '12px 0',
      borderTop: '1px solid var(--border)',
      zIndex: 100
    }}>
      <NavItem icon="🏠" label="Home" isActive={true} />
      <NavItem icon="🛒" label="Stores" />
      <NavItem icon="🛡️" label="Insurance" />
      <NavItem icon="📈" label="Wealth" />
      <NavItem icon="📜" label="History" />
    </div>
  );
};
