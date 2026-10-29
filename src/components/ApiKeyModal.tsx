import React, { useState } from 'react';
import { X, Key, CheckCircle, AlertCircle, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';
import { getActiveApiKey, saveUserApiKey, removeUserApiKey, testApiKey, isUsingEnvKey } from '../services/tmdb';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeyUpdated }) => {
  const currentKey = getActiveApiKey();
  const envKeyActive = isUsingEnvKey();
  const [inputKey, setInputKey] = useState(currentKey);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setStatus('error');
      setStatusMessage('Please enter a valid API key or clear to use the demo catalog.');
      return;
    }

    setTesting(true);
    setStatus('idle');
    try {
      const isValid = await testApiKey(inputKey);
      if (isValid) {
        saveUserApiKey(inputKey);
        setStatus('success');
        setStatusMessage('API Key verified! Live TMDB connection is now active.');
        setTimeout(() => {
          onKeyUpdated();
          onClose();
        }, 1200);
      } else {
        setStatus('error');
        setStatusMessage('Invalid API key. Please check your TMDB key from your developer account.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Could not reach TMDB server. Please verify your connection.');
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    removeUserApiKey();
    setInputKey('');
    setStatus('idle');
    setStatusMessage('Key removed. CINEMAX is now in Curated Demo Mode.');
    onKeyUpdated();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-500">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-100 font-display">TMDB API Configuration</h3>
              <p className="text-xs text-neutral-400">Connect to The Movie Database v3 for live global data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleTestAndSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              TMDB API Key (v3 auth)
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="Enter your 32-character TMDB API key"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-mono"
              />
              {currentKey && (
                <div className="absolute right-3 top-2.5 flex items-center gap-1 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Active</span>
                </div>
              )}
            </div>
            {envKeyActive && (
              <p className="text-xs text-emerald-400/90 mt-1.5">
                Loaded from environment variable <code className="bg-neutral-800 px-1 rounded">VITE_TMDB_API_KEY</code>
              </p>
            )}
          </div>

          {status === 'success' && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Key...
                </>
              ) : (
                'Save & Verify Key'
              )}
            </button>
            {currentKey && !envKeyActive && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-sm font-medium transition-colors"
              >
                Clear Key
              </button>
            )}
          </div>
        </form>

        {/* Free TMDB Guide */}
        <div className="mt-5 p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-300 font-semibold">
            <span>How to get a free TMDB API Key:</span>
            <a
              href="https://www.themoviedb.org/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              Sign up <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <ol className="text-neutral-400 list-decimal list-inside space-y-1">
            <li>Create a free account at themoviedb.org</li>
            <li>Go to Account Settings &gt; API</li>
            <li>Request an API Key (Developer option is free and instant)</li>
            <li>Copy your "API Key (v3 auth)" and paste it above</li>
          </ol>
          <div className="pt-1 text-[11px] text-neutral-500 border-t border-neutral-800/60 flex items-center justify-between">
            <span>Demo Catalog is always available without an API key</span>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200 underline"
            >
              Continue with Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
