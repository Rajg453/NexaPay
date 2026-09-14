import React from 'react';

export const Footer = () => {
  return (
    <footer style={{
      marginTop: '40px',
      padding: '32px 24px',
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '14px',
      borderTop: '1px solid var(--border)',
      backgroundColor: 'transparent'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '12px' }}>
        <span style={{ cursor: 'pointer', hover: { color: 'var(--primary)' } }}>Help Center</span>
        <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
        <span style={{ cursor: 'pointer' }}>Terms of Service</span>
      </div>
      <p style={{ margin: 0 }}>© 2026 NexaPay Technologies. Built with best practices.</p>
    </footer>
  );
};
