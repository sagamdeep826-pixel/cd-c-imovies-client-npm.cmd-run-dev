import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Building,
  Wallet,
  Tag,
  ShieldCheck,
  Check,
  Clock,
  MapPin,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardName: user?.name || 'Alex Miller',
    expiry: '12/28',
    cvv: '888',
  });

  const [upiId, setUpiId] = useState('alex@okhdfcbank');

  if (!state || !state.showId || !state.seatNumbers) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>
        <h2>No Active Checkout Session</h2>
        <p style={{ color: '#94a3b8', margin: '1rem 0' }}>Please select a movie and seats first.</p>
        <Link to="/movies" className="btn-primary">
          Explore Movies
        </Link>
      </div>
    );
  }

  const {
    showId,
    seatNumbers,
    seats,
    movie,
    theatre,
    showTime,
    screenName,
    subtotal,
    convenienceFee,
  } = state;

  const finalAmount = Math.max(0, subtotal + convenienceFee - discount);

  // Handle promo code apply
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'IMOVIES20') {
      const disc = Math.round(subtotal * 0.2);
      setDiscount(disc);
      setAppliedCoupon('IMOVIES20 (20% Off Applied)');
    } else if (code === 'FIRST50') {
      const disc = Math.round(subtotal * 0.5);
      setDiscount(disc);
      setAppliedCoupon('FIRST50 (50% Off Applied)');
    } else if (code === 'FLAT100' || code === 'FLAT10') {
      const disc = Math.min(100, subtotal);
      setDiscount(disc);
      setAppliedCoupon('FLAT100 (₹100 Flat Discount Applied)');
    } else {
      setCouponError('Invalid coupon code. Try FIRST50, IMOVIES20 or FLAT100.');
    }
  };

  // Submit Booking & Payment
  const handleCompletePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await api.post('/bookings', {
        showId,
        seatNumbers,
        paymentMethod,
        couponCode: appliedCoupon ? couponCode.toUpperCase().trim() : '',
        paymentDetails: {
          cardLastFour: '4242',
          cardBrand: 'Visa',
          upiId: paymentMethod === 'upi' ? upiId : '',
        },
      });

      if (res.success && res.booking) {
        navigate(`/booking-confirmed/${res.booking._id}`, {
          state: { booking: res.booking },
        });
      }
    } catch (err) {
      console.warn('Backend unavailable, simulating offline demo ticket confirmation');
      const demoBooking = {
        _id: 'demo-bkg-' + Date.now(),
        bookingNumber: `IMO-${Date.now().toString().slice(-6)}-DEMO`,
        movie,
        theatre,
        show: { screenName, showTime },
        seats: seats || seatNumbers.map((sn) => ({ seatNumber: sn })),
        totalAmount: finalAmount,
        status: 'confirmed',
        qrCode: `IMO-DEMO:TICKET:${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      navigate(`/booking-confirmed/${demoBooking._id}`, {
        state: { booking: demoBooking },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '80vh' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
          Simulated Cinema Ticket Checkout
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Finalize your cinema ticket reservation with instant digital voucher generation.
        </p>
      </div>

      {/* Prominent Simulated Checkout Banner */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 12,
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: '2rem',
          color: '#38bdf8',
          fontSize: '0.85rem',
        }}
      >
        <ShieldCheck size={20} />
        <span>
          <strong>SIMULATED CHECKOUT NOTICE:</strong> This is an academic demonstration project. No real currency is charged. Any card numbers or UPI IDs are purely simulated.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(320px, 380px)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Payment Methods Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
            Choose Payment Method
          </h2>

          {/* Payment Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <button
              onClick={() => setPaymentMethod('card')}
              style={{
                background: paymentMethod === 'card' ? 'rgba(229, 9, 20, 0.15)' : '#121622',
                border: paymentMethod === 'card' ? '1px solid #e50914' : '1px solid rgba(255, 255, 255, 0.08)',
                color: paymentMethod === 'card' ? '#ff4d4d' : '#94a3b8',
                borderRadius: 10,
                padding: '0.85rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            >
              <CreditCard size={20} />
              <span>Credit Card</span>
            </button>

            <button
              onClick={() => setPaymentMethod('upi')}
              style={{
                background: paymentMethod === 'upi' ? 'rgba(229, 9, 20, 0.15)' : '#121622',
                border: paymentMethod === 'upi' ? '1px solid #e50914' : '1px solid rgba(255, 255, 255, 0.08)',
                color: paymentMethod === 'upi' ? '#ff4d4d' : '#94a3b8',
                borderRadius: 10,
                padding: '0.85rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            >
              <QrCode size={20} />
              <span>UPI / QR</span>
            </button>

            <button
              onClick={() => setPaymentMethod('netbanking')}
              style={{
                background: paymentMethod === 'netbanking' ? 'rgba(229, 9, 20, 0.15)' : '#121622',
                border: paymentMethod === 'netbanking' ? '1px solid #e50914' : '1px solid rgba(255, 255, 255, 0.08)',
                color: paymentMethod === 'netbanking' ? '#ff4d4d' : '#94a3b8',
                borderRadius: 10,
                padding: '0.85rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            >
              <Building size={20} />
              <span>Net Banking</span>
            </button>

            <button
              onClick={() => setPaymentMethod('wallet')}
              style={{
                background: paymentMethod === 'wallet' ? 'rgba(229, 9, 20, 0.15)' : '#121622',
                border: paymentMethod === 'wallet' ? '1px solid #e50914' : '1px solid rgba(255, 255, 255, 0.08)',
                color: paymentMethod === 'wallet' ? '#ff4d4d' : '#94a3b8',
                borderRadius: 10,
                padding: '0.85rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            >
              <Wallet size={20} />
              <span>IMovies Pay</span>
            </button>
          </div>

          {/* Form Fields corresponding to chosen method */}
          {paymentMethod === 'card' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={cardDetails.cardName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  Card Number
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  width: 160,
                  height: 160,
                  margin: '0 auto 1.25rem',
                  background: '#fff',
                  padding: 12,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={135} color="#000" />
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Scan this QR code using Google Pay, PhonePe, or Paytm
              </p>
              <div style={{ maxWidth: 300, margin: '0 auto' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Or enter UPI ID (e.g. user@okaxis)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'netbanking' && (
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Select Your Bank
              </label>
              <select className="form-input" defaultValue="chase">
                <option value="chase">Chase Bank</option>
                <option value="bofa">Bank of America</option>
                <option value="wells">Wells Fargo</option>
                <option value="citi">Citibank</option>
                <option value="capital">Capital One</option>
              </select>
            </div>
          )}

          {paymentMethod === 'wallet' && (
            <div style={{ background: '#141824', borderRadius: 12, padding: '1.5rem', textAlign: 'center' }}>
              <Wallet size={36} color="#e50914" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                IMovies Cinema Wallet
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Available Balance: <strong style={{ color: '#10b981' }}>₹1,500.00</strong>
              </p>
              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.3rem 0.8rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>
                Instant 1-Click Pay
              </span>
            </div>
          )}

          {/* Secure Assurance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: '0.8rem', marginTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            <ShieldCheck size={16} />
            <span>End-to-end encrypted simulated transaction with instant booking confirmation.</span>
          </div>
        </div>

        {/* Order Details & Promo Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Order Summary Card */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
              Order Overview
            </h2>

            {/* Movie Info */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <img
                src={movie.posterUrl}
                alt={movie.title}
                style={{ width: 64, height: 90, borderRadius: 8, objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{movie.title}</h3>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, marginBottom: 4 }}>{screenName}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{theatre.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                  {new Date(showTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })},{' '}
                  {new Date(showTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Seats Badges */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
                RESERVED SEATS ({seatNumbers.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {seatNumbers.map((sn) => (
                  <span
                    key={sn}
                    style={{
                      background: '#1e2433',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 4,
                    }}
                  >
                    {sn}
                  </span>
                ))}
              </div>
            </div>

            {/* Coupon Code Apply */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
                PROMO CODE (Try FIRST50, IMOVIES20 or FLAT100)
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ textTransform: 'uppercase', height: 38, fontSize: '0.82rem' }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-secondary"
                  style={{ padding: '0 1rem', height: 38, fontSize: '0.82rem' }}
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div style={{ color: '#10b981', fontSize: '0.78rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={13} /> {appliedCoupon}
                </div>
              )}
              {couponError && (
                <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 6 }}>
                  {couponError}
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Subtotal ({seatNumbers.length} Tickets)</span>
                <span style={{ color: '#fff' }}>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Convenience Fee (₹25 / seat)</span>
                <span style={{ color: '#fff' }}>₹{convenienceFee.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '0.75rem',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                <span>Grand Total</span>
                <span style={{ color: '#e50914' }}>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={handleCompletePayment}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: 10, marginTop: '1.5rem' }}
            >
              {isProcessing ? 'Confirming Reservation...' : `Pay ₹${finalAmount.toFixed(2)} Now`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
