import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, dismissToast } = useFavorites();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl shadow-black/80 text-neutral-100 text-sm max-w-sm">
        <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
        <span className="font-medium text-xs sm:text-sm">{toastMessage}</span>
        <button
          onClick={dismissToast}
          className="ml-auto p-1 text-neutral-400 hover:text-white transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
