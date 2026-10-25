import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film,
  MapPin,
  Search,
  Bell,
  User,
  LogOut,
  Ticket,
  ShieldCheck,
  ChevronDown,
  X,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import api from '../services/api';

export default function Navbar({ onOpenAuth }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { selectedCity, setSelectedCity, cities } = useCity();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const cityRef = useRef(null);
  const userRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setShowCityDropdown(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated) {
      const loadNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          if (res.success) {
            setNotifications(res.notifications || []);
            setUnreadCount(res.unreadCount || 0);
          }
        } catch (e) {
          // ignore error
        }
      };
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="glass-nav sticky-top" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
        
        {/* Brand Logo & City Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #e50914 0%, #99060e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(229, 9, 20, 0.5)' }}>
              <Film size={22} color="#ffffff" />
            </div>
            <div>
              <span className="brand-font" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff' }}>
                I<span style={{ color: '#e50914' }}>MOVIES</span>
              </span>
            </div>
          </Link>

          {/* City Selector */}
          <div ref={cityRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              style={{
                background: '#161a25',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: '0.4rem 0.75rem',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
              }}
            >
              <MapPin size={15} color="#e50914" />
              <span>{selectedCity}</span>
              <ChevronDown size={14} color="#94a3b8" />
            </button>

            {showCityDropdown && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '120%',
                  left: 0,
                  width: 170,
                  padding: '0.5rem',
                  zIndex: 1100,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#64748b', padding: '0.25rem 0.5rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  Select City
                </div>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(city);
                      setShowCityDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 6,
                      background: selectedCity === city ? '#22293a' : 'transparent',
                      color: selectedCity === city ? '#e50914' : '#cbd5e1',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: selectedCity === city ? 600 : 400,
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: 450, position: 'relative' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search movies, genres, actors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.4rem', paddingRight: '2rem', height: 40, fontSize: '0.85rem', borderRadius: 20 }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8' }}
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* Links & Profile Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/movies" style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>
            Movies
          </Link>
          <Link to="/theatres" style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>
            Theatres
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(229, 9, 20, 0.15)',
                color: '#ff4d4d',
                border: '1px solid rgba(229, 9, 20, 0.3)',
                padding: '0.35rem 0.75rem',
                borderRadius: 20,
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={14} />
              <span>Admin Portal</span>
            </Link>
          )}

          {/* Notifications Bell */}
          {isAuthenticated && (
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: '#161a25',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '50%',
                  width: 38,
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#cbd5e1',
                  position: 'relative',
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      background: '#e50914',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 8px rgba(229, 9, 20, 0.8)',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: 320,
                    maxHeight: 380,
                    overflowY: 'auto',
                    padding: '0.75rem',
                    zIndex: 1100,
                    boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: '#e50914', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        <CheckCheck size={13} /> Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        style={{
                          padding: '0.6rem',
                          borderRadius: 8,
                          marginBottom: '0.4rem',
                          background: n.isRead ? 'transparent' : 'rgba(229, 9, 20, 0.08)',
                          borderLeft: n.isRead ? '2px solid transparent' : '2px solid #e50914',
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>{n.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{n.message}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4 }}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Account / Login Button */}
          {isAuthenticated ? (
            <div ref={userRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  background: '#161a25',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 24,
                  padding: '0.3rem 0.75rem 0.3rem 0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#fff',
                }}
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt="avatar"
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={14} color="#94a3b8" />
              </button>

              {showUserDropdown && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: 200,
                    padding: '0.5rem',
                    zIndex: 1100,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email}</div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowUserDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 6,
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  >
                    <Ticket size={16} color="#e50914" />
                    <span>My Bookings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 6,
                        color: '#cbd5e1',
                        fontSize: '0.85rem',
                      }}
                    >
                      <ShieldCheck size={16} color="#f59e0b" />
                      <span>Admin Management</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      navigate('/');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 6,
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      marginTop: '0.25rem',
                      borderTop: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary"
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', borderRadius: 20 }}
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
