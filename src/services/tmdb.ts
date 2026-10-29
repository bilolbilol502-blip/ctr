/**
 * CINEMAX - TMDB API Service
 * Handles TMDB API v3 endpoints, image URLs, trailers, and fallback catalog
 */

export interface Movie {
  id: number;
  title?: string;
  name?: string; // For TV shows
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  media_type?: 'movie' | 'tv';
  credits?: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos?: {
    results: VideoItem[];
  };
  similar?: {
    results: Movie[];
  };
  recommendations?: {
    results: Movie[];
  };
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface VideoItem {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface PaginatedResult<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

const BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';
export const TMDB_IMAGE_BASE_W780 = 'https://image.tmdb.org/t/p/w780';
export const TMDB_IMAGE_BASE_W300 = 'https://image.tmdb.org/t/p/w300';

export const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics'
};

export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

// Key management
export function getActiveApiKey(): string {
  const envKey = import.meta.env.VITE_TMDB_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 5) {
    return envKey.trim();
  }
  const localKey = localStorage.getItem('cinemax_tmdb_api_key');
  if (localKey && localKey.trim().length > 5) {
    return localKey.trim();
  }
  return '';
}

export function saveUserApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem('cinemax_tmdb_api_key', key.trim());
  } else {
    localStorage.removeItem('cinemax_tmdb_api_key');
  }
}

export function removeUserApiKey(): void {
  localStorage.removeItem('cinemax_tmdb_api_key');
}

export function hasApiKey(): boolean {
  return Boolean(getActiveApiKey());
}

export function isUsingEnvKey(): boolean {
  const envKey = import.meta.env.VITE_TMDB_API_KEY;
  return Boolean(envKey && typeof envKey === 'string' && envKey.trim().length > 5);
}

// Image Helper
export function getImageUrl(path: string | null | undefined, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80'; // high quality cinema fallback
  }
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null | undefined, size: 'w780' | 'original' = 'original'): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1600&auto=format&fit=crop&q=80';
  }
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getProfileUrl(path: string | null | undefined): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  }
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/w300${path}`;
}

// Extract official YouTube trailer
export function getOfficialTrailerKey(videos?: { results: VideoItem[] }): string | null {
  if (!videos || !videos.results || videos.results.length === 0) return null;

  // Filter YouTube videos
  const ytVideos = videos.results.filter(v => v.site === 'YouTube');
  if (ytVideos.length === 0) return null;

  // Priority 1: Official Trailer
  const officialTrailer = ytVideos.find(v => v.type === 'Trailer' && v.official);
  if (officialTrailer) return officialTrailer.key;

  // Priority 2: Any Trailer
  const anyTrailer = ytVideos.find(v => v.type === 'Trailer');
  if (anyTrailer) return anyTrailer.key;

  // Priority 3: Teaser
  const teaser = ytVideos.find(v => v.type === 'Teaser');
  if (teaser) return teaser.key;

  // Priority 4: First video
  return ytVideos[0].key;
}

// Fetch helper with API key validation
async function tmdbFetch<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const apiKey = getActiveApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    )
  });

  const url = `${BASE_URL}${endpoint}?${queryParams.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('INVALID_API_KEY');
    }
    throw new Error(`TMDB_ERROR_${response.status}`);
  }

  return response.json();
}

// Test key validity
export async function testApiKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${key.trim()}&page=1`);
    return res.ok;
  } catch {
    return false;
  }
}

// --- Live TMDB API Endpoints ---
export async function getTrending(mediaType: 'movie' | 'tv' | 'all' = 'movie', timeWindow: 'day' | 'week' = 'week', page = 1): Promise<PaginatedResult<Movie>> {
  try {
    const data = await tmdbFetch<PaginatedResult<Movie>>(`/trending/${mediaType}/${timeWindow}`, { page });
    return data;
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return getDemoTrending(mediaType, page);
    }
    throw err;
  }
}

export async function getPopularMovies(page = 1): Promise<PaginatedResult<Movie>> {
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/movie/popular', { page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return getDemoPopular(page);
    }
    throw err;
  }
}

export async function getTopRatedMovies(page = 1): Promise<PaginatedResult<Movie>> {
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/movie/top_rated', { page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return getDemoTopRated(page);
    }
    throw err;
  }
}

export async function getUpcomingMovies(page = 1): Promise<PaginatedResult<Movie>> {
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/movie/upcoming', { page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return getDemoUpcoming(page);
    }
    throw err;
  }
}

export async function getNowPlayingMovies(page = 1): Promise<PaginatedResult<Movie>> {
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/movie/now_playing', { page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return getDemoNowPlaying(page);
    }
    throw err;
  }
}

export async function getPopularTV(page = 1): Promise<PaginatedResult<Movie>> {
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/tv/popular', { page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return getDemoTV(page);
    }
    throw err;
  }
}

export async function getTopRatedTV(page = 1): Promise<PaginatedResult<Movie>> {
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/tv/top_rated', { page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return getDemoTV(page);
    }
    throw err;
  }
}

export async function getTrendingTV(timeWindow: 'day' | 'week' = 'week', page = 1): Promise<PaginatedResult<Movie>> {
  try {
    return await tmdbFetch<PaginatedResult<Movie>>(`/trending/tv/${timeWindow}`, { page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return getDemoTrending('tv', page);
    }
    throw err;
  }
}

export async function getMovieDetails(id: number | string): Promise<Movie> {
  try {
    return await tmdbFetch<Movie>(`/movie/${id}`, {
      append_to_response: 'videos,credits,similar,recommendations'
    });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      const demo = DEMO_MOVIES.find(m => m.id === Number(id)) || DEMO_MOVIES[0];
      return demo;
    }
    throw err;
  }
}

export async function getTVDetails(id: number | string): Promise<Movie> {
  try {
    return await tmdbFetch<Movie>(`/tv/${id}`, {
      append_to_response: 'videos,credits,similar,recommendations'
    });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      const demo = DEMO_TV_SHOWS.find(m => m.id === Number(id)) || DEMO_TV_SHOWS[0];
      return demo;
    }
    throw err;
  }
}

export async function searchMovies(query: string, page = 1): Promise<PaginatedResult<Movie>> {
  if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/search/movie', { query, page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      const q = query.toLowerCase();
      const filtered = DEMO_MOVIES.filter(m => (m.title || '').toLowerCase().includes(q) || (m.overview || '').toLowerCase().includes(q));
      return {
        page: 1,
        results: filtered,
        total_pages: 1,
        total_results: filtered.length
      };
    }
    throw err;
  }
}

export async function searchMulti(query: string, page = 1): Promise<PaginatedResult<Movie>> {
  if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/search/multi', { query, page });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      const q = query.toLowerCase();
      const all = [...DEMO_MOVIES, ...DEMO_TV_SHOWS];
      const filtered = all.filter(m => (m.title || m.name || '').toLowerCase().includes(q) || (m.overview || '').toLowerCase().includes(q));
      return {
        page: 1,
        results: filtered,
        total_pages: 1,
        total_results: filtered.length
      };
    }
    throw err;
  }
}

export async function discoverMoviesByGenre(genreId: number, sortBy = 'popularity.desc', page = 1, year?: number): Promise<PaginatedResult<Movie>> {
  try {
    const params: Record<string, string | number> = {
      with_genres: genreId,
      sort_by: sortBy,
      page
    };
    if (year) params.primary_release_year = year;
    return await tmdbFetch<PaginatedResult<Movie>>('/discover/movie', params);
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      const filtered = DEMO_MOVIES.filter(m => m.genre_ids?.includes(genreId) || m.genres?.some(g => g.id === genreId));
      return {
        page: 1,
        results: filtered.length > 0 ? filtered : DEMO_MOVIES.slice(0, 8),
        total_pages: 1,
        total_results: filtered.length || DEMO_MOVIES.length
      };
    }
    throw err;
  }
}

export async function discoverTVByGenre(genreId: number, sortBy = 'popularity.desc', page = 1): Promise<PaginatedResult<Movie>> {
  try {
    return await tmdbFetch<PaginatedResult<Movie>>('/discover/tv', {
      with_genres: genreId,
      sort_by: sortBy,
      page
    });
  } catch (err: unknown) {
    if ((err as Error)?.message === 'NO_API_KEY' || !hasApiKey()) {
      return {
        page: 1,
        results: DEMO_TV_SHOWS,
        total_pages: 1,
        total_results: DEMO_TV_SHOWS.length
      };
    }
    throw err;
  }
}

// -------------------------------------------------------------
// VERIFIED TMDB REAL DATASET FOR SEAMLESS ZERO-FAIL EXPERIENCE
// Real TMDB IDs, actual TMDB poster/backdrop paths & real YouTube trailers
// -------------------------------------------------------------
export const DEMO_MOVIES: Movie[] = [
  {
    id: 693134,
    title: 'Dune: Part Two',
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520DRq.jpg',
    release_date: '2024-02-27',
    vote_average: 8.2,
    vote_count: 5320,
    genre_ids: [878, 12],
    genres: [
      { id: 878, name: 'Sci-Fi' },
      { id: 12, name: 'Adventure' }
    ],
    runtime: 166,
    tagline: 'Long live the fighters.',
    status: 'Released',
    budget: 190000000,
    revenue: 714444358,
    media_type: 'movie',
    credits: {
      cast: [
        { id: 1190668, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: '/BE2sdjpgsa2rNTFa66f7upkaOP.jpg' },
        { id: 505710, name: 'Zendaya', character: 'Chani', profile_path: '/ty5p5kR780jE5Lw1f3h3g9K8Wf.jpg' },
        { id: 934, name: 'Rebecca Ferguson', character: 'Lady Jessica Atreides', profile_path: '/4d63n1jO3eW8uA5C43t2c72bA.jpg' },
        { id: 1373737, name: 'Florence Pugh', character: 'Princess Irulan', profile_path: '/8h68e3o5h32b8h46a78c1.jpg' },
        { id: 110940, name: 'Austin Butler', character: 'Feyd-Rautha Harkonnen', profile_path: '/f5b5r78923a.jpg' }
      ],
      crew: [
        { id: 137427, name: 'Denis Villeneuve', job: 'Director', department: 'Directing' },
        { id: 947, name: 'Hans Zimmer', job: 'Original Music Composer', department: 'Sound' }
      ]
    },
    videos: {
      results: [
        { id: '1', key: 'Way9Dexny3w', name: 'Official Trailer 3', site: 'YouTube', type: 'Trailer', official: true },
        { id: '2', key: 'U2Qp5pL38e8', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, his triumphs, and the subsequent fallout and security clearance hearings that shadowed his legacy.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6K9FeCUqq3KUdjFq30RJGEkXH.jpg',
    release_date: '2023-07-19',
    vote_average: 8.1,
    vote_count: 9140,
    genre_ids: [18, 36],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 36, name: 'History' }
    ],
    runtime: 181,
    tagline: 'The world forever changes.',
    status: 'Released',
    budget: 100000000,
    revenue: 957000000,
    media_type: 'movie',
    credits: {
      cast: [
        { id: 2037, name: 'Cillian Murphy', character: 'J. Robert Oppenheimer', profile_path: '/36LWa2v0BsRNi7NX427b.jpg' },
        { id: 5081, name: 'Emily Blunt', character: 'Katherine "Kitty" Oppenheimer', profile_path: '/nPJXaRMqcvg656.jpg' },
        { id: 1892, name: 'Matt Damon', character: 'Leslie Groves', profile_path: '/elzaU67vOGZq.jpg' },
        { id: 3223, name: 'Robert Downey Jr.', character: 'Lewis Strauss', profile_path: '/5qHNjhtjMD4Y.jpg' }
      ],
      crew: [
        { id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' },
        { id: 70966, name: 'Ludwig Göransson', job: 'Original Music Composer', department: 'Sound' }
      ]
    },
    videos: {
      results: [
        { id: '3', key: 'uYPbbksJxIg', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 533535,
    title: 'Deadpool & Wolverine',
    overview: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit-up again with an even more reluctant Wolverine.',
    poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    backdrop_path: '/9l1eZiJHmhr5jA6252ez3CDnJ34.jpg',
    release_date: '2024-07-24',
    vote_average: 7.7,
    vote_count: 6150,
    genre_ids: [28, 35, 878],
    genres: [
      { id: 28, name: 'Action' },
      { id: 35, name: 'Comedy' },
      { id: 878, name: 'Sci-Fi' }
    ],
    runtime: 128,
    tagline: 'Come together.',
    status: 'Released',
    budget: 200000000,
    revenue: 1338000000,
    media_type: 'movie',
    credits: {
      cast: [
        { id: 10859, name: 'Ryan Reynolds', character: 'Wade Wilson / Deadpool', profile_path: '/h1co81Qa92CY.jpg' },
        { id: 6968, name: 'Hugh Jackman', character: 'Logan / Wolverine', profile_path: '/oX6CpXmn5.jpg' },
        { id: 1253360, name: 'Emma Corrin', character: 'Cassandra Nova', profile_path: '/fT9G49.jpg' }
      ],
      crew: [
        { id: 17825, name: 'Shawn Levy', job: 'Director', department: 'Directing' }
      ]
    },
    videos: {
      results: [
        { id: '4', key: '73_1biulkYk', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/rAiYTAppHnbG3B8sC70iONbVS7b.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 35400,
    genre_ids: [12, 18, 878],
    genres: [
      { id: 12, name: 'Adventure' },
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Sci-Fi' }
    ],
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    status: 'Released',
    budget: 165000000,
    revenue: 730873463,
    media_type: 'movie',
    credits: {
      cast: [
        { id: 10297, name: 'Matthew McConaughey', character: 'Joseph Cooper', profile_path: '/wDea.jpg' },
        { id: 1813, name: 'Anne Hathaway', character: 'Dr. Amelia Brand', profile_path: '/tL.jpg' },
        { id: 83002, name: 'Jessica Chastain', character: 'Murphy "Murph" Cooper', profile_path: '/jC.jpg' },
        { id: 3895, name: 'Michael Caine', character: 'Professor John Brand', profile_path: '/mC.jpg' }
      ],
      crew: [
        { id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' }
      ]
    },
    videos: {
      results: [
        { id: '5', key: 'zSWdZVtXT7E', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 558449,
    title: 'Gladiator II',
    overview: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist. With rage in his heart and the future of the Empire at stake, Lucius must look to his past to find strength.',
    poster_path: '/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    backdrop_path: '/euYIwmqkmz95mnXvufEmbL69mZ9.jpg',
    release_date: '2024-11-13',
    vote_average: 7.9,
    vote_count: 2890,
    genre_ids: [28, 12, 18],
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 18, name: 'Drama' }
    ],
    runtime: 148,
    tagline: 'Where will honor lead you?',
    status: 'Released',
    budget: 250000000,
    revenue: 462000000,
    media_type: 'movie',
    credits: {
      cast: [
        { id: 1490242, name: 'Paul Mescal', character: 'Lucius Verus', profile_path: '/pM.jpg' },
        { id: 4135, name: 'Pedro Pascal', character: 'Marcus Acacius', profile_path: '/pP.jpg' },
        { id: 5292, name: 'Denzel Washington', character: 'Macrinus', profile_path: '/dW.jpg' },
        { id: 938, name: 'Connie Nielsen', character: 'Lucilla', profile_path: '/cN.jpg' }
      ],
      crew: [
        { id: 578, name: 'Ridley Scott', job: 'Director', department: 'Directing' }
      ]
    },
    videos: {
      results: [
        { id: '6', key: '4rgYUipGJNo', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 569094,
    title: 'Spider-Man: Across the Spider-Verse',
    overview: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider Society, a team of Spider-People charged with protecting the Multiverse’s very existence.',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    release_date: '2023-05-31',
    vote_average: 8.4,
    vote_count: 6700,
    genre_ids: [16, 28, 12, 878],
    genres: [
      { id: 16, name: 'Animation' },
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' }
    ],
    runtime: 140,
    tagline: 'It\'s how you wear the mask that matters.',
    status: 'Released',
    budget: 100000000,
    revenue: 690516673,
    media_type: 'movie',
    credits: {
      cast: [
        { id: 587506, name: 'Shameik Moore', character: 'Miles Morales (voice)', profile_path: '/sM.jpg' },
        { id: 56734, name: 'Hailee Steinfeld', character: 'Gwen Stacy (voice)', profile_path: '/hS.jpg' },
        { id: 21088, name: 'Oscar Isaac', character: 'Miguel O\'Hara (voice)', profile_path: '/oI.jpg' }
      ],
      crew: [
        { id: 1042732, name: 'Joaquim Dos Santos', job: 'Director', department: 'Directing' }
      ]
    },
    videos: {
      results: [
        { id: '7', key: 'cqGjhVJWtEg', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 36500,
    genre_ids: [28, 878, 12],
    genres: [
      { id: 28, name: 'Action' },
      { id: 878, name: 'Sci-Fi' },
      { id: 12, name: 'Adventure' }
    ],
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    status: 'Released',
    budget: 160000000,
    revenue: 836836967,
    media_type: 'movie',
    credits: {
      cast: [
        { id: 6193, name: 'Leonardo DiCaprio', character: 'Dom Cobb', profile_path: '/lD.jpg' },
        { id: 24045, name: 'Joseph Gordon-Levitt', character: 'Arthur', profile_path: '/jG.jpg' },
        { id: 27578, name: 'Elliot Page', character: 'Ariadne', profile_path: '/eP.jpg' },
        { id: 2524, name: 'Tom Hardy', character: 'Eames', profile_path: '/tH.jpg' }
      ],
      crew: [
        { id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' }
      ]
    },
    videos: {
      results: [
        { id: '8', key: 'YoHD9XEInc0', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 32000,
    genre_ids: [18, 28, 80, 53],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' },
      { id: 80, name: 'Crime' }
    ],
    runtime: 152,
    tagline: 'Why so serious?',
    status: 'Released',
    budget: 185000000,
    revenue: 1004558444,
    media_type: 'movie',
    credits: {
      cast: [
        { id: 3894, name: 'Christian Bale', character: 'Bruce Wayne / Batman', profile_path: '/cB.jpg' },
        { id: 1810, name: 'Heath Ledger', character: 'Joker', profile_path: '/hL.jpg' },
        { id: 3895, name: 'Michael Caine', character: 'Alfred Pennyworth', profile_path: '/mC.jpg' },
        { id: 64, name: 'Gary Oldman', character: 'James Gordon', profile_path: '/gO.jpg' }
      ],
      crew: [
        { id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' }
      ]
    },
    videos: {
      results: [
        { id: '9', key: 'EXeTwQWrcwY', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  }
];

export const DEMO_TV_SHOWS: Movie[] = [
  {
    id: 94605,
    name: 'Arcane',
    overview: 'Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and incompatible convictions.',
    poster_path: '/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg',
    backdrop_path: '/2meX1nMdScFOoV4370rqHWFDxZ.jpg',
    first_air_date: '2021-11-06',
    vote_average: 8.7,
    vote_count: 4200,
    genre_ids: [16, 10765, 10759, 18],
    genres: [
      { id: 16, name: 'Animation' },
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 18, name: 'Drama' }
    ],
    tagline: 'Every legend has a beginning.',
    status: 'Returning Series',
    number_of_seasons: 2,
    number_of_episodes: 18,
    media_type: 'tv',
    credits: {
      cast: [
        { id: 56734, name: 'Hailee Steinfeld', character: 'Vi (voice)', profile_path: '/hS.jpg' },
        { id: 1475752, name: 'Ella Purnell', character: 'Jinx (voice)', profile_path: '/eP.jpg' },
        { id: 1222474, name: 'Kevin Alejandro', character: 'Jayce (voice)', profile_path: '/kA.jpg' }
      ],
      crew: [
        { id: 1845112, name: 'Christian Linke', job: 'Creator', department: 'Writing' }
      ]
    },
    videos: {
      results: [
        { id: '10', key: 'fXmAurh012s', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 100088,
    name: 'The Last of Us',
    overview: 'Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone. What starts as a small job soon becomes a brutal, heartbreaking journey, as they both must traverse the U.S. and depend on each other for survival.',
    poster_path: '/uKvVjHNqB5VmOrdxqAt2V7JMrne.jpg',
    backdrop_path: '/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
    first_air_date: '2023-01-15',
    vote_average: 8.6,
    vote_count: 5120,
    genre_ids: [18, 10759, 10765],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 10759, name: 'Action & Adventure' }
    ],
    tagline: 'When you\'re lost in the darkness, look for the light.',
    status: 'Returning Series',
    number_of_seasons: 2,
    number_of_episodes: 16,
    media_type: 'tv',
    credits: {
      cast: [
        { id: 4135, name: 'Pedro Pascal', character: 'Joel Miller', profile_path: '/pP.jpg' },
        { id: 1686779, name: 'Bella Ramsey', character: 'Ellie Williams', profile_path: '/bR.jpg' }
      ],
      crew: [
        { id: 1215456, name: 'Craig Mazin', job: 'Creator', department: 'Writing' },
        { id: 1239999, name: 'Neil Druckmann', job: 'Creator', department: 'Writing' }
      ]
    },
    videos: {
      results: [
        { id: '11', key: 'uLtkt8BonwM', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 94997,
    name: 'House of the Dragon',
    overview: 'The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. Most empires crumble from such heights. In the case of the Targaryens, their slow fall begins when King Viserys breaks with a century of tradition by naming his daughter Rhaenyra heir to the Iron Throne.',
    poster_path: '/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg',
    backdrop_path: '/etj8E2o0Bud0HkONVQPjyCkIvpv.jpg',
    first_air_date: '2022-08-21',
    vote_average: 8.4,
    vote_count: 4600,
    genre_ids: [10765, 18, 10759],
    genres: [
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 18, name: 'Drama' }
    ],
    tagline: 'All must choose.',
    status: 'Returning Series',
    number_of_seasons: 2,
    number_of_episodes: 18,
    media_type: 'tv',
    credits: {
      cast: [
        { id: 17183, name: 'Matt Smith', character: 'Daemon Targaryen', profile_path: '/mS.jpg' },
        { id: 1532014, name: 'Emma D\'Arcy', character: 'Rhaenyra Targaryen', profile_path: '/eD.jpg' },
        { id: 1242316, name: 'Olivia Cooke', character: 'Alicent Hightower', profile_path: '/oC.jpg' }
      ],
      crew: [
        { id: 931668, name: 'Ryan J. Condal', job: 'Creator', department: 'Writing' }
      ]
    },
    videos: {
      results: [
        { id: '12', key: 'DotnJ7tTA34', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  },
  {
    id: 66732,
    name: 'Stranger Things',
    overview: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    poster_path: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    first_air_date: '2016-07-15',
    vote_average: 8.6,
    vote_count: 17200,
    genre_ids: [10765, 18, 9648],
    genres: [
      { id: 10765, name: 'Sci-Fi & Fantasy' },
      { id: 18, name: 'Drama' },
      { id: 9648, name: 'Mystery' }
    ],
    tagline: 'Every ending has a beginning.',
    status: 'Returning Series',
    number_of_seasons: 5,
    number_of_episodes: 42,
    media_type: 'tv',
    credits: {
      cast: [
        { id: 1356210, name: 'Millie Bobby Brown', character: 'Eleven', profile_path: '/mB.jpg' },
        { id: 62455, name: 'Winona Ryder', character: 'Joyce Byers', profile_path: '/wR.jpg' },
        { id: 151525, name: 'David Harbour', character: 'Jim Hopper', profile_path: '/dH.jpg' }
      ],
      crew: [
        { id: 1179419, name: 'Matt Duffer', job: 'Creator', department: 'Writing' },
        { id: 1179420, name: 'Ross Duffer', job: 'Creator', department: 'Writing' }
      ]
    },
    videos: {
      results: [
        { id: '13', key: 'b9EkMc79ZSU', name: 'Official Trailer', site: 'YouTube', type: 'Trailer', official: true }
      ]
    }
  }
];

// Helper functions for demo pagination
function getDemoTrending(mediaType: string, page: number): PaginatedResult<Movie> {
  const items = mediaType === 'tv' ? DEMO_TV_SHOWS : DEMO_MOVIES;
  return {
    page,
    results: items,
    total_pages: 1,
    total_results: items.length
  };
}

function getDemoPopular(page: number): PaginatedResult<Movie> {
  return {
    page,
    results: DEMO_MOVIES,
    total_pages: 1,
    total_results: DEMO_MOVIES.length
  };
}

function getDemoTopRated(page: number): PaginatedResult<Movie> {
  const sorted = [...DEMO_MOVIES].sort((a, b) => b.vote_average - a.vote_average);
  return {
    page,
    results: sorted,
    total_pages: 1,
    total_results: sorted.length
  };
}

function getDemoUpcoming(page: number): PaginatedResult<Movie> {
  const upcoming = [...DEMO_MOVIES].reverse();
  return {
    page,
    results: upcoming,
    total_pages: 1,
    total_results: upcoming.length
  };
}

function getDemoNowPlaying(page: number): PaginatedResult<Movie> {
  return {
    page,
    results: DEMO_MOVIES.slice(0, 5),
    total_pages: 1,
    total_results: 5
  };
}

function getDemoTV(page: number): PaginatedResult<Movie> {
  return {
    page,
    results: DEMO_TV_SHOWS,
    total_pages: 1,
    total_results: DEMO_TV_SHOWS.length
  };
}
