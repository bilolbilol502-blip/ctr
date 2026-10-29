import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie } from '../services/tmdb';

interface FavoritesContextType {
  favorites: Movie[];
  watchlist: Movie[];
  isFavorite: (id: number) => boolean;
  isWatchlist: (id: number) => boolean;
  toggleFavorite: (movie: Movie) => void;
  toggleWatchlist: (movie: Movie) => void;
  removeFavorite: (id: number) => void;
  removeWatchlist: (id: number) => void;
  clearFavorites: () => void;
  clearWatchlist: () => void;
  toastMessage: string | null;
  dismissToast: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'cinemax_user_favorites';
const WATCHLIST_STORAGE_KEY = 'cinemax_user_watchlist';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Movie[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    try {
      const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const dismissToast = () => setToastMessage(null);

  const isFavorite = (id: number) => {
    return favorites.some(m => m.id === id);
  };

  const isWatchlist = (id: number) => {
    return watchlist.some(m => m.id === id);
  };

  const toggleFavorite = (movie: Movie) => {
    const movieTitle = movie.title || movie.name || 'Title';
    setFavorites(prev => {
      const exists = prev.some(m => m.id === movie.id);
      if (exists) {
        showToast(`Removed "${movieTitle}" from Favorites`);
        return prev.filter(m => m.id !== movie.id);
      } else {
        showToast(`Added "${movieTitle}" to Favorites ❤️`);
        return [movie, ...prev];
      }
    });
  };

  const toggleWatchlist = (movie: Movie) => {
    const movieTitle = movie.title || movie.name || 'Title';
    setWatchlist(prev => {
      const exists = prev.some(m => m.id === movie.id);
      if (exists) {
        showToast(`Removed "${movieTitle}" from Watchlist`);
        return prev.filter(m => m.id !== movie.id);
      } else {
        showToast(`Added "${movieTitle}" to Watchlist 🔖`);
        return [movie, ...prev];
      }
    });
  };

  const removeFavorite = (id: number) => {
    setFavorites(prev => prev.filter(m => m.id !== id));
    showToast('Item removed from Favorites');
  };

  const removeWatchlist = (id: number) => {
    setWatchlist(prev => prev.filter(m => m.id !== id));
    showToast('Item removed from Watchlist');
  };

  const clearFavorites = () => {
    setFavorites([]);
    showToast('All Favorites cleared');
  };

  const clearWatchlist = () => {
    setWatchlist([]);
    showToast('Watchlist cleared');
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        watchlist,
        isFavorite,
        isWatchlist,
        toggleFavorite,
        toggleWatchlist,
        removeFavorite,
        removeWatchlist,
        clearFavorites,
        clearWatchlist,
        toastMessage,
        dismissToast
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
