import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// The Header component displays the logo, desktop navigation, and profile icons
export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = React.useState(true);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex-row" style={{ 
      padding: '16px 24px', 
      backgroundColor: 'var(--card-glass)', 
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '22px', fontWeight: 'bold' }}>
          NexaPay
        </h1>
        
        <nav className="desktop-only" style={{ display: 'flex', gap: '20px' }}>
          <a href="#" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Dashboard</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Payments</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Analytics</a>
          <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Settings</a>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div onClick={toggleTheme} style={{ cursor: 'pointer', fontSize: '20px', marginRight: '8px' }}>
          {isDark ? '☀️' : '🌙'}
        </div>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          🔔
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--error)',
            borderRadius: '50%'
          }}></span>
        </div>
        
        {user ? (
          <div className="flex-row" style={{ gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <button 
              onClick={handleLogout} 
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
            >
              Logout
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
