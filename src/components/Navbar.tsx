import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Film, Key, Menu, X, User as UserIcon, LogOut, Bookmark, Heart, ChevronDown } from 'lucide-react';
import { hasApiKey } from '../services/tmdb';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenApiKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenApiKeyModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { favorites, watchlist } = useFavorites();
  const { currentUser, isAuthenticated, openAuthModal, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const totalSaved = favorites.length + watchlist.length;
  const isConfigured = hasApiKey();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(quickSearch.trim())}`);
      setQuickSearch('');
      setShowSearchInput(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'TV Shows', path: '/tv' },
    { label: 'My List', path: '/favorites', badge: totalSaved > 0 ? totalSaved : null }
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-900 bg-neutral-950/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single wordmark brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-2xl font-black tracking-wider text-neutral-100 font-display whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-900/40 group-hover:bg-rose-500 transition-colors">
              <Film className="w-4 h-4" />
            </div>
            <span>
              CINE<span className="text-rose-500">MAX</span>
            </span>
          </Link>

          {/* Zone 2: 4 single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
                    isActive
                      ? 'text-rose-500 font-semibold border-b-2 border-rose-500'
                      : 'text-neutral-400 hover:text-neutral-100'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[11px] font-bold text-neutral-300 font-mono">
                      ({link.badge})
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Interactive controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Inline Quick Search (Desktop) */}
            <div className="hidden sm:flex items-center relative">
              {showSearchInput ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={quickSearch}
                    onChange={e => setQuickSearch(e.target.value)}
                    placeholder="Search titles, actors, genres..."
                    autoFocus
                    className="w-52 lg:w-60 px-3.5 py-1.5 pl-9 text-xs bg-neutral-900 border border-neutral-800 rounded-full text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowSearchInput(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-200 absolute right-2"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
                  aria-label="Open search bar"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Search Icon */}
            <Link
              to="/search"
              className="sm:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* TMDB API Key Config button */}
            <button
              onClick={onOpenApiKeyModal}
              title={isConfigured ? 'TMDB API Key connected' : 'Click to configure TMDB API Key'}
              className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Key className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden xl:inline">{isConfigured ? 'TMDB Active' : 'TMDB Setup'}</span>
            </button>

            {/* User Profile / Auth Area */}
            {isAuthenticated && currentUser ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 transition-colors focus:outline-none"
                  aria-label="User account menu"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-rose-500/50 bg-neutral-950 shrink-0">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-neutral-200 hidden lg:inline max-w-[90px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl shadow-black/80 p-2 z-50 animate-fadeIn">
                    <div className="px-3 py-2.5 border-b border-neutral-800/80 mb-1">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-800/40 text-[10px] font-semibold text-rose-300">
                        {currentUser.tier}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-rose-500" />
                      <span>My Profile & Settings</span>
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-rose-500" />
                      <span>Watchlist & Library</span>
                    </Link>

                    <div className="my-1 border-t border-neutral-800/80" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-rose-900/40 whitespace-nowrap shrink-0"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In / Profile</span>
              </button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg transition-colors"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-950 border-b border-neutral-900 px-4 pt-3 pb-5 space-y-2">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={quickSearch}
              onChange={e => setQuickSearch(e.target.value)}
              placeholder="Search movies & shows..."
              className="w-full px-4 py-2 pl-10 text-sm bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
          </form>

          {/* User Status Bar in mobile */}
          {isAuthenticated && currentUser ? (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 mb-2"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-rose-500 bg-neutral-950">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{currentUser.name}</p>
                <p className="text-xs text-rose-400 font-medium">View Profile & Settings</p>
              </div>
            </Link>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mb-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In / Register Profile</span>
            </button>
          )}

          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-rose-500 font-semibold'
                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded font-mono">
                      {link.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-neutral-900 space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenApiKeyModal();
              }}
              className="w-full text-left px-3 py-2 text-sm text-neutral-400 hover:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4 text-rose-500" />
                TMDB API Configuration
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {isConfigured ? 'Active' : 'Demo Mode'}
              </span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-sm text-neutral-400 hover:text-rose-400 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
