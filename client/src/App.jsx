import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import DatabaseStatusBanner from './components/DatabaseStatusBanner';

import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import TheatresPage from './pages/TheatresPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CityProvider>
          <SocketProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0c10' }}>
              <DatabaseStatusBanner />
              <Navbar onOpenAuth={() => setShowAuthModal(true)} />
              
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/movies/:id" element={<MovieDetailsPage />} />
                  <Route
                    path="/shows/:showId/seats"
                    element={<SeatSelectionPage onOpenAuth={() => setShowAuthModal(true)} />}
                  />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/booking-confirmed/:id" element={<BookingConfirmationPage />} />
                  <Route path="/theatres" element={<TheatresPage />} />
                  <Route path="/dashboard" element={<UserDashboardPage />} />
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />

              <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
              />
            </div>
          </SocketProvider>
        </CityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
