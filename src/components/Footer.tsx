import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Github, Twitter, Youtube, Instagram } from 'lucide-react';
import { MOVIE_GENRES } from '../services/tmdb';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-neutral-900 bg-neutral-950 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-2xl font-black tracking-wider text-neutral-100 font-display"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-900/40">
                <Film className="w-4 h-4" />
              </div>
              <span>
                CINE<span className="text-rose-500">MAX</span>
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
              Your ultimate cinematic destination. Discover trending blockbusters, explore cast filmographies, watch official trailers in 4K, and curate your personalized movie watchlist.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-rose-400 transition-colors">
                  Home Premiere
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-rose-400 transition-colors">
                  Movies Catalog
                </Link>
              </li>
              <li>
                <Link to="/tv" className="hover:text-rose-400 transition-colors">
                  TV Series
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-rose-400 transition-colors">
                  My Watchlist
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-rose-400 transition-colors">
                  Search Titles
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Genres */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3">
              Genres
            </h3>
            <ul className="space-y-2 text-sm">
              {MOVIE_GENRES.slice(0, 6).map(genre => (
                <li key={genre.id}>
                  <Link
                    to={`/movies?genre=${genre.id}`}
                    className="hover:text-rose-400 transition-colors"
                  >
                    {genre.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* TMDB Attribution & Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3">
              Data & API
            </h3>
            <p className="text-xs text-neutral-500 leading-normal">
              This product uses the TMDB API but is not endorsed or certified by TMDB. All movie data, posters, and imagery are supplied courtesy of The Movie Database.
            </p>
            <div className="pt-2">
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                <div className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-semibold text-teal-400 hover:border-teal-500/50 transition-colors">
                  Powered by TMDB
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} CINEMAX Streaming Guide. Built for cinema enthusiasts.</p>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for film lovers worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
