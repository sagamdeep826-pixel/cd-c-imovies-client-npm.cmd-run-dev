import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Ticket,
  Film,
  Building2,
  Plus,
  Trash2,
  Edit,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Movie Modal state
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    tagline: '',
    description: '',
    genres: 'Action, Sci-Fi',
    language: 'English',
    duration: 140,
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 8.5,
    ageRating: 'PG-13',
    director: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    status: 'now_showing',
    featured: false,
  });

  // Schedule Show Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showForm, setShowForm] = useState({
    movieId: '',
    theatreId: '',
    screenName: 'Screen 1 (IMAX 3D)',
    showTime: '',
    priceTier: { standard: 150, premium: 220, vip: 320 },
  });

  // Add Theatre Modal state
  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: 'Bhopal',
    address: '',
    amenities: 'IMAX Laser, Dolby Atmos, Dine-In',
    contactNumber: '+91 755 400 1234',
  });

  // Check Admin permission
  useEffect(() => {
    if (user && !isAdmin) {
      alert('Access forbidden: Administrator privileges required.');
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  // Load Dashboard Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, theatresRes, showsRes, bookingsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/movies?limit=100'),
        api.get('/theatres'),
        api.get('/shows'),
        api.get('/bookings/admin/all?limit=50'),
      ]);

      if (statsRes.success) setStats(statsRes);
      if (moviesRes.success) setMovies(moviesRes.movies || []);
      if (theatresRes.success) setTheatres(theatresRes.theatres || []);
      if (showsRes.success) setShows(showsRes.shows || []);
      if (bookingsRes.success) setAllBookings(bookingsRes.bookings || []);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // Handle Save Movie (Create or Update)
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        genres: typeof movieForm.genres === 'string'
          ? movieForm.genres.split(',').map((g) => g.trim())
          : movieForm.genres,
        duration: Number(movieForm.duration),
        rating: Number(movieForm.rating),
      };

      if (editingMovie) {
        await api.put(`/movies/${editingMovie._id}`, payload);
      } else {
        await api.post('/movies', payload);
      }

      setShowMovieModal(false);
      setEditingMovie(null);
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Error saving movie');
    }
  };

  // Handle Delete Movie
  const handleDeleteMovie = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? Associated shows will also be removed.`)) {
      try {
        await api.delete(`/movies/${id}`);
        loadDashboardData();
      } catch (e) {
        alert(e.message || 'Failed to delete movie');
      }
    }
  };

  // Handle Schedule Show
  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shows', showForm);
      setShowScheduleModal(false);
      alert('Show scheduled and 80-seat grid provisioned successfully!');
      loadDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to schedule show');
    }
  };

  // Handle Delete Show
  const handleDeleteShow = async (id) => {
    if (window.confirm('Cancel this scheduled show?')) {
      try {
        await api.delete(`/shows/${id}`);
        loadDashboardData();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  // Handle Add Theatre
  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...theatreForm,
        amenities: theatreForm.amenities.split(',').map((a) => a.trim()),
        screens: [
          { name: 'Audi 1 (IMAX 3D)', screenType: 'IMAX 3D', totalSeats: 80 },
          { name: 'Audi 2 (Dolby Atmos VIP)', screenType: 'Dolby Atmos VIP', totalSeats: 80 },
        ],
      };
      await api.post('/theatres', payload);
      setShowTheatreModal(false);
      alert('Theatre added successfully!');
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAdmin) {
    return <div style={{ padding: '6rem', textAlign: 'center', color: '#fff' }}>Access Denied</div>;
  }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '85vh' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>
            Admin Cinema Control Center
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Manage movie listings, schedule screenings, monitor real-time ticket sales and theatre setups.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', background: '#121622', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === 'overview' ? '#e50914' : 'transparent',
              color: activeTab === 'overview' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === 'movies' ? '#e50914' : 'transparent',
              color: activeTab === 'movies' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Movies ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('shows')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === 'shows' ? '#e50914' : 'transparent',
              color: activeTab === 'shows' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Shows ({shows.length})
          </button>
          <button
            onClick={() => setActiveTab('theatres')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === 'theatres' ? '#e50914' : 'transparent',
              color: activeTab === 'theatres' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Theatres ({theatres.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === 'bookings' ? '#e50914' : 'transparent',
              color: activeTab === 'bookings' ? '#fff' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Bookings Log
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '6rem', textAlign: 'center', color: '#94a3b8' }}>
          Loading control portal...
        </div>
      ) : (
        <>
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Revenue</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={20} color="#10b981" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    ₹{stats?.stats?.totalRevenue ? stats.stats.totalRevenue.toLocaleString() : '0'}
                  </div>
                  <div style={{ color: '#10b981', fontSize: '0.78rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={13} /> Active live ticketing volume
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Bookings</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(229, 9, 20, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ticket size={20} color="#e50914" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    {stats?.stats?.totalBookings || '0'}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 4 }}>
                    {stats?.stats?.confirmedBookings || '0'} confirmed reservations
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Catalog</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Film size={20} color="#38bdf8" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    {movies.length}
                  </div>
                  <div style={{ color: '#38bdf8', fontSize: '0.78rem', marginTop: 4 }}>
                    {movies.filter((m) => m.status === 'now_showing').length} currently in theatres
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>Partner Theatres</span>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={20} color="#f59e0b" />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    {theatres.length}
                  </div>
                  <div style={{ color: '#fbbf24', fontSize: '0.78rem', marginTop: 4 }}>
                    Across 3 major metropolitan areas
                  </div>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                  Recent Customer Bookings
                </h2>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '0.75rem' }}>Code</th>
                        <th style={{ padding: '0.75rem' }}>Customer</th>
                        <th style={{ padding: '0.75rem' }}>Movie</th>
                        <th style={{ padding: '0.75rem' }}>Theatre</th>
                        <th style={{ padding: '0.75rem' }}>Seats</th>
                        <th style={{ padding: '0.75rem' }}>Amount</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBookings.slice(0, 8).map((b) => (
                        <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 700, color: '#fff' }}>{b.bookingNumber}</td>
                          <td style={{ padding: '0.75rem' }}>{b.user?.name || 'Customer'}</td>
                          <td style={{ padding: '0.75rem', color: '#fff' }}>{b.movie?.title}</td>
                          <td style={{ padding: '0.75rem' }}>{b.theatre?.name}</td>
                          <td style={{ padding: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
                            {b.seats?.map((s) => s.seatNumber).join(', ')}
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 700, color: '#10b981' }}>₹{b.totalAmount}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span
                              style={{
                                background: b.status === 'confirmed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: b.status === 'confirmed' ? '#10b981' : '#ef4444',
                                padding: '0.2rem 0.5rem',
                                borderRadius: 4,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                              }}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MANAGE MOVIES */}
          {activeTab === 'movies' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Movie Catalog Management</h2>
                <button
                  onClick={() => {
                    setEditingMovie(null);
                    setMovieForm({
                      title: '',
                      tagline: '',
                      description: '',
                      genres: 'Action, Sci-Fi',
                      language: 'English',
                      duration: 140,
                      releaseDate: new Date().toISOString().split('T')[0],
                      rating: 8.5,
                      ageRating: 'PG-13',
                      director: '',
                      posterUrl: '',
                      backdropUrl: '',
                      trailerUrl: '',
                      status: 'now_showing',
                      featured: false,
                    });
                    setShowMovieModal(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Add New Movie
                </button>
              </div>

              <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '0.75rem' }}>Movie</th>
                      <th style={{ padding: '0.75rem' }}>Genres</th>
                      <th style={{ padding: '0.75rem' }}>Language</th>
                      <th style={{ padding: '0.75rem' }}>Duration</th>
                      <th style={{ padding: '0.75rem' }}>Rating</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((m) => (
                      <tr key={m._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                        <td style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img src={m.posterUrl} alt="" style={{ width: 36, height: 50, borderRadius: 4, objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{m.title}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.director}</div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{m.genres?.join(', ')}</td>
                        <td style={{ padding: '0.75rem' }}>{m.language}</td>
                        <td style={{ padding: '0.75rem' }}>{m.duration}m</td>
                        <td style={{ padding: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>★ {m.rating}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ background: m.status === 'now_showing' ? '#10b981' : '#f59e0b', color: '#000', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
                            {m.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setEditingMovie(m);
                              setMovieForm({
                                ...m,
                                genres: m.genres?.join(', ') || '',
                                releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : '',
                              });
                              setShowMovieModal(true);
                            }}
                            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginRight: 10 }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(m._id, m.title)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MANAGE SHOWS */}
          {activeTab === 'shows' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Screening Schedules & Showtimes</h2>
                <button
                  onClick={() => {
                    setShowForm({
                      movieId: movies[0]?._id || '',
                      theatreId: theatres[0]?._id || '',
                      screenName: 'Screen 1 (IMAX 3D)',
                      showTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
                      priceTier: { standard: 150, premium: 220, vip: 320 },
                    });
                    setShowScheduleModal(true);
                  }}
                  className="btn-primary"
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Schedule New Show
                </button>
              </div>

              <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '0.75rem' }}>Movie</th>
                      <th style={{ padding: '0.75rem' }}>Theatre</th>
                      <th style={{ padding: '0.75rem' }}>Screen</th>
                      <th style={{ padding: '0.75rem' }}>Timing</th>
                      <th style={{ padding: '0.75rem' }}>Available Seats</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((s) => (
                      <tr key={s._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#fff' }}>{s.movie?.title}</td>
                        <td style={{ padding: '0.75rem' }}>{s.theatre?.name}</td>
                        <td style={{ padding: '0.75rem', color: '#38bdf8' }}>{s.screenName}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {new Date(s.showTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '0.75rem' }}>{s.availableSeatsCount} / {s.totalSeats}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ background: s.status === 'scheduled' ? '#10b981' : '#ef4444', color: '#000', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteShow(s._id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MANAGE THEATRES */}
          {activeTab === 'theatres' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Cinema Theatres</h2>
                <button
                  onClick={() => setShowTheatreModal(true)}
                  className="btn-primary"
                  style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
                >
                  <Plus size={16} /> Add Theatre
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {theatres.map((t) => (
                  <div key={t._id} className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>{t.name}</h3>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{t.address}, {t.city}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>AMENITIES</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: '1rem' }}>
                      {t.amenities?.map((a) => (
                        <span key={a} style={{ background: '#1e2433', color: '#38bdf8', padding: '0.15rem 0.45rem', borderRadius: 4, fontSize: '0.72rem' }}>
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ALL BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                Master Booking Logs
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '0.75rem' }}>Code</th>
                      <th style={{ padding: '0.75rem' }}>User Email</th>
                      <th style={{ padding: '0.75rem' }}>Movie</th>
                      <th style={{ padding: '0.75rem' }}>Date Booked</th>
                      <th style={{ padding: '0.75rem' }}>Seats</th>
                      <th style={{ padding: '0.75rem' }}>Paid</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#fff' }}>{b.bookingNumber}</td>
                        <td style={{ padding: '0.75rem' }}>{b.user?.email}</td>
                        <td style={{ padding: '0.75rem', color: '#fff' }}>{b.movie?.title}</td>
                        <td style={{ padding: '0.75rem' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem', color: '#fbbf24' }}>
                          {b.seats?.map((s) => s.seatNumber).join(', ')}
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#10b981' }}>₹{b.totalAmount}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ background: b.status === 'confirmed' ? '#10b981' : '#ef4444', color: '#000', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Movie Modal */}
      {showMovieModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 640, background: '#121622', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                {editingMovie ? 'Edit Movie' : 'Add New Movie'}
              </h2>
              <button onClick={() => setShowMovieModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Movie Title</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  value={movieForm.tagline}
                  onChange={(e) => setMovieForm({ ...movieForm, tagline: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Synopsis / Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  required
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Genres (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={movieForm.genres}
                    onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Language</label>
                  <input
                    type="text"
                    className="form-input"
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Duration (mins)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Rating (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Age Rating</label>
                  <select
                    className="form-input"
                    value={movieForm.ageRating}
                    onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value })}
                  >
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Poster Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  required
                  placeholder="https://..."
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Trailer URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={movieForm.trailerUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Status</label>
                  <select
                    className="form-input"
                    value={movieForm.status}
                    onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '1.25rem' }}>
                  <input
                    type="checkbox"
                    id="feat"
                    checked={movieForm.featured}
                    onChange={(e) => setMovieForm({ ...movieForm, featured: e.target.checked })}
                  />
                  <label htmlFor="feat" style={{ color: '#fff', fontSize: '0.85rem' }}>Featured in Hero Banner</label>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '0.85rem' }}>
                {editingMovie ? 'Save Changes' : 'Create Movie'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 500, background: '#121622', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Schedule Movie Screening</h2>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateShow} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Select Movie</label>
                <select
                  className="form-input"
                  value={showForm.movieId}
                  onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                  required
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Select Theatre</label>
                <select
                  className="form-input"
                  value={showForm.theatreId}
                  onChange={(e) => setShowForm({ ...showForm, theatreId: e.target.value })}
                  required
                >
                  {theatres.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Screen Name / Format</label>
                <input
                  type="text"
                  className="form-input"
                  value={showForm.screenName}
                  onChange={(e) => setShowForm({ ...showForm, screenName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Screening Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={showForm.showTime}
                  onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.85rem' }}>
                Publish Show & Build Seat Grid
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Theatre Modal */}
      {showTheatreModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 480, background: '#121622', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Add Cinema Theatre</h2>
              <button onClick={() => setShowTheatreModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTheatre} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Theatre Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>City</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={theatreForm.city}
                  onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Address</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={theatreForm.address}
                  onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: 4 }}>Amenities (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={theatreForm.amenities}
                  onChange={(e) => setTheatreForm({ ...theatreForm, amenities: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.85rem' }}>
                Register Theatre
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
