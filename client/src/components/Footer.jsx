import React from 'react';
import { Film, Heart, Shield, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#0a0c11', borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '4rem', padding: '3.5rem 1.5rem 2rem' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e50914', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Film size={20} color="#fff" />
              </div>
              <span className="brand-font" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                I<span style={{ color: '#e50914' }}>MOVIES</span>
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.2rem' }}>
              Next-generation online cinema booking platform with real-time seat tracking, contactless digital tickets, and IMAX & Dolby Atmos sound experiences.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ background: '#161a25', color: '#f59e0b', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Award size={13} /> IMAX Certified
              </span>
              <span style={{ background: '#161a25', color: '#38bdf8', fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={13} /> Dolby Atmos
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <li><Link to="/movies?status=now_showing" style={{ color: '#94a3b8' }}>Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" style={{ color: '#94a3b8' }}>Coming Soon</Link></li>
              <li><Link to="/theatres" style={{ color: '#94a3b8' }}>Cinema Locations</Link></li>
              <li><Link to="/movies?genre=Sci-Fi" style={{ color: '#94a3b8' }}>Sci-Fi & Action</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer Support
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <li>24/7 Helpline: +91 (755) 400-FILM</li>
              <li>Support: support@imovies.com</li>
              <li>Cancellation & Refund Terms</li>
              <li>Safety & Security Protocol</li>
            </ul>
          </div>

          {/* Offers & Security */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Exclusive Offers
            </h4>
            <div style={{ background: '#161a25', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1rem' }}>
              <div style={{ color: '#e50914', fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>Promo Code: FIRST50</div>
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0 }}>Get 50% discount on your first movie ticket reservation.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.75rem', marginTop: '0.75rem' }}>
              <Shield size={14} /> 256-Bit SSL Encrypted Transactions
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
          <div>© {new Date().getFullYear()} IMovies Cinema Network. All rights reserved. Built with MERN Stack.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Designed with <Heart size={14} color="#e50914" fill="#e50914" /> for Cinephiles
          </div>
        </div>
      </div>
    </footer>
  );
}
