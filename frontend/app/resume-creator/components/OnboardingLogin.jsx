import React, { useState } from "react";
import ResumyLogo from './Logo';
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "@/lib/supabaseClient";
import { ArrowLeft } from "lucide-react";
import { SparkleDoodle } from "@/components/landing-redesign/DoodleAnimations";

export default function OnboardingLogin({ onLoginSuccess, onBack }) {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const { error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/resumy/auth/callback?next=${encodeURIComponent(window.location.href)}`
                }
            });
            if (error) throw error;
        } catch (err) {
            console.error("Auth error:", err);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop with extreme blur */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/40 backdrop-blur-2xl"
                onClick={onBack}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white p-8 md:p-10 overflow-hidden"
            >
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <SparkleDoodle color="#6366f1" className="w-20 h-20" />
                </div>

                <div className="flex flex-col items-center">
                    <div className="mb-8">
                        <ResumyLogo size={32} />
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-black text-stone-900 tracking-tight mb-3" style={{ fontFamily: 'Outfit' }}>
                            Ready to build?
                        </h2>
                        <p className="text-stone-500 font-medium text-sm leading-relaxed max-w-[260px] mx-auto">
                            Sign in to save your drafts and access <span className="text-indigo-600 font-bold">AI writing tools.</span>
                        </p>
                    </div>

                    <div className="w-full space-y-4">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 text-stone-700 py-3.5 px-6 rounded-xl font-bold text-sm transition-all hover:bg-stone-50 hover:border-stone-300 active:scale-[0.98] disabled:opacity-70 shadow-sm"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
                                    Connecting...
                                </span>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 18 18">
                                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                                        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957a8.996 8.996 0 000 8.088l3.007-2.332z" fill="#FBBC05" />
                                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.956L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>

                        <button
                            onClick={onBack}
                            disabled={loading}
                            className="w-full py-3 text-stone-400 font-bold text-[11px] uppercase tracking-widest hover:text-stone-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={12} />
                            Maybe Later
                        </button>
                    </div>

                    {/* Security Note */}
                    <div className="mt-10 flex items-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
                        <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        Secure One-Tap Access
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
