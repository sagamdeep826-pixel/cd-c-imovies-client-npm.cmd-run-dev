import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialGenre = searchParams.get('genre') || 'All';
  const initialStatus = searchParams.get('status') || 'all';

  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [status, setStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState('releaseDate');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load filter lists
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [genresRes, languagesRes] = await Promise.all([
          api.get('/movies/genres'),
          api.get('/movies/languages'),
        ]);
        if (genresRes.success) setGenres(['All', ...(genresRes.genres || [])]);
        if (languagesRes.success) setLanguages(['All', ...(languagesRes.languages || [])]);
      } catch (e) {
        console.error(e);
      }
    };
    loadFilters();
  }, []);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12,
          sortBy,
          order,
        };
        if (search) params.search = search;
        if (selectedGenre !== 'All') params.genre = selectedGenre;
        if (selectedLanguage !== 'All') params.language = selectedLanguage;
        if (status !== 'all') params.status = status;

        const res = await api.get('/movies', { params });
        if (res.success) {
          setMovies(res.movies || []);
          setTotalPages(res.pages || 1);
        }
      } catch (err) {
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [search, selectedGenre, selectedLanguage, status, sortBy, order, page]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '80vh' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
          Explore Movies
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Browse current blockbusters, upcoming previews, and filter by your preferred genres.
        </p>
      </div>

      {/* Filters Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 600 }}>
            SEARCH
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Movie or actor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: '2.2rem', height: 38, fontSize: '0.82rem' }}
            />
          </div>
        </div>

        {/* Genre */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 600 }}>
            GENRE
          </label>
          <select
            className="form-input"
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setPage(1);
            }}
            style={{ height: 38, fontSize: '0.82rem' }}
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 600 }}>
            LANGUAGE
          </label>
          <select
            className="form-input"
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setPage(1);
            }}
            style={{ height: 38, fontSize: '0.82rem' }}
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 600 }}>
            AVAILABILITY
          </label>
          <select
            className="form-input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={{ height: 38, fontSize: '0.82rem' }}
          >
            <option value="all">All Movies</option>
            <option value="now_showing">Now Showing</option>
            <option value="coming_soon">Coming Soon</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: 4, fontWeight: 600 }}>
            SORT BY
          </label>
          <select
            className="form-input"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            style={{ height: 38, fontSize: '0.82rem' }}
          >
            <option value="releaseDate">Release Date</option>
            <option value="rating">Top Rated</option>
            <option value="title">Movie Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          Loading movies...
        </div>
      ) : movies.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Movies Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            We couldn't find any movies matching your current filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedGenre('All');
              setSelectedLanguage('All');
              setStatus('all');
            }}
            className="btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
