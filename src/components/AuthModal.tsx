import React, { useState } from 'react';
import { X, User, Mail, Lock, Sparkles, Check, ArrowRight, ShieldCheck, Film } from 'lucide-react';
import { useAuth, PRESET_AVATARS } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    loginAsDemo
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in.');
        }
      } else {
        const res = await register(name, email, password, selectedAvatar);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-rose-900/50 glow-red">
            <Film className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black font-display text-white tracking-tight">
            {authModalTab === 'login' ? 'Welcome Back' : 'Create CINEMAX Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {authModalTab === 'login'
              ? 'Access your watchlist, synchronized ratings, and VIP perks.'
              : 'Join CINEMAX to personalize your movie discovery experience.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setError(null);
              openAuthModal('login');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              authModalTab === 'login'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              openAuthModal('register');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              authModalTab === 'register'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalTab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full py-2.5 pl-10 pr-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-2">
                  Choose Profile Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_AVATARS.map(avatar => {
                    const isSelected = selectedAvatar === avatar.url;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-rose-500 scale-105 shadow-md shadow-rose-900/50'
                            : 'border-neutral-800 hover:border-neutral-600'
                        }`}
                        title={avatar.label}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.label}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-rose-600/30 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full py-2.5 pl-10 pr-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full py-2.5 pl-10 pr-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 glow-red"
          >
            <span>{authModalTab === 'login' ? 'Sign In to CINEMAX' : 'Create My Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 text-center">
          <p className="text-xs text-neutral-400 mb-2">Want to try it out immediately?</p>
          <button
            type="button"
            onClick={loginAsDemo}
            className="w-full py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-semibold text-rose-400 flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Sign In with Demo VIP Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
