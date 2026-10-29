import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Film,
  Bookmark,
  Heart,
  History,
  Trash2,
  Edit3,
  Check,
  Play,
  LogOut,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth, PRESET_AVATARS } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { MOVIE_GENRES, getImageUrl, getBackdropUrl } from '../services/tmdb';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateProfile, watchHistory, clearWatchHistory } = useAuth();
  const { favorites, watchlist } = useFavorites();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0].url);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    currentUser?.favoriteGenres || ['Sci-Fi', 'Action']
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 bg-neutral-900 border border-neutral-800 rounded-3xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black font-display text-white">Profile Required</h2>
          <p className="text-sm text-neutral-400">
            Please sign in or create an account to view and manage your CINEMAX profile, personalized watchlist, and watch history.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Back to Home
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-rose-900/40"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim() || currentUser.name,
      bio: editBio.trim(),
      avatar: editAvatar,
      favoriteGenres: selectedGenres
    });
    setIsEditing(false);
  };

  const toggleGenre = (genreName: string) => {
    setSelectedGenres(prev =>
      prev.includes(genreName) ? prev.filter(g => g !== genreName) : [...prev, genreName]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Profile Header Hero */}
      <div className="relative rounded-3xl bg-neutral-900/80 border border-neutral-800 p-6 sm:p-8 overflow-hidden mb-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Avatar */}
            <div className="relative group/avatar">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-rose-500 shadow-xl shadow-rose-950/60 bg-neutral-950 shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-rose-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* User Meta */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 text-xs font-semibold">
                  {currentUser.tier}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-neutral-400 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  {currentUser.email}
                </span>
                <span className="text-neutral-600" aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  Member since {currentUser.joinedDate}
                </span>
              </div>

              {currentUser.bio && (
                <p className="text-xs sm:text-sm text-neutral-300 max-w-xl pt-1">
                  {currentUser.bio}
                </p>
              )}

              {/* Preferred Genres tags */}
              {currentUser.favoriteGenres && currentUser.favoriteGenres.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-2">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 mr-1 font-semibold">
                    Favorite Genres:
                  </span>
                  {currentUser.favoriteGenres.map(g => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-300 text-xs font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditBio(currentUser.bio || '');
                setEditAvatar(currentUser.avatar);
                setSelectedGenres(currentUser.favoriteGenres || []);
                setIsEditing(!isEditing);
              }}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-rose-950/60 text-neutral-400 hover:text-rose-400 border border-neutral-800 hover:border-rose-900/60 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Edit Form Accordion */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-neutral-800 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">Bio</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Tell us about your movie tastes..."
                  className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Select Avatar */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">Change Avatar</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PRESET_AVATARS.map(avatar => {
                  const isSelected = editAvatar === avatar.url;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setEditAvatar(avatar.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-rose-500 scale-105 shadow-md shadow-rose-900/50'
                          : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.label} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorite genres selector */}
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-2">
                Preferred Genres (select to personalize recommendations)
              </label>
              <div className="flex flex-wrap gap-2">
                {MOVIE_GENRES.slice(0, 10).map(g => {
                  const isSelected = selectedGenres.includes(g.name);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGenre(g.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-rose-600 text-white font-semibold'
                          : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-900/40"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link
          to="/favorites"
          className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Watchlist Items
            </span>
            <p className="text-3xl font-black font-mono text-white group-hover:text-rose-400 transition-colors">
              {watchlist.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-rose-500">
            <Bookmark className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/favorites"
          className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Favorites
            </span>
            <p className="text-3xl font-black font-mono text-white group-hover:text-rose-400 transition-colors">
              {favorites.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-rose-500">
            <Heart className="w-5 h-5" />
          </div>
        </Link>

        <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Trailers Watched
            </span>
            <p className="text-3xl font-black font-mono text-white">
              {watchHistory.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-rose-500">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Watch History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Recent Viewing Activity
            </h2>
          </div>
          {watchHistory.length > 0 && (
            <button
              onClick={clearWatchHistory}
              className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {watchHistory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchHistory.map((item, idx) => (
              <div
                key={`${item.movieId}-${idx}`}
                className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-3 flex gap-3 items-center group hover:border-neutral-700 transition-all"
              >
                <div className="w-16 h-22 rounded-xl overflow-hidden bg-neutral-950 shrink-0">
                  <img
                    src={getImageUrl(item.poster_path, 'w300')}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={item.media_type === 'tv' ? `/tv/${item.movieId}` : `/movie/${item.movieId}`}
                    className="text-sm font-semibold text-neutral-200 group-hover:text-rose-400 truncate block transition-colors"
                  >
                    {item.title}
                  </Link>
                  <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                    Watched {item.watchedAt}
                  </p>
                  <Link
                    to={item.media_type === 'tv' ? `/tv/${item.movieId}` : `/movie/${item.movieId}`}
                    className="mt-2 text-xs text-rose-500 hover:text-rose-400 font-medium inline-flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-rose-500" />
                    <span>View Title</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-neutral-900/30 border border-neutral-800/80 text-center text-xs text-neutral-400">
            No watch history yet. Trailers you preview will automatically be tracked here for quick reference.
          </div>
        )}
      </div>
    </div>
  );
};
