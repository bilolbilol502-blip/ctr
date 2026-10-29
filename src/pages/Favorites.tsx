import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Trash2, Film, Compass, Play } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { MovieCard } from '../components/MovieCard';
import { TrailerModal } from '../components/TrailerModal';
import { Movie, getOfficialTrailerKey, getMovieDetails } from '../services/tmdb';

export const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, watchlist, clearFavorites, clearWatchlist } = useFavorites();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'favorites'>('watchlist');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [trailerVideos, setTrailerVideos] = useState<any[]>([]);

  const currentList = activeTab === 'watchlist' ? watchlist : favorites;

  const filteredItems = currentList.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'tv') return Boolean(item.first_air_date || item.name);
    return !Boolean(item.first_air_date || item.name);
  });

  const handleClearCurrent = () => {
    if (window.confirm(`Are you sure you want to clear your ${activeTab === 'watchlist' ? 'Watchlist' : 'Favorites'}?`)) {
      if (activeTab === 'watchlist') {
        clearWatchlist();
      } else {
        clearFavorites();
      }
    }
  };

  const handlePlayTrailer = async (movie: Movie) => {
    const title = movie.title || movie.name || 'Movie';
    setTrailerTitle(title);

    try {
      const detailed = await getMovieDetails(movie.id);
      setTrailerKey(getOfficialTrailerKey(detailed.videos));
      setTrailerVideos(detailed.videos?.results || []);
      setTrailerModalOpen(true);
    } catch {
      setTrailerKey(null);
      setTrailerVideos([]);
      setTrailerModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            My Cinematic Library
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Manage your personal watchlist and all-time favorite titles.
          </p>
        </div>

        {currentList.length > 0 && (
          <button
            onClick={handleClearCurrent}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 border border-neutral-800 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear {activeTab === 'watchlist' ? 'Watchlist' : 'Favorites'}</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher and Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-neutral-800 pb-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-neutral-900/60 p-1.5 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'watchlist'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Watchlist ({watchlist.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Favorites ({favorites.length})</span>
          </button>
        </div>

        {/* Media Type Filter */}
        {currentList.length > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-500 mr-1">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'all' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('movie')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'movie' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setFilterType('tv')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'tv' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              TV Shows
            </button>
          </div>
        )}
      </div>

      {/* Grid of Saved Items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map(item => (
            <MovieCard
              key={`${item.id}-${activeTab}`}
              movie={item}
              onPlayTrailer={handlePlayTrailer}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-8 max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-900 flex items-center justify-center mx-auto text-rose-500">
            {activeTab === 'watchlist' ? <Bookmark className="w-7 h-7" /> : <Heart className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-white">
              Your {activeTab === 'watchlist' ? 'Watchlist' : 'Favorites'} is Empty
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Explore trending titles and click the bookmark or heart icon on any movie poster to add them to your collection.
            </p>
          </div>
          <button
            onClick={() => navigate('/movies')}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 mx-auto"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Movies</span>
          </button>
        </div>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailerKey={trailerKey}
        title={trailerTitle}
        videos={trailerVideos}
      />
    </div>
  );
};
