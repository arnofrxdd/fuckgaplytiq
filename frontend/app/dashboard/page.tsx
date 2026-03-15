'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
    Plus, 
    FileText, 
    Download, 
    Trash2, 
    Edit, 
    Search, 
    LogOut, 
    MoreVertical, 
    Clock, 
    Eye,
    Layout,
    CheckCircle2,
    Briefcase,
    Zap,
    TrendingUp,
    Info,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/authContext'
import { supabaseClient } from '@/lib/supabaseClient'
import FunLoader from '../resume-creator/components/FunLoader'
import './Dashboard.css'

interface Draft {
    id: string;
    title: string;
    template_id: string;
    updated_at: string;
    data: any;
    design_settings: any;
}

interface Limits {
    allowed: boolean;
    remaining: number;
    limit: number;
    plan: string;
}

export default function DashboardPage() {
    const router = useRouter()
    const { userId, userEmail, isAuthenticated, isLoading: authLoading } = useAuth()
    const [drafts, setDrafts] = useState<Draft[]>([])
    const [limits, setLimits] = useState<Limits | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string, type: 'error' | 'success' } | null>(null);

    const showToast = (message: string, type: 'error' | 'success' = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const API_URL = '/resumy';

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, authLoading, router])

    const fetchData = async () => {
        if (!userId) return;
        try {
            setIsLoading(true)
            const { data: { session } } = await supabaseClient.auth.getSession()
            const token = session?.access_token;

            // 1. Fetch Drafts from builder_resumes table
            const { data: draftsData, error: draftsError } = await supabaseClient
                .from('builder_resumes')
                .select('id, title, template_id, updated_at, data, design_settings')
                .eq('profile_id', userId)
                .order('updated_at', { ascending: false });

            if (draftsError) throw draftsError;
            setDrafts(draftsData || []);

            // 2. Fetch Limits
            const limitRes = await fetch(`${API_URL}/api/resumes/ai-upload-limit`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (limitRes.ok) {
                const limitData = await limitRes.json();
                setLimits(limitData);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated && userId) {
            fetchData()
        }
    }, [isAuthenticated, userId])

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this draft?')) return

        try {
            setDeletingId(id)
            const { error } = await supabaseClient
                .from('builder_resumes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setDrafts(drafts.filter(d => d.id !== id))
            showToast('Draft deleted successfully', 'success')
        } catch (error) {
            console.error('Error deleting draft:', error)
            showToast('Failed to delete draft', 'error')
        } finally {
            setDeletingId(null)
        }
    }


    const handleSignOut = async () => {
        await supabaseClient.auth.signOut()
        router.push('/')
    }

    const filteredDrafts = drafts.filter(d => 
        (d.title || 'Untitled Resume').toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (authLoading || isLoading) {
        return <FunLoader text="Loading Dashboard" />
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="welcome-section">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        My Drafts
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Continue designing exactly where you left off.
                    </motion.p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search drafts..." 
                            className="bg-white border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="user-menu">
                        <button 
                            className="user-avatar"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            {userEmail?.[0].toUpperCase() || 'U'}
                        </button>

                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div 
                                    className="dropdown-menu"
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                >
                                    <div className="px-4 py-3 border-bottom border-slate-100 mb-2">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Account</p>
                                        <p className="text-sm font-bold text-slate-700 truncate">{userEmail}</p>
                                    </div>
                                    <div className="dropdown-item" onClick={() => router.push('/resume-creator')}>
                                        <Zap className="w-4 h-4" />
                                        <span>Editor</span>
                                    </div>
                                    <div className="dropdown-item danger" onClick={handleSignOut}>
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign Out</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* UI MESSAGING (TOAST) */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 20, opacity: 0, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[11000] flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 min-w-[320px]"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {toast.type === 'error' ? <Info size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold leading-tight">{toast.message}</p>
                        </div>
                        <button onClick={() => setToast(null)} className="text-white/40 hover:text-white transition-colors">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="stats-grid">
                <motion.div 
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon blue">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{drafts.length}</span>
                        <span className="stat-label">Total Drafts</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon purple">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{limits?.remaining ?? 0}</span>
                        <span className="stat-label">AI Uploads Today</span>
                    </div>
                </motion.div>

                <motion.div 
                    className="stat-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="stat-icon green">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{limits?.plan || 'Free'}</span>
                        <span className="stat-label">Current Plan</span>
                    </div>
                </motion.div>
            </div>

            {/* Resumes */}
            <div className="resumes-section">
                <div className="section-header">
                    <h2>Recent Drafts</h2>
                </div>

                <div className="resumes-grid">
                    {/* Create New Card */}
                    <motion.div 
                        className="create-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                            if (drafts.length >= 3) {
                                showToast("You've reached the limit of 3 drafts. Please delete an existing draft to start a new one!", 'error');
                                return;
                            }
                            router.push('/resume-creator');
                        }}
                    >
                        <div className="create-icon">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3>Create New</h3>
                        <p>Start from scratch or use AI</p>
                    </motion.div>

                    {/* Resume Cards */}
                    <AnimatePresence mode="popLayout">
                        {filteredDrafts.map((draft, index) => (
                            <motion.div 
                                key={draft.id}
                                className="resume-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 + 0.1 }}
                                layout
                            >
                                <div className="resume-preview">
                                    <div className="flex flex-col items-center justify-center text-stone-300 w-full h-full p-8 bg-stone-50">
                                        <Layout className="w-16 h-16 mb-4 opacity-20 text-stone-900" />
                                        <div className="w-full h-3 bg-stone-200 rounded-full mb-2 opacity-50"></div>
                                        <div className="w-2/3 h-3 bg-stone-200 rounded-full mb-4 opacity-50 text-left"></div>
                                        <div className="w-full h-32 border-2 border-stone-200/50 rounded-xl border-dashed"></div>
                                    </div>
                                    
                                    <div className="resume-preview-overlay">
                                        <div className="overlay-actions">
                                            <button 
                                                className="action-btn"
                                                onClick={() => router.push(`/resume-creator?resumeId=${draft.id}`)}
                                                title="Edit Draft"
                                            >
                                                <Edit className="w-6 h-6" />
                                            </button>
                                            <button 
                                                className="action-btn delete"
                                                onClick={(e) => handleDelete(draft.id, e)}
                                                disabled={deletingId === draft.id}
                                                title="Delete Draft"
                                            >
                                                {deletingId === draft.id ? <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div> : <Trash2 className="w-6 h-6" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="resume-info">
                                    <div>
                                        <span className="resume-title">{draft.title || 'Untitled Resume'}</span>
                                        <div className="resume-meta">
                                            <div className="resume-meta-item">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{new Date(draft.updated_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="resume-meta-item">
                                                <Layout className="w-3.5 h-3.5" />
                                                <span>{draft.template_id || 'Default'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="resume-status started">
                                            Draft
                                        </span>
                                        <div className="flex gap-2">
                                            <button 
                                                className="p-2 text-stone-400 hover:text-blue-600 transition-colors"
                                                onClick={() => router.push(`/resume-creator?resumeId=${draft.id}`)}
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredDrafts.length === 0 && !isLoading && searchQuery && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Search className="w-12 h-12" />
                        </div>
                        <h3>No matches found</h3>
                        <p>We couldn't find any drafts matching "{searchQuery}"</p>
                        <button className="primary-btn" onClick={() => setSearchQuery('')}>
                            Clear Search
                        </button>
                    </div>
                )}

                {drafts.length === 0 && !isLoading && (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Briefcase className="w-12 h-12" />
                        </div>
                        <h3>No drafts yet</h3>
                        <p>Create your first draft project to start building your professional resume.</p>
                        <button className="primary-btn" onClick={() => router.push('/resume-creator')}>
                            <Plus className="w-5 h-5" />
                            Start Your First Draft
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
