import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Movie } from '../services/tmdb';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  exploreLink?: string;
  onPlayTrailer: (movie: Movie) => void;
  isLoading?: boolean;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  subtitle,
  movies,
  exploreLink,
  onPlayTrailer,
  isLoading = false
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative my-8 sm:my-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto group">
      {/* Row Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          {subtitle && (
            <p className="text-xs uppercase tracking-wider text-rose-500 font-semibold mb-1">
              {subtitle}
            </p>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 font-display tracking-tight">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {exploreLink && (
            <Link
              to={exploreLink}
              className="text-xs sm:text-sm font-semibold text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors mr-2"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {/* Scroll Chevrons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Cards List */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-40 sm:w-48 lg:w-52 shrink-0 aspect-[2/3] rounded-xl bg-neutral-900 border border-neutral-800 animate-shimmer"
              />
            ))
          : movies.map(movie => (
              <div key={movie.id} className="w-40 sm:w-48 lg:w-52 shrink-0">
                <MovieCard movie={movie} onPlayTrailer={onPlayTrailer} />
              </div>
            ))}
      </div>
    </section>
  );
};
