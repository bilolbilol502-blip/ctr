import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Play,
  Heart,
  Bookmark,
  Star,
  Clock,
  Calendar,
  ArrowLeft,
  Users,
  DollarSign,
  Globe,
  Film,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  Movie,
  getMovieDetails,
  getTVDetails,
  getBackdropUrl,
  getImageUrl,
  getProfileUrl,
  getOfficialTrailerKey
} from '../services/tmdb';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { TrailerModal } from '../components/TrailerModal';
import { MovieCard } from '../components/MovieCard';

interface MovieDetailsProps {
  type?: 'movie' | 'tv';
}

export const MovieDetails: React.FC<MovieDetailsProps> = ({ type = 'movie' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isWatchlist, toggleWatchlist } = useFavorites();
  const { addToWatchHistory } = useAuth();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = type === 'tv' ? await getTVDetails(id) : await getMovieDetails(id);
        setMovie(data);
        if (data.videos) {
          setTrailerKey(getOfficialTrailerKey(data.videos));
        }
      } catch (err) {
        console.error('Error fetching details', err);
        setError('Failed to load movie details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
        <div className="relative w-full h-[60vh] bg-neutral-900 animate-shimmer" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-36 relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-56 h-84 bg-neutral-800 rounded-2xl animate-pulse shrink-0" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="w-3/4 h-10 bg-neutral-800 rounded animate-pulse" />
              <div className="w-1/2 h-6 bg-neutral-800 rounded animate-pulse" />
              <div className="w-full h-24 bg-neutral-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 bg-neutral-900 border border-neutral-800 rounded-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold font-display text-white">Movie Not Found</h2>
          <p className="text-sm text-neutral-400">{error || 'Unable to retrieve details for this title.'}</p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = movie.title || movie.name || 'Untitled';
  const releaseYear = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const isFav = isFavorite(movie.id);
  const isWatch = isWatchlist(movie.id);

  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const similar = movie.similar?.results?.slice(0, 8) || movie.recommendations?.results?.slice(0, 8) || [];

  const formatCurrency = (amount?: number) => {
    if (!amount || amount === 0) return 'Undisclosed';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 pb-20">
      {/* Huge Backdrop with Cinema Gradient */}
      <div className="relative w-full h-[60vh] min-h-[420px] max-h-[640px] bg-neutral-950 overflow-hidden">
        <img
          src={getBackdropUrl(movie.backdrop_path, 'original')}
          alt={title}
          className="w-full h-full object-cover object-top opacity-50"
          referrerPolicy="no-referrer"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent" />

        {/* Back navigation button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 backdrop-blur-md text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-44 sm:-mt-52 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Poster Card */}
          <div className="w-52 sm:w-64 lg:w-72 shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl shadow-black/80">
              <img
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Quick Action Buttons on Mobile / Under Poster */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => toggleFavorite(movie)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isFav
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                <span>{isFav ? 'Favorited' : 'Favorite'}</span>
              </button>

              <button
                onClick={() => toggleWatchlist(movie)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isWatch
                    ? 'bg-rose-600 text-white border-rose-500'
                    : 'bg-neutral-900/90 text-neutral-300 border-neutral-800 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isWatch ? 'fill-white' : ''}`} />
                <span>{isWatch ? 'In Watchlist' : 'Watchlist'}</span>
              </button>
            </div>
          </div>

          {/* Info Details Column */}
          <div className="flex-1 space-y-6">
            <div>
              {/* Unboxed Metadata line with typographic separators */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-neutral-400 font-medium mb-2">
                {rating && (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {rating} <span className="text-neutral-500 text-xs">({movie.vote_count.toLocaleString()} votes)</span>
                  </span>
                )}
                {releaseYear && (
                  <>
                    <span className="text-neutral-600" aria-hidden="true">·</span>
                    <span className="font-mono">{releaseYear}</span>
                  </>
                )}
                {movie.runtime ? (
                  <>
                    <span className="text-neutral-600" aria-hidden="true">·</span>
                    <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  </>
                ) : null}
                {movie.number_of_seasons ? (
                  <>
                    <span className="text-neutral-600" aria-hidden="true">·</span>
                    <span>{movie.number_of_seasons} Season{movie.number_of_seasons > 1 ? 's' : ''}</span>
                  </>
                ) : null}
                {movie.status && (
                  <>
                    <span className="text-neutral-600" aria-hidden="true">·</span>
                    <span className="text-neutral-300">{movie.status}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
                {title}
              </h1>

              {/* Tagline */}
              {movie.tagline && (
                <p className="text-base text-rose-400/90 font-medium italic mt-2">
                  "{movie.tagline}"
                </p>
              )}

              {/* Genres without pills - clean typographic list */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300 font-medium mt-3">
                  <span className="text-neutral-500 uppercase tracking-wider text-[11px]">Genres:</span>
                  {movie.genres.map((g, idx) => (
                    <React.Fragment key={g.id}>
                      <Link
                        to={`/movies?genre=${g.id}`}
                        className="hover:text-rose-400 transition-colors"
                      >
                        {g.name}
                      </Link>
                      {idx < (movie.genres?.length || 0) - 1 && (
                        <span className="text-neutral-600" aria-hidden="true">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Watch Trailer CTA Banner */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (movie) addToWatchHistory(movie);
                  setTrailerModalOpen(true);
                }}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm sm:text-base transition-all flex items-center gap-2.5 shadow-lg shadow-rose-900/50 glow-red hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Official Trailer</span>
              </button>
            </div>

            {/* Overview */}
            <div className="space-y-2 pt-2">
              <h2 className="text-base font-bold font-display text-neutral-200 uppercase tracking-wider text-xs">
                Synopsis
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                {movie.overview || 'No synopsis provided for this title.'}
              </p>
            </div>

            {/* Key Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-900 text-xs">
              <div>
                <span className="text-neutral-500 block mb-0.5">Release Date</span>
                <span className="text-neutral-200 font-medium font-mono">
                  {movie.release_date || movie.first_air_date || 'Unknown'}
                </span>
              </div>
              {movie.budget !== undefined && movie.budget > 0 && (
                <div>
                  <span className="text-neutral-500 block mb-0.5">Budget</span>
                  <span className="text-neutral-200 font-medium font-mono">
                    {formatCurrency(movie.budget)}
                  </span>
                </div>
              )}
              {movie.revenue !== undefined && movie.revenue > 0 && (
                <div>
                  <span className="text-neutral-500 block mb-0.5">Box Office</span>
                  <span className="text-neutral-200 font-medium font-mono">
                    {formatCurrency(movie.revenue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Billed Cast */}
        {cast.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                  Top Billed Cast
                </h2>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              {cast.map(person => (
                <div
                  key={person.id}
                  className="w-32 sm:w-36 shrink-0 bg-neutral-900/60 border border-neutral-800/80 rounded-xl overflow-hidden p-2 text-center"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-neutral-950 mb-2">
                    <img
                      src={getProfileUrl(person.profile_path)}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs font-semibold text-neutral-100 truncate" title={person.name}>
                    {person.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5" title={person.character}>
                    {person.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar / Recommended Titles */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-5">
              More Like This
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
              {similar.slice(0, 4).map(item => (
                <MovieCard key={item.id} movie={item} onPlayTrailer={() => {
                  setTrailerKey(getOfficialTrailerKey(item.videos));
                  setTrailerModalOpen(true);
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        trailerKey={trailerKey}
        title={title}
        videos={movie.videos?.results || []}
      />
    </div>
  );
};
