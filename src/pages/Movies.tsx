import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, RefreshCw, AlertCircle, ChevronDown, Check } from 'lucide-react';
import {
  Movie,
  discoverMoviesByGenre,
  getPopularMovies,
  getTopRatedMovies,
  MOVIE_GENRES,
  getOfficialTrailerKey,
  getMovieDetails
} from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { TrailerModal } from '../components/TrailerModal';

export const Movies: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialGenre = searchParams.get('genre') ? Number(searchParams.get('genre')) : null;
  const initialSort = searchParams.get('sort') || 'popularity.desc';

  const [selectedGenre, setSelectedGenre] = useState<number | null>(initialGenre);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trailer modal state
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [trailerVideos, setTrailerVideos] = useState<any[]>([]);

  // Update URL params when filters change
  const updateGenre = (genreId: number | null) => {
    setSelectedGenre(genreId);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (genreId) {
      newParams.set('genre', String(genreId));
    } else {
      newParams.delete('genre');
    }
    setSearchParams(newParams);
  };

  const fetchMoviesList = async (pageNum: number, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      let data;
      if (selectedGenre) {
        data = await discoverMoviesByGenre(selectedGenre, sortBy, pageNum, selectedYear || undefined);
      } else if (sortBy === 'vote_average.desc') {
        data = await getTopRatedMovies(pageNum);
      } else {
        data = await getPopularMovies(pageNum);
      }

      if (append) {
        setMovies(prev => [...prev, ...data.results]);
      } else {
        setMovies(data.results || []);
      }
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Could not retrieve movies with current filter criteria.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMoviesList(1, false);
  }, [selectedGenre, sortBy, selectedYear]);

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMoviesList(nextPage, true);
    }
  };

  const handlePlayTrailer = async (movie: Movie) => {
    const title = movie.title || movie.name || 'Movie';
    setTrailerTitle(title);

    if (movie.videos?.results && movie.videos.results.length > 0) {
      setTrailerKey(getOfficialTrailerKey(movie.videos));
      setTrailerVideos(movie.videos.results);
      setTrailerModalOpen(true);
      return;
    }

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

  const years = [2025, 2024, 2023, 2022, 2021, 2020];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Title & Stats */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
          Movies Discovery
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Explore thousands of blockbusters, indie gems, and critically acclaimed films.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
        {/* Genre Buttons Ribbon */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-rose-500" />
              Filter by Genre
            </span>
            {selectedGenre && (
              <button
                onClick={() => updateGenre(null)}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                Clear Genre
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => updateGenre(null)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedGenre === null
                  ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-900/30'
                  : 'bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
              }`}
            >
              All Genres
            </button>
            {MOVIE_GENRES.map(genre => {
              const isSelected = selectedGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  onClick={() => updateGenre(genre.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-900/30'
                      : 'bg-neutral-950/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary filters row (Sort & Year) */}
        <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="popularity.desc">Most Popular</option>
                <option value="vote_average.desc">Highest Rated</option>
                <option value="release_date.desc">Newest Releases</option>
              </select>
            </div>

            {/* Year Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Release Year:</span>
              <select
                value={selectedYear || ''}
                onChange={e => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="">All Years</option>
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs text-neutral-400 font-mono">
            {movies.length} title{movies.length === 1 ? '' : 's'} loaded
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-sm text-rose-200">{error}</p>
          </div>
          <button
            onClick={() => fetchMoviesList(1)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Movies Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-neutral-900 border border-neutral-800 animate-shimmer"
            />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {movies.map(movie => (
            <MovieCard
              key={`${movie.id}-${movie.release_date || ''}`}
              movie={movie}
              onPlayTrailer={handlePlayTrailer}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8">
          <p className="text-lg font-semibold text-neutral-300">No movies found</p>
          <p className="text-sm text-neutral-500 mt-1">Try adjusting your genre or sort criteria.</p>
          <button
            onClick={() => {
              setSelectedGenre(null);
              setSelectedYear(null);
              setSortBy('popularity.desc');
            }}
            className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Load More Button */}
      {!loading && movies.length > 0 && page < totalPages && (
        <div className="mt-12 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 border border-neutral-800 hover:border-neutral-700 rounded-xl font-semibold text-sm transition-all shadow-lg flex items-center gap-2 mx-auto"
          >
            {loadingMore ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                Loading More Movies...
              </>
            ) : (
              'Load More Movies'
            )}
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
