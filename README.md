# CINEMAX - Premium Movie Discovery & Streaming Guide

A modern cinematic movie discovery and streaming web application built with **React**, **Vite**, **Tailwind CSS**, and **The Movie Database (TMDB) API v3**.

---

## ✨ Features

- **Cinematic Hero Carousel**: Full-screen auto-rotating promotional movie backdrops with smooth transitions, ratings, genres, and instant trailer playback.
- **Curated Movie Sections**:
  - Trending Movies of the Week
  - Popular Box Office Hits
  - Highest-Rated Masterpieces
  - Upcoming Theatrical Releases
  - Trending Bingeable TV Series
- **Full Discovery Catalog**: Filter by all official TMDB genres, release years, and sort by popularity, rating, or release date.
- **Instant Search with Live Suggestions**: Debounced live multi-search across movies, TV series, directors, and actors with thumbnail previews.
- **Rich Movie Details**: High-resolution posters, backdrops, vote counts, runtime, box office figures, budget, full synopsis, top-billed cast, and similar recommendations.
- **Official YouTube Trailers**: Direct in-modal video playback with official 4K/HD YouTube trailers and clip selectors.
- **Personal Watchlist & Favorites**: Saved locally with instant badge counters, filterable library, and toast alerts.
- **TMDB API Key Integration**:
  - Automatically loads from `VITE_TMDB_API_KEY` in `.env`
  - Or configure interactively via the built-in TMDB key modal
  - Includes a curated verified TMDB demo dataset for immediate preview if an API key is not yet set.

---

## 🛠️ Tech Stack

- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **React Router DOM v7**
- **Lucide React** (Cinematic iconography)
- **TMDB API v3**
- **LocalStorage API** (Persistent favorites and watchlist)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd cinemax
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure TMDB API Key (Optional but recommended)
1. Register for a free account at [The Movie Database (TMDB)](https://www.themoviedb.org/).
2. Navigate to **Account Settings > API** and request a free Developer API key.
3. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
4. Set your TMDB API v3 key:
```env
VITE_TMDB_API_KEY="your_tmdb_api_key_here"
```
*(You can also input your key directly into the app using the "TMDB Setup" button in the top navigation bar).*

### 4. Run the development server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for production
```bash
npm run build
```

---

## 📜 Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
Movie metadata, backdrop imagery, and cast information are provided courtesy of [The Movie Database (TMDB)](https://www.themoviedb.org).
