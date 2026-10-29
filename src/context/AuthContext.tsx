import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie } from '../services/tmdb';

export interface WatchHistoryItem {
  movieId: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  watchedAt: string;
  media_type?: 'movie' | 'tv';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'VIP Cinephile' | 'Standard Member';
  joinedDate: string;
  favoriteGenres: string[];
  bio?: string;
}

interface StoredAccount extends UserProfile {
  passwordHash: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  watchHistory: WatchHistoryItem[];
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addToWatchHistory: (movie: Movie) => void;
  clearWatchHistory: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'cinemax_auth_user';
const USERS_STORAGE_KEY = 'cinemax_registered_users';
const WATCH_HISTORY_KEY = 'cinemax_watch_history';

export const PRESET_AVATARS = [
  { id: 'cine-1', label: 'Astronaut', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'cine-2', label: 'Director', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'cine-3', label: 'Neo Hero', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'cine-4', label: 'Secret Agent', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'cine-5', label: 'Cinematographer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
  { id: 'cine-6', label: 'Noir Detective', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(WATCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(watchHistory));
  }, [watchHistory]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const getRegisteredUsers = (): StoredAccount[] => {
    try {
      const users = localStorage.getItem(USERS_STORAGE_KEY);
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredUsers = (users: StoredAccount[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();
    
    // Check registered accounts
    const account = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (!account) {
      return { success: false, error: 'Account not found with this email. Please sign up.' };
    }

    if (account.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const { passwordHash: _, ...profile } = account;
    setCurrentUser(profile);
    closeAuthModal();
    return { success: true };
  };

  const register = async (name: string, email: string, password: string, avatar?: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || !trimmedEmail || !password) {
      return { success: false, error: 'All fields are required.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const users = getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newProfile: UserProfile = {
      id: `usr_${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      avatar: avatar || PRESET_AVATARS[0].url,
      tier: 'VIP Cinephile',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      favoriteGenres: ['Sci-Fi', 'Action', 'Drama'],
      bio: 'Movie aficionado exploring cinema on CINEMAX.'
    };

    const newAccount: StoredAccount = {
      ...newProfile,
      passwordHash: password
    };

    saveRegisteredUsers([...users, newAccount]);
    setCurrentUser(newProfile);
    closeAuthModal();
    return { success: true };
  };

  const loginAsDemo = () => {
    const demoUser: UserProfile = {
      id: 'usr_demo_vip',
      name: 'Alex Mercer',
      email: 'alex.mercer@cinemax.tv',
      avatar: PRESET_AVATARS[0].url,
      tier: 'VIP Cinephile',
      joinedDate: 'Oct 2024',
      favoriteGenres: ['Sci-Fi', 'Thriller', 'Adventure'],
      bio: 'Cinema enthusiast, 4K HDR home theater setup, always looking for upcoming sci-fi epics.'
    };
    setCurrentUser(demoUser);
    closeAuthModal();
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };

      // Update in registered accounts array too
      const users = getRegisteredUsers();
      const updatedUsers = users.map(u => (u.id === prev.id ? { ...u, ...updates } : u));
      saveRegisteredUsers(updatedUsers);

      return updated;
    });
  };

  const addToWatchHistory = (movie: Movie) => {
    const title = movie.title || movie.name || 'Untitled';
    const isTv = Boolean(movie.first_air_date || movie.name);

    setWatchHistory(prev => {
      // Remove previous duplicate if watched again
      const filtered = prev.filter(item => item.movieId !== movie.id);
      const newItem: WatchHistoryItem = {
        movieId: movie.id,
        title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        watchedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        media_type: isTv ? 'tv' : 'movie'
      };
      // Keep recent 20
      return [newItem, ...filtered].slice(0, 20);
    });
  };

  const clearWatchHistory = () => {
    setWatchHistory([]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAuthModalOpen,
        authModalTab,
        watchHistory,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginAsDemo,
        logout,
        updateProfile,
        addToWatchHistory,
        clearWatchHistory
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
