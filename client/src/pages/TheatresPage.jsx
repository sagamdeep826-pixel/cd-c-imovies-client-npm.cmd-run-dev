import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Film, Sparkles, Award, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useCity } from '../context/CityContext';

export default function TheatresPage() {
  const { selectedCity, setSelectedCity, cities } = useCity();
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheatres = async () => {
      setLoading(true);
      try {
        const res = await api.get('/theatres', {
          params: { city: selectedCity },
        });
        if (res.success) {
          setTheatres(res.theatres || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTheatres();
  }, [selectedCity]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '80vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
            Cinema Theatres in {selectedCity}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Experience world-class projection, Dolby Atmos audio, and VIP recliner luxury.
          </p>
        </div>

        {/* City Filter Pills */}
        <div style={{ display: 'flex', gap: 8, background: '#121622', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: 8,
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: selectedCity === city ? '#e50914' : 'transparent',
                color: selectedCity === city ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Theatres Grid */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          Loading theatres...
        </div>
      ) : theatres.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Film size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Theatres in {selectedCity}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Try selecting New York, Los Angeles, or Chicago above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
          {theatres.map((theatre) => (
            <div
              key={theatre._id}
              className="glass-panel"
              style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  <Award size={14} /> Official IMovies Partner
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                  {theatre.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <MapPin size={15} color="#e50914" />
                  <span>{theatre.address}, {theatre.city}</span>
                </div>

                {theatre.contactNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                    <Phone size={13} />
                    <span>{theatre.contactNumber}</span>
                  </div>
                )}

                {/* Screens */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                    Screens & Formats
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {theatre.screens?.map((scr, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#1a1f2f',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#38bdf8',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.6rem',
                          borderRadius: 6,
                        }}
                      >
                        {scr.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                    Cinema Amenities
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {theatre.amenities?.map((amenity) => (
                      <span
                        key={amenity}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          color: '#cbd5e1',
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 4,
                        }}
                      >
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/movies"
                className="btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.88rem', borderRadius: 10 }}
              >
                Browse Movies at this Cinema <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
