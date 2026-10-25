import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Lock,
  ChevronRight,
  Download,
  X,
  CreditCard,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';

export default function UserDashboardPage() {
  const { user, updateUser } = useAuth();
  const { cities } = useCity();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [isCancelling, setIsCancelling] = useState(false);

  // Ticket Voucher Modal state
  const [viewingBooking, setViewingBooking] = useState(null);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredCity: user?.preferredCity || 'New York',
  });
  const [profileMsg, setProfileMsg] = useState('');

  // Password state
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [passMsg, setPassMsg] = useState('');

  // Fetch bookings
  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my', {
        params: { filter: activeTab === 'profile' ? 'all' : activeTab },
      });
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'profile') {
      loadBookings();
    }
  }, [activeTab]);

  // Handle Booking Cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      const res = await api.put(`/bookings/${cancellingBooking._id}/cancel`, {
        reason: cancelReason,
      });
      if (res.success) {
        alert(`Booking #${cancellingBooking.bookingNumber} successfully cancelled. Refund of $${res.refundAmount} has been processed.`);
        setCancellingBooking(null);
        loadBookings();
      }
    } catch (err) {
      alert(err.message || 'Cancellation failed. Please check show timing policy.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.success) {
        updateUser(res.user);
        setProfileMsg('Profile updated successfully!');
        setTimeout(() => setProfileMsg(''), 4000);
      }
    } catch (e) {
      setProfileMsg('Error: ' + e.message);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/password', passData);
      if (res.success) {
        setPassMsg('Password changed successfully!');
        setPassData({ currentPassword: '', newPassword: '' });
        setTimeout(() => setPassMsg(''), 4000);
      }
    } catch (e) {
      setPassMsg('Error: ' + e.message);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Top Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="avatar"
            style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e50914' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{user?.name}</h1>
              <span style={{ background: user?.role === 'admin' ? '#f59e0b' : '#38bdf8', color: '#000', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: 4, textTransform: 'uppercase' }}>
                {user?.role || 'User'}
              </span>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user?.email}</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', background: '#0e121a', padding: 4, borderRadius: 12 }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'upcoming' ? '#e50914' : 'transparent',
              color: activeTab === 'upcoming' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Upcoming Shows
          </button>
          <button
            onClick={() => setActiveTab('past')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'past' ? '#e50914' : 'transparent',
              color: activeTab === 'past' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Past & Cancelled
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'profile' ? '#e50914' : 'transparent',
              color: activeTab === 'profile' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Profile Settings
          </button>
        </div>
      </div>

      {/* Tab: Upcoming & Past Bookings */}
      {activeTab !== 'profile' && (
        <div>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <Ticket size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                No {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Bookings Found
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Explore what's playing in theatres right now and reserve your seats!
              </p>
              <a href="/movies" className="btn-primary" style={{ display: 'inline-block' }}>
                Explore Now Showing
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bookings.map((b) => {
                const isCancelled = b.status === 'cancelled';
                const showTime = b.show?.showTime ? new Date(b.show.showTime) : new Date(b.createdAt);
                const isUpcoming = showTime > new Date() && !isCancelled;

                return (
                  <div
                    key={b._id}
                    className="glass-panel"
                    style={{
                      padding: '1.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '1.5rem',
                      alignItems: 'center',
                      opacity: isCancelled ? 0.75 : 1,
                    }}
                  >
                    {/* Poster */}
                    <img
                      src={b.movie?.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200'}
                      alt={b.movie?.title}
                      style={{ width: 80, height: 110, borderRadius: 10, objectFit: 'cover' }}
                    />

                    {/* Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span
                          style={{
                            background: isCancelled ? '#ef4444' : '#10b981',
                            color: '#fff',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 4,
                            textTransform: 'uppercase',
                          }}
                        >
                          {b.status}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          Code: <strong style={{ color: '#cbd5e1' }}>{b.bookingNumber}</strong>
                        </span>
                      </div>

                      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                        {b.movie?.title}
                      </h2>

                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 6 }}>
                        {b.theatre?.name} • <span style={{ color: '#38bdf8' }}>{b.show?.screenName || 'Screen 1'}</span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: '#cbd5e1', fontSize: '0.8rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={14} color="#e50914" />
                          {showTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={14} color="#e50914" />
                          {showTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                          Seats: {b.seats?.map((s) => s.seatNumber).join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Actions & Price */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                        ${b.totalAmount?.toFixed(2)}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setViewingBooking(b)}
                          className="btn-secondary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          View E-Ticket
                        </button>

                        {isUpcoming && (
                          <button
                            onClick={() => setCancellingBooking(b)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              padding: '0.45rem 0.85rem',
                              borderRadius: 8,
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile Settings */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Edit Profile */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
              Personal Details
            </h2>

            {profileMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.6rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '1rem' }}>
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Preferred Cinema City
                </label>
                <select
                  className="form-input"
                  value={profileData.preferredCity}
                  onChange={(e) => setProfileData({ ...profileData, preferredCity: e.target.value })}
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
              Security & Password
            </h2>

            {passMsg && (
              <div style={{ background: passMsg.startsWith('Error') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: passMsg.startsWith('Error') ? '#ef4444' : '#10b981', padding: '0.6rem', borderRadius: 8, fontSize: '0.82rem', marginBottom: '1rem' }}>
                {passMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Current Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  New Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="btn-secondary" style={{ marginTop: '0.5rem' }}>
                Update Password
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div className="glass-panel" style={{ width: '100%', maxWidth: 460, background: '#121622', padding: '2rem', position: 'relative' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              Cancel Ticket Reservation?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Booking: <strong style={{ color: '#fff' }}>#{cancellingBooking.bookingNumber}</strong> for {cancellingBooking.movie?.title}.
              Per our cinema policy, a refund will be processed back to your payment account.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Reason for cancellation
              </label>
              <select
                className="form-input"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Booked wrong showtime or seats">Booked wrong showtime or seats</option>
                <option value="Emergency or conflict">Emergency or conflict</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="btn-secondary"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isCancelling ? 'Processing Refund...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Digital Ticket Modal */}
      {viewingBooking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setViewingBooking(null)}
        >
          <div
            className="ticket-stub"
            style={{ width: '100%', maxWidth: 500, padding: '2rem', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingBooking(null)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ background: '#e50914', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 4, textTransform: 'uppercase' }}>
                IMOVIES DIGITAL ENTRY PASS
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem', marginBottom: 2 }}>
                {viewingBooking.movie?.title}
              </h2>
              <div style={{ color: '#38bdf8', fontSize: '0.85rem' }}>{viewingBooking.theatre?.name}</div>
            </div>

            <div style={{ background: '#fff', padding: 12, borderRadius: 12, width: 150, margin: '0 auto 1.25rem' }}>
              <QRCodeSVG value={viewingBooking.qrCode || `IMO:${viewingBooking.bookingNumber}`} size={126} level="M" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>BOOKING ID</span>
                <strong style={{ color: '#fff' }}>{viewingBooking.bookingNumber}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>TOTAL AMOUNT</span>
                <strong style={{ color: '#10b981' }}>${viewingBooking.totalAmount?.toFixed(2)}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>SEATS</span>
                <strong style={{ color: '#fbbf24' }}>{viewingBooking.seats?.map((s) => s.seatNumber).join(', ')}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>STATUS</span>
                <strong style={{ color: viewingBooking.status === 'confirmed' ? '#10b981' : '#ef4444', textTransform: 'capitalize' }}>
                  {viewingBooking.status}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
