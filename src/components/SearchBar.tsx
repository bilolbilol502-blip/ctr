import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Film, Star, Loader2 } from 'lucide-react';
import { Movie, searchMulti, getImageUrl } from '../services/tmdb';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search movies, TV shows, actors, directors...',
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced live suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await searchMulti(query, 1);
        setSuggestions(data.results.slice(0, 5));
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSelectSuggestion = (movie: Movie) => {
    setShowDropdown(false);
    const isTv = Boolean(movie.first_air_date || movie.name);
    navigate(isTv ? `/tv/${movie.id}` : `/movie/${movie.id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-neutral-400">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full py-3.5 pl-12 pr-12 bg-neutral-900/90 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 text-sm sm:text-base focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 shadow-xl shadow-black/40 transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowDropdown(false);
            }}
            className="absolute right-4 p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Live Dropdown Suggestions */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-2 divide-y divide-neutral-800/60">
            {suggestions.map(movie => {
              const title = movie.title || movie.name || 'Untitled';
              const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);
              const isTv = Boolean(movie.first_air_date || movie.name);

              return (
                <button
                  key={movie.id}
                  onClick={() => handleSelectSuggestion(movie)}
                  className="w-full p-2.5 flex items-center gap-3 hover:bg-neutral-800/80 rounded-xl transition-colors text-left group"
                >
                  {/* Poster thumbnail */}
                  <div className="w-10 h-14 bg-neutral-950 rounded-lg overflow-hidden shrink-0">
                    {movie.poster_path ? (
                      <img
                        src={getImageUrl(movie.poster_path, 'w300')}
                        alt={title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600">
                        <Film className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-200 group-hover:text-rose-400 truncate">
                      {title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      {year && <span>{year}</span>}
                      {isTv && <span>· TV Series</span>}
                      {movie.vote_average ? (
                        <span className="flex items-center gap-0.5 text-amber-400 font-mono">
                          · <Star className="w-3 h-3 fill-amber-400 inline" /> {movie.vote_average.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-2.5 px-4 bg-neutral-950/80 hover:bg-neutral-950 text-xs font-semibold text-rose-400 text-center border-t border-neutral-800 transition-colors"
          >
            Press Enter to see all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
};
