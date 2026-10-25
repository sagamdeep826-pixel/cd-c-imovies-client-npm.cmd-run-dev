import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Ticket,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Film,
  Star,
  Clock,
  Flame,
} from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';
import { useCity } from '../context/CityContext';

export default function HomePage() {
  const { selectedCity } = useCity();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [movies, setMovies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('now_showing');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerModalUrl, setTrailerModalUrl] = useState(null);

  // Load featured & initial movies
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuredRes, genresRes] = await Promise.all([
          api.get('/movies/featured'),
          api.get('/movies/genres'),
        ]);

        if (featuredRes.success) setFeaturedMovies(featuredRes.movies || []);
        if (genresRes.success) setGenres(['All', ...(genresRes.genres || [])]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch movies whenever status or genre changes
  useEffect(() => {
    const fetchFilteredMovies = async () => {
      try {
        const params = {
          status: statusFilter,
          limit: 12,
        };
        if (selectedGenre !== 'All') params.genre = selectedGenre;
        const res = await api.get('/movies', { params });
        if (res.success) setMovies(res.movies || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchFilteredMovies();
  }, [statusFilter, selectedGenre]);

  // Rotate hero banner every 7s
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies]);

  const activeMovie = featuredMovies[activeHeroIndex] || movies[0];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Banner Section */}
      {activeMovie && (
        <div
          style={{
            position: 'relative',
            minHeight: '75vh',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `linear-gradient(to right, rgba(10, 12, 16, 0.95) 20%, rgba(10, 12, 16, 0.7) 60%, rgba(10, 12, 16, 0.3) 100%), linear-gradient(to top, rgba(10, 12, 16, 1) 0%, transparent 60%), url(${activeMovie.backdropUrl || activeMovie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            padding: '4rem 1.5rem',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
            <div style={{ maxWidth: 650 }}>
              
              {/* Featured Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(229, 9, 20, 0.2)',
                  border: '1px solid rgba(229, 9, 20, 0.4)',
                  borderRadius: 20,
                  padding: '0.35rem 0.85rem',
                  color: '#ff4d4d',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <Flame size={14} color="#e50914" />
                Featured Premiere • In {selectedCity}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: '1rem',
                  color: '#fff',
                }}
              >
                {activeMovie.title}
              </h1>

              {/* Tagline */}
              {activeMovie.tagline && (
                <p style={{ color: '#fbbf24', fontSize: '1.1rem', fontWeight: 600, fontStyle: 'italic', marginBottom: '0.75rem' }}>
                  "{activeMovie.tagline}"
                </p>
              )}

              {/* Meta info pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: '1.25rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontWeight: 700 }}>
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  {activeMovie.rating ? activeMovie.rating.toFixed(1) : '9.0'}/10
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={15} />
                  {activeMovie.duration} mins
                </span>
                <span>•</span>
                <span style={{ background: '#1e2433', padding: '0.2rem 0.5rem', borderRadius: 4, fontWeight: 600, fontSize: '0.78rem' }}>
                  {activeMovie.ageRating || 'PG-13'}
                </span>
                <span>•</span>
                <span>{activeMovie.genres?.join(', ')}</span>
              </div>

              {/* Description */}
              <p
                style={{
                  color: '#94a3b8',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {activeMovie.description}
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <Link
                  to={`/movies/${activeMovie._id}`}
                  className="btn-primary"
                  style={{ padding: '0.85rem 1.8rem', fontSize: '0.95rem', borderRadius: 12 }}
                >
                  <Ticket size={18} /> Book Tickets Now
                </Link>

                {activeMovie.trailerUrl && (
                  <button
                    onClick={() => setTrailerModalUrl(activeMovie.trailerUrl)}
                    className="btn-secondary"
                    style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem', borderRadius: 12 }}
                  >
                    <Play size={18} fill="#fff" /> Watch Trailer
                  </button>
                )}
              </div>
            </div>

            {/* Hero Slider Dots */}
            {featuredMovies.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: '3rem' }}>
                {featuredMovies.map((m, idx) => (
                  <button
                    key={m._id}
                    onClick={() => setActiveHeroIndex(idx)}
                    style={{
                      width: idx === activeHeroIndex ? 32 : 10,
                      height: 8,
                      borderRadius: 4,
                      background: idx === activeHeroIndex ? '#e50914' : 'rgba(255, 255, 255, 0.25)',
                      border: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        
        {/* Filter Navigation Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '1.2rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Status Tabs (Now Showing / Coming Soon) */}
          <div style={{ display: 'flex', background: '#0f121a', padding: 4, borderRadius: 10 }}>
            <button
              onClick={() => setStatusFilter('now_showing')}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: statusFilter === 'now_showing' ? '#e50914' : 'transparent',
                color: statusFilter === 'now_showing' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s ease',
              }}
            >
              Now Showing
            </button>
            <button
              onClick={() => setStatusFilter('coming_soon')}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                background: statusFilter === 'coming_soon' ? '#e50914' : 'transparent',
                color: statusFilter === 'coming_soon' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s ease',
              }}
            >
              Coming Soon
            </button>
          </div>

          {/* Genre Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                style={{
                  background: selectedGenre === genre ? '#232b3e' : '#141824',
                  color: selectedGenre === genre ? '#fff' : '#94a3b8',
                  border: selectedGenre === genre ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 20,
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
              {statusFilter === 'now_showing' ? 'Explore Movies In Theatres' : 'Anticipated Upcoming Releases'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Select a movie to explore showtimes and choose your seats
            </p>
          </div>
          <Link
            to="/movies"
            style={{
              color: '#e50914',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            View All Movies <ChevronRight size={16} />
          </Link>
        </div>

        {/* Movie Grid */}
        {movies.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Film size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Movies Found</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Try adjusting your genre or status filter.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '4rem',
            }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}

        {/* Why Choose IMovies Perks Section */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
              The Ultimate Cinema Booking Experience
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: 600, margin: '0 auto' }}>
              Built specifically to bring real-time seat reservation, fast digital check-in, and premium cinema standards to your fingertips.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(229, 9, 20, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Zap size={24} color="#e50914" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Live Concurrency Locking
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Real-time seat status synchronization via WebSockets prevents double-booking and lets you pick seats instantly without conflicts.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Sparkles size={24} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Digital QR Ticket Entry
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Walk into the theatre seamlessly with paperless dynamic QR codes verified directly at cinema turnstiles.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={24} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                Hassle-Free Cancellations
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Plans changed? Cancel up to 1 hour before showtime and receive instant refunds directly to your original payment method or wallet.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Trailer Modal */}
      {trailerModalUrl && (
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
          onClick={() => setTrailerModalUrl(null)}
        >
          <div
            style={{ width: '100%', maxWidth: 900, aspectRatio: '16/9', background: '#000', borderRadius: 16, overflow: 'hidden', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={trailerModalUrl.replace('watch?v=', 'embed/')}
              title="Movie Trailer"
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
