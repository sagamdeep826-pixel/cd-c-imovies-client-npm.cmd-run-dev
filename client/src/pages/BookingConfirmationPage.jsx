import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Download,
  Share2,
  Ticket,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);

  // Trigger celebration confetti on mount
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  // Fetch booking if not passed in state
  useEffect(() => {
    if (!booking && id) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/bookings/${id}`);
          if (res.success && res.booking) {
            setBooking(res.booking);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8' }}>
        Retrieving ticket details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>
        <h2>Ticket Not Found</h2>
        <Link to="/dashboard" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          View My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', padding: '3rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Success Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
          }}
        >
          <CheckCircle2 size={36} color="#10b981" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Your digital movie tickets have been reserved and sent to your account.
        </p>
      </div>

      {/* Digital Ticket Voucher Component */}
      <div
        className="ticket-stub"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
          marginBottom: '2rem',
        }}
      >
        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr minmax(200px, 240px)', gap: '2rem', alignItems: 'center' }}>
          
          {/* Ticket Left Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.85rem' }}>
              <span
                style={{
                  background: '#e50914',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                }}
              >
                Confirmed E-Ticket
              </span>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                Ref: <strong style={{ color: '#cbd5e1' }}>{booking.bookingNumber}</strong>
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              {booking.movie?.title}
            </h2>

            <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem' }}>
              {booking.show?.screenName || 'Screen 1 (IMAX 3D)'}
            </div>

            {/* Theatre & Showtime Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>THEATRE</span>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>{booking.theatre?.name}</span>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>{booking.theatre?.city}</span>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>SHOWTIME</span>
                <span style={{ color: '#f8fafc', fontWeight: 600 }}>
                  {booking.show?.showTime ? new Date(booking.show.showTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '07:30 PM'}
                </span>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>
                  {booking.show?.showTime ? new Date(booking.show.showTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Today'}
                </span>
              </div>
            </div>

            {/* Seats Badges */}
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>SEATS</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {booking.seats?.map((seat, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'rgba(229, 9, 20, 0.15)',
                      border: '1px solid rgba(229, 9, 20, 0.4)',
                      color: '#ff4d4d',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.6rem',
                      borderRadius: 6,
                    }}
                  >
                    {seat.seatNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Right: QR Code & Total */}
          <div
            style={{
              borderLeft: '1px dashed rgba(255, 255, 255, 0.15)',
              paddingLeft: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            {/* Generated QR Code for Entry */}
            <div
              style={{
                background: '#fff',
                padding: 10,
                borderRadius: 12,
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                marginBottom: '1rem',
              }}
            >
              <QRCodeSVG
                value={booking.qrCode || `IMO-BOOKING:${booking.bookingNumber}`}
                size={130}
                level="M"
              />
            </div>

            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
              Scan at cinema turnstile for entry
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Paid</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981' }}>
              ₹{booking.totalAmount?.toFixed(2)}
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={handlePrint}
          className="btn-secondary"
          style={{ padding: '0.75rem 1.5rem', borderRadius: 10 }}
        >
          <Download size={16} /> Print / Save PDF
        </button>

        <Link
          to="/dashboard"
          className="btn-primary"
          style={{ padding: '0.75rem 1.5rem', borderRadius: 10 }}
        >
          <Ticket size={16} /> View My Bookings
        </Link>

        <Link
          to="/movies"
          className="btn-secondary"
          style={{ padding: '0.75rem 1.5rem', borderRadius: 10 }}
        >
          Explore More Movies <ChevronRight size={16} />
        </Link>
      </div>

    </div>
  );
}
