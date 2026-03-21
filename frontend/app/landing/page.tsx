'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './landing.css';

export default function LandingPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'dark'; // The source HTML has simple toggle
        // Replicating the logic from the source HTML's script
        const d = document.documentElement;
        const currentTheme = d.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        d.setAttribute('data-theme', nextTheme);
        setTheme(nextTheme as 'light' | 'dark');
    };

    return (
        <div className="landing-container">
            {/* 1. LANDING SCREEN */}
            <div id="landing" className="landing-hero-wrap">
                <div className="land-grid"></div>
                
                <nav className="land-nav">
                    <div className="logo">Gaply<span>tiq</span></div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Link href="/login" className="btn btn-ghost btn-sm">
                            Sign in
                        </Link>
                        <button className="tt" onClick={toggleTheme}>
                            {theme === 'light' ? '☀' : '☾'}
                        </button>
                    </div>
                </nav>

                <div className="land-hero">
                    <div className="land-pill">AI Resume Platform · Beta</div>
                    <h1 className="land-h1">
                        We build your<br /><em>resume.</em>
                    </h1>
                    <p className="land-sub">
                        From rough ideas to a polished, ATS-ready resume — in minutes, not hours.
                    </p>
                    <div className="land-cta-row">
                        <Link href="/login" className="btn btn-primary land-cta">
                            Start Building →
                        </Link>
                        <Link href="/login" className="btn btn-secondary land-cta">
                            See how it works
                        </Link>
                    </div>
                </div>


                <div className="land-foot label-caps">
                    Trusted by 2,400+ job seekers
                </div>
            </div>
        </div>
    );
}
