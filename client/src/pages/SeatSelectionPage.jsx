import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  Ticket,
  Shield,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function SeatSelectionPage({ onOpenAuth }) {
  const { showId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user, isAuthenticated } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);
  const [viewersCount, setViewersCount] = useState(1);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch show details and initial seats
  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const res = await api.get(`/shows/${showId}`);
        if (res.success) {
          setShow(res.show);
          setSeats(res.seats || []);
        }
      } catch (err) {
        setErrorMsg('Failed to load show details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchShowDetails();
  }, [showId]);

  // Socket.io integration for real-time seat lock/unlock/booked events
  useEffect(() => {
    if (!socket || !showId) return;

    socket.emit('join:show', { showId, userId: user?._id || 'guest-' + socket.id });

    // Handle viewers count
    socket.on('viewers:count', ({ count }) => {
      setViewersCount(count);
    });

    // Handle seat locked by another user
    socket.on('seat:locked', ({ seatNumber, lockedBy, lockExpiresAt }) => {
      setSeats((prevSeats) =>
        prevSeats.map((s) =>
          s.seatNumber === seatNumber
            ? { ...s, status: 'locked', lockedBy, lockExpiresAt }
            : s
        )
      );

      // If someone else locked a seat currently in our selection, remove it
      if (lockedBy !== (user?._id || 'guest-' + socket.id)) {
        setSelectedSeatNumbers((prev) => prev.filter((sn) => sn !== seatNumber));
      }
    });

    // Handle seat unlocked
    socket.on('seat:unlocked', ({ seatNumber }) => {
      setSeats((prevSeats) =>
        prevSeats.map((s) =>
          s.seatNumber === seatNumber
            ? { ...s, status: 'available', lockedBy: null, lockExpiresAt: null }
            : s
        )
      );
    });

    // Handle seat booked
    socket.on('seats:booked', ({ bookedSeats }) => {
      setSeats((prevSeats) =>
        prevSeats.map((s) =>
          bookedSeats.includes(s.seatNumber)
            ? { ...s, status: 'booked', lockedBy: null }
            : s
        )
      );
      setSelectedSeatNumbers((prev) => prev.filter((sn) => !bookedSeats.includes(sn)));
    });

    // Handle seat released
    socket.on('seats:released', ({ releasedSeats }) => {
      setSeats((prevSeats) =>
        prevSeats.map((s) =>
          releasedSeats.includes(s.seatNumber)
            ? { ...s, status: 'available', lockedBy: null }
            : s
        )
      );
    });

    return () => {
      socket.emit('leave:show', { showId });
      socket.off('viewers:count');
      socket.off('seat:locked');
      socket.off('seat:unlocked');
      socket.off('seats:booked');
      socket.off('seats:released');
    };
  }, [socket, showId, user]);

  // 10-Minute Hold Countdown timer when seats are selected
  useEffect(() => {
    if (selectedSeatNumbers.length === 0) {
      setTimeLeft(600);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto release selected seats
          selectedSeatNumbers.forEach((seatNumber) => {
            if (socket) {
              socket.emit('seat:unlock', {
                showId,
                seatNumber,
                userId: user?._id || 'guest-' + socket.id,
              });
            }
          });
          setSelectedSeatNumbers([]);
          alert('Seat hold time expired. Please reselect your seats.');
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeatNumbers.length, socket, showId, user]);

  // Handle seat click
  const handleSeatClick = (seat) => {
    const isAlreadySelected = selectedSeatNumbers.includes(seat.seatNumber);
    const userId = user?._id || 'guest-' + (socket?.id || 'temp');

    if (seat.status === 'booked') return;
    if (seat.status === 'locked' && seat.lockedBy !== userId && !isAlreadySelected) return;

    if (isAlreadySelected) {
      // Deselect & unlock
      setSelectedSeatNumbers((prev) => prev.filter((sn) => sn !== seat.seatNumber));
      if (socket) {
        socket.emit('seat:unlock', { showId, seatNumber: seat.seatNumber, userId });
      }
    } else {
      // Max 8 seats limit
      if (selectedSeatNumbers.length >= 8) {
        alert('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeatNumbers((prev) => [...prev, seat.seatNumber]);
      if (socket) {
        socket.emit('seat:lock', { showId, seatNumber: seat.seatNumber, userId });
      }
    }
  };

  // Group seats by Row (A to H)
  const rowsMap = useMemo(() => {
    const map = {};
    seats.forEach((seat) => {
      if (!map[seat.row]) map[seat.row] = [];
      map[seat.row].push(seat);
    });
    // Sort columns inside row
    Object.keys(map).forEach((r) => {
      map[r].sort((a, b) => a.col - b.col);
    });
    return map;
  }, [seats]);

  // Selected seats details
  const selectedSeats = useMemo(() => {
    return seats.filter((s) => selectedSeatNumbers.includes(s.seatNumber));
  }, [seats, selectedSeatNumbers]);

  const subtotal = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);
  const convenienceFee = selectedSeats.length * 2.5;
  const grandTotal = subtotal + convenienceFee;

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProceed = () => {
    if (selectedSeatNumbers.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }

    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    // Navigate to checkout with show details and seat numbers
    navigate(`/checkout`, {
      state: {
        showId: show._id,
        seatNumbers: selectedSeatNumbers,
        seats: selectedSeats,
        movie: show.movie,
        theatre: show.theatre,
        showTime: show.showTime,
        screenName: show.screenName,
        subtotal,
        convenienceFee,
        totalAmount: grandTotal,
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading seat configuration...
      </div>
    );
  }

  if (errorMsg || !show) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>
        <h2>{errorMsg || 'Show not found'}</h2>
        <button onClick={() => navigate(-1)} className="btn-primary" style={{ marginTop: '1rem' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem', minHeight: '85vh' }}>
      
      {/* Top Header Information */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            {show.movie?.title}
          </h1>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            {show.theatre?.name} • <span style={{ color: '#38bdf8' }}>{show.screenName}</span> •{' '}
            {new Date(show.showTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })},{' '}
            {new Date(show.showTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </div>
        </div>

        {/* Live Viewers & Hold Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 20,
              padding: '0.35rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#38bdf8',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <Users size={14} />
            <span>{viewersCount} viewing now</span>
          </div>

          {selectedSeatNumbers.length > 0 && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 20,
                padding: '0.35rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#fbbf24',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <Clock size={14} />
              <span>Seat Hold: {formatTimer(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid & Order Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Cinema Hall & Seat Layout Area */}
        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          
          {/* Curved Cinema Screen Graphic */}
          <div className="cinema-screen-wrap">
            <div className="cinema-screen" />
            <div style={{ color: '#64748b', fontSize: '0.72rem', letterSpacing: '0.25em', marginTop: 10, fontWeight: 700 }}>
              ALL EYES THIS WAY • CINEMA SCREEN
            </div>
          </div>

          {/* Seat Grid Layout */}
          <div style={{ maxWidth: 620, margin: '2.5rem auto 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {Object.entries(rowsMap).map(([rowLetter, rowSeats]) => (
              <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                
                {/* Row Label Left */}
                <span style={{ width: 22, color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>
                  {rowLetter}
                </span>

                {/* Seats */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {rowSeats.map((seat, idx) => {
                    const isSelected = selectedSeatNumbers.includes(seat.seatNumber);
                    const isBooked = seat.status === 'booked';
                    const userId = user?._id || 'guest-' + (socket?.id || 'temp');
                    const isLockedByOther = seat.status === 'locked' && seat.lockedBy !== userId && !isSelected;

                    let seatClass = `seat-btn seat-available-${seat.category}`;
                    if (isSelected) seatClass = 'seat-btn seat-selected';
                    else if (isBooked) seatClass = 'seat-btn seat-booked';
                    else if (isLockedByOther) seatClass = 'seat-btn seat-locked';

                    return (
                      <React.Fragment key={seat._id}>
                        {/* Aisle gap after col 5 */}
                        {idx === 5 && <div style={{ width: 18 }} />}

                        <button
                          disabled={isBooked || isLockedByOther}
                          className={seatClass}
                          onClick={() => handleSeatClick(seat)}
                          title={`${seat.seatNumber} (${seat.category.toUpperCase()}) - $${seat.price}`}
                        >
                          {isLockedByOther ? <Lock size={12} /> : seat.col}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row Label Right */}
                <span style={{ width: 22, color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>
                  {rowLetter}
                </span>
              </div>
            ))}
          </div>

          {/* Seat Legend */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.25rem',
              marginTop: '2.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '1.5rem',
              fontSize: '0.78rem',
              color: '#94a3b8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="seat-btn seat-available-standard" style={{ width: 20, height: 20, fontSize: 9 }}>S</div>
              <span>Standard (${show.priceTier?.standard || 14})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="seat-btn seat-available-premium" style={{ width: 20, height: 20, fontSize: 9 }}>P</div>
              <span>Premium (${show.priceTier?.premium || 20})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="seat-btn seat-available-vip" style={{ width: 20, height: 20, fontSize: 9 }}>V</div>
              <span>VIP Recliner (${show.priceTier?.vip || 28})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="seat-btn seat-selected" style={{ width: 20, height: 20 }} />
              <span>Selected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="seat-btn seat-locked" style={{ width: 20, height: 20 }}>
                <Lock size={10} />
              </div>
              <span>Held by Others</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="seat-btn seat-booked" style={{ width: 20, height: 20 }} />
              <span>Sold</span>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
            Booking Summary
          </h2>

          {selectedSeats.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <Ticket size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>No seats selected yet. Click any available seat on the cinema grid.</p>
            </div>
          ) : (
            <div>
              {/* Selected Seats Badges */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
                  SELECTED SEATS ({selectedSeats.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedSeats.map((s) => (
                    <span
                      key={s.seatNumber}
                      style={{
                        background: 'rgba(229, 9, 20, 0.15)',
                        border: '1px solid rgba(229, 9, 20, 0.4)',
                        color: '#ff4d4d',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 6,
                      }}
                    >
                      {s.seatNumber} (${s.price})
                    </span>
                  ))}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Tickets Subtotal</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Convenience Fee ($2.50 / seat)</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>${convenienceFee.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingTop: '0.75rem',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  <span>Total Amount</span>
                  <span style={{ color: '#e50914' }}>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed CTA */}
              <button
                onClick={handleProceed}
                className="btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', borderRadius: 10 }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#64748b', fontSize: '0.75rem', marginTop: '0.85rem' }}>
                <Shield size={13} /> 100% Secure Checkout Guarantee
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
