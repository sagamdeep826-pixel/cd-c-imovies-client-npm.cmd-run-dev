import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Play,
  MapPin,
  Film,
  Sparkles,
  ChevronRight,
  User,
} from 'lucide-react';
import api from '../services/api';
import { useCity } from '../context/CityContext';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCity } = useCity();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  // Generate date tabs: next 5 days
  const dateTabs = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNumber, monthName };
  });

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await api.get(`/movies/${id}`);
        if (res.success) {
          setMovie(res.movie);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Fetch shows for this movie, city, and date
  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await api.get('/shows', {
          params: {
            movieId: id,
            city: selectedCity,
            date: selectedDate,
          },
        });
        if (res.success) {
          setShows(res.shows || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchShows();
  }, [id, selectedCity, selectedDate]);

  if (loading) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8' }}>
        Loading movie details...
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>
        <h2>Movie Not Found</h2>
        <Link to="/movies" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Back to Movies
        </Link>
      </div>
    );
  }

  // Group shows by Theatre
  const theatreMap = {};
  shows.forEach((show) => {
    if (!show.theatre) return;
    const tId = show.theatre._id;
    if (!theatreMap[tId]) {
      theatreMap[tId] = {
        theatre: show.theatre,
        shows: [],
      };
    }
    theatreMap[tId].shows.push(show);
  });
  const groupedTheatres = Object.values(theatreMap);

  return (
    <div>
      {/* Backdrop & Header Banner */}
      <div
        style={{
          position: 'relative',
          minHeight: '55vh',
          backgroundImage: `linear-gradient(to right, rgba(10, 12, 16, 0.96) 25%, rgba(10, 12, 16, 0.8) 60%, rgba(10, 12, 16, 0.4) 100%), linear-gradient(to top, rgba(10, 12, 16, 1) 0%, transparent 80%), url(${movie.backdropUrl || movie.posterUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          padding: '3rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'center' }}>
          
          {/* Poster */}
          <div
            style={{
              width: 240,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              flexShrink: 0,
            }}
          >
            <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', display: 'block' }} />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: 300 }}>
            {/* Age Rating & Languages */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <span style={{ background: '#1e2433', border: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: 4, fontWeight: 700, fontSize: '0.78rem' }}>
                {movie.ageRating || 'PG-13'}
              </span>
              <span style={{ background: '#1e2433', color: '#cbd5e1', padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.78rem' }}>
                {movie.language}
              </span>
              <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.88rem', marginLeft: '0.5rem' }}>
                <Star size={16} fill="#fbbf24" color="#fbbf24" /> {movie.rating?.toFixed(1) || '8.5'} / 10
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', lineHeight: 1.15 }}>
              {movie.title}
            </h1>

            {movie.tagline && (
              <p style={{ color: '#fbbf24', fontStyle: 'italic', fontSize: '1.05rem', marginBottom: '0.85rem' }}>
                "{movie.tagline}"
              </p>
            )}

            {/* Meta tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={15} /> {movie.duration} mins
              </span>
              <span>•</span>
              <span>{movie.genres?.join(', ')}</span>
              <span>•</span>
              <span>Released {new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Overview */}
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 750, marginBottom: '1.5rem' }}>
              {movie.description}
            </p>

            {/* Director & Cast summary */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              {movie.director && (
                <div>
                  <span style={{ color: '#64748b' }}>Director: </span>
                  <strong style={{ color: '#fff' }}>{movie.director}</strong>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {movie.trailerUrl && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn-secondary"
                  style={{ borderRadius: 10, padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
                >
                  <Play size={16} fill="#fff" /> Watch Official Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Booking Section */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
            Book Tickets in {selectedCity}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Select your preferred date, theatre, and showtime to pick seats.
          </p>
        </div>

        {/* Date Selector Ribbon */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: '0.75rem',
            marginBottom: '2rem',
          }}
        >
          {dateTabs.map(({ dateStr, dayName, dayNumber, monthName }) => {
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  minWidth: 90,
                  padding: '0.75rem 0.5rem',
                  borderRadius: 12,
                  background: isSelected ? 'linear-gradient(135deg, #e50914 0%, #b80710 100%)' : '#141824',
                  color: isSelected ? '#fff' : '#94a3b8',
                  border: isSelected ? '1px solid #ff3342' : '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 15px rgba(229, 9, 20, 0.4)' : 'none',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{dayName}</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: isSelected ? '#fff' : '#f8fafc' }}>{dayNumber}</span>
                <span style={{ fontSize: '0.72rem' }}>{monthName}</span>
              </button>
            );
          })}
        </div>

        {/* Theatres & Showtimes List */}
        {groupedTheatres.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <Calendar size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              No Shows Scheduled on this Date
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Please select another date above or switch your city in the top navigation.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {groupedTheatres.map(({ theatre, shows: tShows }) => (
              <div
                key={theatre._id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Theatre Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                      {theatre.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#94a3b8', fontSize: '0.82rem' }}>
                      <MapPin size={14} color="#e50914" />
                      <span>{theatre.address}, {theatre.city}</span>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {theatre.amenities?.slice(0, 3).map((amenity) => (
                      <span
                        key={amenity}
                        style={{
                          background: '#1a1f2e',
                          color: '#38bdf8',
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 4,
                        }}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Showtimes Grid */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {tShows.map((show) => {
                    const timeStr = new Date(show.showTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });
                    const isSoldOut = show.availableSeatsCount === 0;

                    return (
                      <button
                        key={show._id}
                        disabled={isSoldOut}
                        onClick={() => navigate(`/shows/${show._id}/seats`)}
                        style={{
                          background: '#161b27',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: 10,
                          padding: '0.65rem 1rem',
                          textAlign: 'left',
                          cursor: isSoldOut ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: isSoldOut ? 0.4 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSoldOut) {
                            e.currentTarget.style.borderColor = '#e50914';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.background = '#202738';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSoldOut) {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.background = '#161b27';
                          }
                        }}
                      >
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                          {timeStr}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 600 }}>
                          {show.screenName}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4 }}>
                          {isSoldOut ? (
                            <span style={{ color: '#ef4444' }}>Sold Out</span>
                          ) : (
                            <span>{show.availableSeatsCount} seats left</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cast & Crew Section */}
        {movie.cast && movie.cast.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
              Cast & Characters
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {movie.cast.map((actor, idx) => (
                <div
                  key={idx}
                  className="glass-panel"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#1e2433',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      flexShrink: 0,
                    }}
                  >
                    <User size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                      {actor.name}
                    </div>
                    {actor.character && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        as {actor.character}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailerUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => setShowTrailer(false)}
        >
          <div
            style={{ width: '100%', maxWidth: 900, aspectRatio: '16/9', background: '#000', borderRadius: 16, overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={movie.trailerUrl.replace('watch?v=', 'embed/')}
              title="Trailer"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
