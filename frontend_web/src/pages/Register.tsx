import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      
      login(data, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
      <h2 style={{ color: 'var(--text-main)', fontSize: '24px', textAlign: 'center' }}>Create Account</h2>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Join Paystream today</p>
      
      {error && <div style={{ color: 'var(--error)', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="flex-col" style={{ gap: '5px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Name</label>
          <input 
            type="text" 
            placeholder="John Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ 
              padding: '12px 16px', fontSize: '16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'var(--card-bg)'
            }} 
          />
        </div>

        <div className="flex-col" style={{ gap: '5px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Email</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              padding: '12px 16px', fontSize: '16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'var(--card-bg)'
            }} 
          />
        </div>
        
        <div className="flex-col" style={{ gap: '5px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Password</label>
          <input 
            type="password" 
            placeholder="Create a strong password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              padding: '12px 16px', fontSize: '16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none', background: 'var(--card-bg)'
            }} 
          />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
      </p>
    </div>
  );
};
