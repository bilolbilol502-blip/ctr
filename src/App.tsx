import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AuthModal } from './components/AuthModal';
import { ApiNoticeBanner } from './components/ApiNoticeBanner';
import { Toast } from './components/Toast';
import { ScrollToTop } from './components/ScrollToTop';

import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TvShows } from './pages/TvShows';
import { MovieDetails } from './pages/MovieDetails';
import { Favorites } from './pages/Favorites';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';

export default function App() {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [keyRefreshCounter, setKeyRefreshCounter] = useState(0);

  const handleKeyUpdated = () => {
    setKeyRefreshCounter(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <FavoritesProvider>
        <Router>
          <ScrollToTop />
          <div key={keyRefreshCounter} className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-rose-600 selection:text-white">
            {/* TMDB Mode / Key Setup Notification Banner */}
            <ApiNoticeBanner onOpenApiKeyModal={() => setApiKeyModalOpen(true)} />

            {/* Top Bar Contract Navbar */}
            <Navbar onOpenApiKeyModal={() => setApiKeyModalOpen(true)} />

            {/* Main Route Content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movie/:id" element={<MovieDetails type="movie" />} />
                <Route path="/tv" element={<TvShows />} />
                <Route path="/tv/:id" element={<MovieDetails type="tv" />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/search" element={<Search />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Cinematic Dark Footer */}
            <Footer />

            {/* Floating UI Modals and Toast */}
            <ApiKeyModal
              isOpen={apiKeyModalOpen}
              onClose={() => setApiKeyModalOpen(false)}
              onKeyUpdated={handleKeyUpdated}
            />
            <AuthModal />
            <Toast />
          </div>
        </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
}
