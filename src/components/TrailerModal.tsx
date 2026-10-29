import React, { useEffect, useState } from 'react';
import { X, Play, Video } from 'lucide-react';
import { VideoItem } from '../services/tmdb';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerKey: string | null;
  title: string;
  videos?: VideoItem[];
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerKey,
  title,
  videos = []
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(trailerKey);

  useEffect(() => {
    setActiveKey(trailerKey);
  }, [trailerKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ytVideos = videos.filter(v => v.site === 'YouTube');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2 truncate">
            <Video className="w-5 h-5 text-rose-500 shrink-0" />
            <span className="font-semibold text-neutral-100 truncate text-sm sm:text-base">
              {title} {activeKey ? '— Official Trailer' : ''}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            aria-label="Close trailer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {activeKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} Trailer`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-400">
              <Play className="w-12 h-12 mb-3 text-neutral-600" />
              <p className="text-base font-medium text-neutral-300">Official trailer not available for this title</p>
              <p className="text-xs text-neutral-500 mt-1">Check back later or explore other movie previews</p>
            </div>
          )}
        </div>

        {/* Video selection tabs if multiple exist */}
        {ytVideos.length > 1 && (
          <div className="px-5 py-3 bg-neutral-950/90 border-t border-neutral-800 overflow-x-auto no-scrollbar flex items-center gap-2">
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
              Clips & Trailers:
            </span>
            {ytVideos.map(video => (
              <button
                key={video.id}
                onClick={() => setActiveKey(video.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeKey === video.key
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3" />
                <span className="truncate max-w-[180px]">{video.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
