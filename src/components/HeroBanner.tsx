import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Plus, Check, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie, getBackdropUrl, getOfficialTrailerKey, GENRE_MAP } from '../services/tmdb';
import { useFavorites } from '../context/FavoritesContext';

interface HeroBannerProps {
  movies: Movie[];
  onPlayTrailer: (movie: Movie) => void;
  isLoading?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movies, onPlayTrailer, isLoading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { isWatchlist, toggleWatchlist } = useFavorites();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const featured = movies.slice(0, 5);
  const currentMovie = featured[currentIndex] || featured[0];

  useEffect(() => {
    if (featured.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featured.length);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [featured.length, isPaused, currentIndex]);

  if (isLoading || !currentMovie) {
    return (
      <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] bg-neutral-900 animate-shimmer overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-16">
          <div className="w-48 h-6 bg-neutral-800 rounded mb-4 animate-pulse" />
          <div className="w-96 max-w-full h-12 bg-neutral-800 rounded mb-4 animate-pulse" />
          <div className="w-full max-w-xl h-20 bg-neutral-800 rounded mb-6 animate-pulse" />
          <div className="flex gap-4">
            <div className="w-36 h-11 bg-neutral-800 rounded-xl animate-pulse" />
            <div className="w-32 h-11 bg-neutral-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const title = currentMovie.title || currentMovie.name || 'Featured Movie';
  const releaseYear = (currentMovie.release_date || currentMovie.first_air_date || '').slice(0, 4);
  const rating = currentMovie.vote_average ? currentMovie.vote_average.toFixed(1) : null;
  
  // Format genres cleanly without pill badges
  const genreNames = currentMovie.genres?.map(g => g.name) ||
    currentMovie.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 3) ||
    [];

  const isInWatchlist = isWatchlist(currentMovie.id);
  const mediaPath = currentMovie.first_air_date ? `/tv/${currentMovie.id}` : `/movie/${currentMovie.id}`;

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % featured.length);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + featured.length) % featured.length);
  };

  return (
    <section
      className="relative w-full h-[75vh] min-h-[520px] max-h-[780px] bg-neutral-950 overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Promotional Movie Banner"
    >
      {/* Background Backdrop Image with smooth fade */}
      <div className="absolute inset-0">
        <img
          key={currentMovie.id}
          src={getBackdropUrl(currentMovie.backdrop_path, 'original')}
          alt={title}
          className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-1000 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="eager"
        />

        {/* Multi-directional Cinema Gradients */}
        {/* Bottom gradient blending seamlessly into dark page content */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
        {/* Left gradient for high-contrast legible typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/70 to-transparent w-full md:w-3/4" />
        {/* Top subtle scrim for top navbar */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-neutral-950/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-14 sm:pb-16">
        <div className="max-w-2xl lg:max-w-3xl space-y-4">
          {/* Metadata Line: Zero-pill discipline with typographical separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-300 font-medium">
            {rating && (
              <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {rating}
              </span>
            )}
            {releaseYear && (
              <>
                <span className="text-neutral-600" aria-hidden="true">·</span>
                <span className="font-mono">{releaseYear}</span>
              </>
            )}
            {currentMovie.runtime && (
              <>
                <span className="text-neutral-600" aria-hidden="true">·</span>
                <span>{Math.floor(currentMovie.runtime / 60)}h {currentMovie.runtime % 60}m</span>
              </>
            )}
            {genreNames.length > 0 && (
              <>
                <span className="text-neutral-600" aria-hidden="true">·</span>
                <span>{genreNames.join(' / ')}</span>
              </>
            )}
            <span className="text-neutral-600" aria-hidden="true">·</span>
            <span className="text-rose-400 uppercase tracking-widest text-[11px] font-semibold">
              Featured Premiere
            </span>
          </div>

          {/* Huge Cinematic Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none font-display drop-shadow-md text-balance">
            {title}
          </h1>

          {/* Movie Tagline / Synopsis */}
          {currentMovie.tagline && (
            <p className="text-sm sm:text-base text-rose-300/90 font-medium italic">
              "{currentMovie.tagline}"
            </p>
          )}

          <p className="text-neutral-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-2xl text-shadow-sm">
            {currentMovie.overview}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => onPlayTrailer(currentMovie)}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-sm sm:text-base transition-all flex items-center gap-2.5 shadow-lg shadow-rose-900/40 glow-red hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-white text-white" />
              <span>Watch Trailer</span>
            </button>

            <Link
              to={mediaPath}
              className="px-5 py-3 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-100 border border-neutral-700/80 rounded-xl font-semibold text-sm sm:text-base transition-all flex items-center gap-2 hover:border-neutral-500 backdrop-blur-sm"
            >
              <Info className="w-5 h-5 text-neutral-300" />
              <span>More Details</span>
            </Link>

            <button
              onClick={() => toggleWatchlist(currentMovie)}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                isInWatchlist
                  ? 'bg-rose-950/80 border-rose-600 text-rose-400'
                  : 'bg-neutral-900/80 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
              title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isInWatchlist ? <Check className="w-5 h-5 text-rose-400" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Navigation Chevrons */}
      {featured.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous featured movie"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-neutral-950/60 hover:bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next featured movie"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Carousel Dots & Mini-Thumbnails */}
      {featured.length > 1 && (
        <div className="absolute bottom-5 right-6 sm:right-10 z-20 hidden sm:flex items-center gap-2">
          {featured.map((movie, idx) => (
            <button
              key={movie.id}
              onClick={() => setCurrentIndex(idx)}
              className={`group/thumb transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-8 h-2 bg-rose-500 rounded-full'
                  : 'w-2 h-2 bg-neutral-600 hover:bg-neutral-400 rounded-full'
              }`}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
