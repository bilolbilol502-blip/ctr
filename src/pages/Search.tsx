import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, Film, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Movie, searchMulti, getOfficialTrailerKey, getMovieDetails } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { TrailerModal } from '../components/TrailerModal';

export const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [trailerVideos, setTrailerVideos] = useState<any[]>([]);

  const popularSuggestions = [
    'Dune',
    'Oppenheimer',
    'Interstellar',
    'Spider-Man',
    'The Dark Knight',
    'Gladiator',
    'Arcane',
    'The Last of Us'
  ];

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchMulti(searchTerm.trim(), 1);
      setResults(data.results || []);
    } catch (err) {
      console.error('Search query failed', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuery(queryParam);
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  const handleSelectSuggestion = (tag: string) => {
    setQuery(tag);
    setSearchParams({ q: tag });
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

  const filteredResults = results.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'tv') return Boolean(item.first_air_date || item.name);
    return !Boolean(item.first_air_date || item.name);
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
          Search Titles & Cast
        </h1>
        <p className="text-sm text-neutral-400 mt-2">
          Discover millions of movies, television shows, and people across TMDB.
        </p>
      </div>

      {/* Main Search Input Form */}
      <div className="max-w-2xl mx-auto mb-6">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none text-neutral-400">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
            ) : (
              <SearchIcon className="w-5 h-5" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
            }}
            placeholder="Search by title, director, franchise or actor..."
            className="w-full py-4 pl-12 pr-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 text-base focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-xl shadow-black/60 transition-all"
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setSearchParams({});
              }}
              className="absolute right-4 p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Popular search suggestion pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-neutral-500 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-rose-500" />
            Trending searches:
          </span>
          {popularSuggestions.map(tag => (
            <button
              key={tag}
              onClick={() => handleSelectSuggestion(tag)}
              className="px-3 py-1 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header and Type Filter */}
      {queryParam && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-neutral-800/80 pb-3">
          <div className="text-sm text-neutral-400">
            Found <span className="font-bold text-neutral-100 font-mono">{filteredResults.length}</span> results for "
            <span className="text-white font-medium">{queryParam}</span>"
          </div>

          {results.length > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-neutral-500 mr-1">Type:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'all'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                All ({results.length})
              </button>
              <button
                onClick={() => setFilterType('movie')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'movie'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setFilterType('tv')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterType === 'tv'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white'
                }`}
              >
                TV Series
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-neutral-900 border border-neutral-800 animate-shimmer"
            />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredResults.map(item => (
            <MovieCard
              key={`${item.id}-${item.release_date || item.first_air_date || ''}`}
              movie={item}
              onPlayTrailer={handlePlayTrailer}
            />
          ))}
        </div>
      ) : queryParam ? (
        <div className="text-center py-20 bg-neutral-900/30 border border-neutral-800/80 rounded-2xl p-8 max-w-md mx-auto space-y-3">
          <Film className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-lg font-bold font-display text-white">No Results Found</h3>
          <p className="text-xs text-neutral-400">
            We couldn't find any movies or TV series matching "{queryParam}". Try checking for spelling errors or search for another keyword.
          </p>
        </div>
      ) : null}

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
