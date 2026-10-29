import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Flame, TrendingUp, Award, Calendar, Tv } from 'lucide-react';
import {
  Movie,
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getTrendingTV,
  MOVIE_GENRES,
  getOfficialTrailerKey,
  getMovieDetails,
  getTVDetails
} from '../services/tmdb';
import { useAuth } from '../context/AuthContext';
import { HeroBanner } from '../components/HeroBanner';
import { MovieRow } from '../components/MovieRow';
import { TrailerModal } from '../components/TrailerModal';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToWatchHistory } = useAuth();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [trendingTv, setTrendingTv] = useState<Movie[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trailer modal state
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [trailerVideos, setTrailerVideos] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, popRes, topRes, upRes, tvRes] = await Promise.all([
        getTrending('movie', 'week'),
        getPopularMovies(1),
        getTopRatedMovies(1),
        getUpcomingMovies(1),
        getTrendingTV('week')
      ]);

      setTrending(trendRes.results || []);
      setPopular(popRes.results || []);
      setTopRated(topRes.results || []);
      setUpcoming(upRes.results || []);
      setTrendingTv(tvRes.results || []);
    } catch (err: any) {
      console.error('Failed to load home movie rows', err);
      setError('Unable to fetch movie collections. Please check your network or TMDB settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlayTrailer = async (movie: Movie) => {
    addToWatchHistory(movie);
    const title = movie.title || movie.name || 'Movie';
    setTrailerTitle(title);

    // If movie already has videos attached
    if (movie.videos?.results && movie.videos.results.length > 0) {
      const key = getOfficialTrailerKey(movie.videos);
      setTrailerKey(key);
      setTrailerVideos(movie.videos.results);
      setTrailerModalOpen(true);
      return;
    }

    // Otherwise fetch movie details with append_to_response=videos
    try {
      const isTv = Boolean(movie.first_air_date || movie.name);
      const detailed = isTv ? await getTVDetails(movie.id) : await getMovieDetails(movie.id);
      const key = getOfficialTrailerKey(detailed.videos);
      setTrailerKey(key);
      setTrailerVideos(detailed.videos?.results || []);
      setTrailerModalOpen(true);
    } catch {
      setTrailerKey(null);
      setTrailerVideos([]);
      setTrailerModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col pb-16">
      {/* Hero Section */}
      <HeroBanner
        movies={trending.length > 0 ? trending : popular}
        onPlayTrailer={handlePlayTrailer}
        isLoading={loading}
      />

      {/* Genre Quick Navigation Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-6 -mb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider shrink-0 mr-2">
            Genres:
          </span>
          {MOVIE_GENRES.map(genre => (
            <button
              key={genre.id}
              onClick={() => navigate(`/movies?genre=${genre.id}`)}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800/80 text-xs font-medium whitespace-nowrap transition-colors"
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error State with Retry Button */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-8">
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Curated Movie Sections */}
      <div className="space-y-4">
        {/* Trending This Week */}
        <MovieRow
          title="Trending This Week"
          subtitle="What people are watching now"
          movies={trending}
          exploreLink="/movies?sort=popularity.desc"
          onPlayTrailer={handlePlayTrailer}
          isLoading={loading}
        />

        {/* Popular Blockbusters */}
        <MovieRow
          title="Popular Blockbusters"
          subtitle="Top box office hits"
          movies={popular}
          exploreLink="/movies?sort=popularity.desc"
          onPlayTrailer={handlePlayTrailer}
          isLoading={loading}
        />

        {/* Highest Rated Films */}
        <MovieRow
          title="Critically Acclaimed"
          subtitle="All-time top rated cinema"
          movies={topRated}
          exploreLink="/movies?sort=vote_average.desc"
          onPlayTrailer={handlePlayTrailer}
          isLoading={loading}
        />

        {/* Upcoming Theatrical Releases */}
        <MovieRow
          title="Coming Soon to Theaters"
          subtitle="Upcoming releases to anticipate"
          movies={upcoming}
          exploreLink="/movies?sort=release_date.desc"
          onPlayTrailer={handlePlayTrailer}
          isLoading={loading}
        />

        {/* Trending TV & Bingeable Series */}
        <MovieRow
          title="Trending TV Series"
          subtitle="Binge-worthy shows & serials"
          movies={trendingTv}
          exploreLink="/tv"
          onPlayTrailer={handlePlayTrailer}
          isLoading={loading}
        />
      </div>

      {/* Feature Spotlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 mb-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-rose-950/40 border border-neutral-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-widest">
              Cinematic Experience
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Never Miss a Masterpiece Again
            </h3>
            <p className="text-sm text-neutral-400">
              Save your must-watch movies, preview official high-definition trailers, explore cast filmographies, and filter by any genre in one unified platform.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/movies')}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-rose-900/30"
            >
              Browse Full Catalog
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl font-semibold text-sm transition-colors"
            >
              My Saved List
            </button>
          </div>
        </div>
      </section>

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
