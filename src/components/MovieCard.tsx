import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Heart, Bookmark, Film } from 'lucide-react';
import { Movie, getImageUrl, GENRE_MAP } from '../services/tmdb';
import { useFavorites } from '../context/FavoritesContext';

interface MovieCardProps {
  movie: Movie;
  onPlayTrailer?: (movie: Movie) => void;
  priority?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onPlayTrailer }) => {
  const [imageError, setImageError] = useState(false);
  const { isFavorite, toggleFavorite, isWatchlist, toggleWatchlist } = useFavorites();

  const title = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const isFav = isFavorite(movie.id);
  const isWatch = isWatchlist(movie.id);

  const isTv = Boolean(movie.first_air_date || movie.name);
  const detailUrl = isTv ? `/tv/${movie.id}` : `/movie/${movie.id}`;

  const primaryGenre = movie.genres?.[0]?.name ||
    (movie.genre_ids?.[0] ? GENRE_MAP[movie.genre_ids[0]] : null);

  return (
    <div className="group relative flex flex-col bg-neutral-900/60 rounded-xl overflow-hidden border border-neutral-800/80 transition-all duration-300 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/60 hover:-translate-y-1">
      {/* Poster Media Box */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
        {!imageError && movie.poster_path ? (
          <img
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-500 text-center">
            <Film className="w-10 h-10 mb-2 text-neutral-700" />
            <span className="text-xs font-medium text-neutral-400 line-clamp-2">{title}</span>
          </div>
        )}

        {/* Top Badges (Rating & Type) */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {rating && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-950/85 backdrop-blur-md border border-neutral-800 text-[11px] font-bold text-amber-400 font-mono shadow-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          )}
          {isTv && (
            <div className="ml-auto px-1.5 py-0.5 rounded bg-neutral-900/90 border border-neutral-800 text-[10px] font-semibold uppercase tracking-wider text-neutral-300">
              TV
            </div>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
          {/* Quick Favorite & Watchlist buttons */}
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(movie);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isFav
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-900/90 text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
              title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
              aria-label={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
            </button>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                toggleWatchlist(movie);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isWatch
                  ? 'bg-rose-600 text-white'
                  : 'bg-neutral-900/90 text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
              title={isWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label={isWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`w-4 h-4 ${isWatch ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Center Play Trailer Button */}
          {onPlayTrailer && (
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onPlayTrailer(movie);
              }}
              className="self-center p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/50 glow-red transform hover:scale-110 active:scale-95 transition-all"
              title="Watch Trailer"
              aria-label={`Watch trailer for ${title}`}
            >
              <Play className="w-5 h-5 fill-white text-white ml-0.5" />
            </button>
          )}

          {/* Quick link button to details */}
          <Link
            to={detailUrl}
            className="w-full py-1.5 px-3 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 text-center text-xs font-semibold text-neutral-100 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Card Body Info */}
      <div className="p-3 flex flex-col flex-grow justify-between gap-1">
        <Link to={detailUrl} className="focus:outline-none">
          <h3
            className="text-sm font-semibold text-neutral-100 group-hover:text-rose-400 transition-colors line-clamp-1 font-display"
            title={title}
          >
            {title}
          </h3>
        </Link>

        {/* Clean inline metadata */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          {releaseYear && <span className="font-mono">{releaseYear}</span>}
          {releaseYear && primaryGenre && <span className="text-neutral-600" aria-hidden="true">·</span>}
          {primaryGenre && <span className="truncate">{primaryGenre}</span>}
        </div>
      </div>
    </div>
  );
};
