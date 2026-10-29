import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, AlertCircle } from 'lucide-react';
import {
  Movie,
  getPopularTV,
  getTopRatedTV,
  getTrendingTV,
  getOfficialTrailerKey,
  getTVDetails
} from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { TrailerModal } from '../components/TrailerModal';

export const TvShows: React.FC = () => {
  const [category, setCategory] = useState<'trending' | 'popular' | 'top_rated'>('trending');
  const [shows, setShows] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [trailerVideos, setTrailerVideos] = useState<any[]>([]);

  const fetchShows = async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      let data;
      if (category === 'trending') {
        data = await getTrendingTV('week', pageNum);
      } else if (category === 'top_rated') {
        data = await getTopRatedTV(pageNum);
      } else {
        data = await getPopularTV(pageNum);
      }

      if (append) {
        setShows(prev => [...prev, ...data.results]);
      } else {
        setShows(data.results || []);
      }
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching TV shows:', err);
      setError('Could not retrieve TV series data.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchShows(1, false);
  }, [category]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchShows(nextPage, true);
    }
  };

  const handlePlayTrailer = async (movie: Movie) => {
    const title = movie.name || movie.title || 'TV Show';
    setTrailerTitle(title);

    try {
      const detailed = await getTVDetails(movie.id);
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
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
          TV Series & Serials
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Explore binge-worthy drama series, fantasy epics, animation, and critically acclaimed shows.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-neutral-900/60 p-1.5 rounded-xl border border-neutral-800 w-fit">
        <button
          onClick={() => setCategory('trending')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            category === 'trending'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Trending Shows
        </button>
        <button
          onClick={() => setCategory('popular')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            category === 'popular'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Popular Hits
        </button>
        <button
          onClick={() => setCategory('top_rated')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            category === 'top_rated'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Top Rated
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
          <button
            onClick={() => fetchShows(1)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-neutral-900 border border-neutral-800 animate-shimmer"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {shows.map(show => (
            <MovieCard
              key={`${show.id}-${show.first_air_date || ''}`}
              movie={show}
              onPlayTrailer={handlePlayTrailer}
            />
          ))}
        </div>
      )}

      {!loading && shows.length > 0 && page < totalPages && (
        <div className="mt-12 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 border border-neutral-800 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                Loading More Series...
              </>
            ) : (
              'Load More Series'
            )}
          </button>
        </div>
      )}

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
