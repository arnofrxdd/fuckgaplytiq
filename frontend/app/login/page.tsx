'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/authContext';
import './login.css';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, userId } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // 2. Handle Magic Link / Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    
    setLoading(true);
    setError(null);

    const { error: authError } = await supabaseClient.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/resumy/auth/callback/`,
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  // 3. Handle Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error: authError } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/resumy/auth/callback/`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  // 4. Handle GitHub Login
  const handleGithubLogin = async () => {
    setLoading(true);
    const { error: authError } = await supabaseClient.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/resumy/auth/callback/`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="login-page">
        <div className="login-logo" style={{ color: '#fff', fontSize: '24px', fontFamily: 'DM Serif Display, serif' }}>
          Gaply<span>tiq</span>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-grid" />
      
      <motion.div 
        className="login-card"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="login-header">
          <div className="l-logo">Gaply<span>tiq</span></div>
          <div className="l-title">Welcome back</div>
          <div className="l-sub">Enter your details to access your account</div>
        </div>

        <div className="social-buttons">
          <button className="s-btn google" onClick={handleGoogleLogin} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
            Sign in with Google
          </button>
          <button className="s-btn github" onClick={handleGithubLogin} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Sign in with GitHub
          </button>
        </div>

        <div className="l-divider">or continue via email</div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div 
              key="sent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="success-msg"
            >
              <div className="success-title">Check your inbox!</div>
              <div className="success-sub">We've sent a magic link to <strong>{email}</strong></div>
            </motion.div>
          ) : (
            <motion.form 
              key="form"
              className="l-form"
              onSubmit={handleEmailLogin}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="f-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="f-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button className="btn-login" disabled={loading}>
                {loading ? 'Sending magic link...' : 'Send Magic Link'}
              </button>
              {error && (
                <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
                  {error}
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <div className="l-foot">
          Don't have an account? <a href="/signup">Sign up for free</a>
        </div>
      </motion.div>
    </div>
  );
}
