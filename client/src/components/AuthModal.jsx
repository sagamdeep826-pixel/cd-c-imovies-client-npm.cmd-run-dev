import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Sparkles, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLoginMode) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, formData.phone);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    setIsLoginMode(true);
    if (type === 'admin') {
      setFormData({
        name: '',
        email: 'admin@imovies.com',
        password: 'Admin@123',
        phone: '',
      });
    } else {
      setFormData({
        name: '',
        email: 'user@imovies.com',
        password: 'User@123',
        phone: '',
      });
    }
    setError('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#12151e',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
            {isLoginMode ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {isLoginMode
              ? 'Sign in to access your bookings and reserve seats'
              : 'Join IMovies to enjoy quick booking & exclusive perks'}
          </p>
        </div>

        {/* Demo Quick-Fill Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => handleFillDemo('admin')}
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 8,
              padding: '0.5rem',
              color: '#fbbf24',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Shield size={13} /> Demo Admin
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('user')}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 8,
              padding: '0.5rem',
              color: '#38bdf8',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <UserCheck size={13} /> Demo User
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#0c0e14',
            borderRadius: 8,
            padding: 3,
            marginBottom: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 6,
              border: 'none',
              background: isLoginMode ? '#1e2433' : 'transparent',
              color: isLoginMode ? '#fff' : '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(false);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 6,
              border: 'none',
              background: !isLoginMode ? '#1e2433' : 'transparent',
              color: !isLoginMode ? '#fff' : '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.6rem 0.8rem',
              borderRadius: 8,
              fontSize: '0.82rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {!isLoginMode && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 500 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          {!isLoginMode && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 500 }}>
                Phone Number (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {loading ? (
              'Processing...'
            ) : isLoginMode ? (
              'Sign In to IMovies'
            ) : (
              'Create My Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
