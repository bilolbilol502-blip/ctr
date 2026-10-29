import React, { useState } from 'react';
import { Sparkles, Key, X } from 'lucide-react';
import { hasApiKey } from '../services/tmdb';

interface ApiNoticeBannerProps {
  onOpenApiKeyModal: () => void;
}

export const ApiNoticeBanner: React.FC<ApiNoticeBannerProps> = ({ onOpenApiKeyModal }) => {
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('cinemax_banner_dismissed') === 'true';
  });

  const isConfigured = hasApiKey();
  if (isConfigured || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('cinemax_banner_dismissed', 'true');
  };

  return (
    <div className="bg-gradient-to-r from-rose-950/70 via-neutral-900 to-rose-950/70 border-b border-rose-900/40 text-neutral-200 px-4 py-2 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">
            <strong className="text-white font-medium">Curated Demo Mode:</strong> Enjoying CINEMAX with verified TMDB 4K backdrops & official trailers.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shadow-sm"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Connect Live TMDB Key</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
