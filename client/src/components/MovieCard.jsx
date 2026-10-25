import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

export default function MovieCard({ movie }) {
  const isNowShowing = movie.status === 'now_showing';

  return (
    <div
      style={{
        background: '#141824',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(229, 9, 20, 0.4)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Poster Image Container */}
      <Link to={`/movies/${movie._id}`} style={{ position: 'relative', width: '100%', paddingTop: '145%', overflow: 'hidden', display: 'block', background: '#0e1017' }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        />

        {/* Rating Badge */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(10, 12, 16, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '0.25rem 0.55rem',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#fbbf24',
          }}
        >
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'}</span>
        </div>

        {/* Demo Data Tag if Offline */}
        {movie.isDemoData && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: movie.ageRating ? 48 : 10,
              background: 'rgba(245, 158, 11, 0.9)',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.65rem',
              padding: '0.2rem 0.4rem',
              borderRadius: 4,
              textTransform: 'uppercase',
            }}
          >
            Demo
          </div>
        )}

        {/* Age Rating Badge */}
        {movie.ageRating && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'rgba(10, 12, 16, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 6,
              padding: '0.2rem 0.45rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#cbd5e1',
            }}
          >
            {movie.ageRating}
          </div>
        )}

        {/* Status Badge */}
        {!isNowShowing && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              right: 10,
              background: 'rgba(245, 158, 11, 0.95)',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.75rem',
              textAlign: 'center',
              padding: '0.3rem',
              borderRadius: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Coming Soon
          </div>
        )}
      </Link>

      {/* Content */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <Link to={`/movies/${movie._id}`}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '0.4rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={movie.title}
            >
              {movie.title}
            </h3>
          </Link>

          {/* Genres */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: '0.6rem' }}>
            {movie.genres?.slice(0, 2).map((genre) => (
              <span
                key={genre}
                style={{
                  background: '#1b2030',
                  color: '#94a3b8',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 4,
                }}
              >
                {genre}
              </span>
            ))}
            <span
              style={{
                background: '#1b2030',
                color: '#38bdf8',
                fontSize: '0.7rem',
                padding: '0.15rem 0.45rem',
                borderRadius: 4,
              }}
            >
              {movie.language}
            </span>
          </div>

          {/* Meta Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: '0.78rem', marginBottom: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Clock size={13} />
              {movie.duration} mins
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/movies/${movie._id}`}
          className={isNowShowing ? 'btn-primary' : 'btn-secondary'}
          style={{
            width: '100%',
            padding: '0.55rem',
            fontSize: '0.82rem',
            borderRadius: 8,
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          {isNowShowing ? (
            <>
              <Ticket size={15} /> Book Tickets
            </>
          ) : (
            'View Details'
          )}
        </Link>
      </div>
    </div>
  );
}
