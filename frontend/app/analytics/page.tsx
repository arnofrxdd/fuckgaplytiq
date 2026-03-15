'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Activity, Users, Zap, DollarSign, ArrowUpRight, 
    ArrowDownRight, BarChart3, PieChart as PieChartIcon, 
    Clock, Cpu, Binary, Search, RefreshCcw, 
    ChevronLeft, Globe, Terminal, ShieldCheck
} from 'lucide-react'
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart, 
    Bar, Cell, PieChart, Pie 
} from 'recharts'
import { supabaseClient } from '@/lib/supabaseClient'
import './AnalyticsDashboard.css'

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({
        totalSessions: 0,
        activeUsers: 0,
        totalTokens: 0,
        totalCost: 0,
        avgTTV: 0,
        retention: 0
    });
    const [timeSeries, setTimeSeries] = useState<any[]>([]);
    const [aiLogs, setAiLogs] = useState<any[]>([]);
    const [modelUsage, setModelUsage] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [rawActivityData, setRawActivityData] = useState<any[]>([]);
    const [showAnonymous, setShowAnonymous] = useState(true);

    useEffect(() => {
        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 60000); // Auto refresh every min
        return () => clearInterval(interval);
    }, [showAnonymous]);

    const fetchAnalytics = async () => {
        try {
            // 1. Fetch User Activity Stats
            const { data: activityData, error: actErr } = await supabaseClient
                .from('user_activity_analytics')
                .select('*')
                .order('last_active_at', { ascending: false });

            if (actErr) throw actErr;
            setRawActivityData(activityData);

            // Filter data based on anonymous toggle
            const filteredActivity = showAnonymous 
                ? activityData 
                : activityData.filter(a => a.user_id !== null);

            // 2. Fetch AI Consumption Logs
            const { data: aiData, error: aiErr } = await supabaseClient
                .from('ai_consumption_logs')
                .select('*')
                .order('created_at', { ascending: false });

            const filteredAiLogs = showAnonymous
                ? aiData
                : aiData?.filter(log => log.user_id !== null) || [];

            // Calculate Aggregates
            const totalSessions = filteredActivity.length;
            const uniqueUsers = new Set(filteredActivity.map(a => a.user_id).filter(Boolean)).size;
            const totalTokens = filteredAiLogs?.reduce((acc, log) => acc + (log.total_tokens || 0), 0) || 0;
            const totalCost = filteredAiLogs?.reduce((acc, log) => acc + (log.estimated_cost_usd || 0), 0) || 0;
            const avgTTV = filteredActivity.filter(a => a.ttv_seconds).reduce((acc, a) => acc + a.ttv_seconds, 0) / (filteredActivity.filter(a => a.ttv_seconds).length || 1);

            setStats({
                totalSessions,
                activeUsers: uniqueUsers,
                totalTokens,
                totalCost,
                avgTTV: Math.round(avgTTV),
                retention: Math.round((activityData.filter(a => !a.is_first_session).length / totalSessions) * 100)
            });

            // Model Distribution
            const modelMap: Record<string, number> = {};
            aiData?.forEach(log => {
                modelMap[log.model_name] = (modelMap[log.model_name] || 0) + 1;
            });
            setModelUsage(Object.entries(modelMap).map(([name, value]) => ({ name, value })));

            // Time Series (Last 7 days mockup logic or real grouping)
            // For now, grouping AI calls by date
            const dailyMap: Record<string, any> = {};
            aiData?.forEach(log => {
                const date = new Date(log.created_at).toLocaleDateString();
                if (!dailyMap[date]) dailyMap[date] = { date, tokens: 0, cost: 0, calls: 0 };
                dailyMap[date].tokens += log.total_tokens;
                dailyMap[date].cost += log.estimated_cost_usd;
                dailyMap[date].calls += 1;
            });
            setTimeSeries(Object.values(dailyMap).reverse().slice(-7));

            setRecentActivity(filteredActivity.slice(0, 10));
            setAiLogs(filteredAiLogs?.slice(0, 10) || []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="analytics-container flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCcw className="animate-spin text-blue-500" size={48} />
                    <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">Synchronizing Intelligence</p>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <header className="analytics-header">
                <div>
                    <h1 className="analytics-title">Analytics Nexus</h1>
                    <p className="text-slate-500 text-sm font-medium">Real-time platform intelligence & AI consumption</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowAnonymous(!showAnonymous)} 
                        className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 text-sm font-bold ${showAnonymous ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-slate-800 border-white/5 text-slate-400'}`}
                    >
                        {showAnonymous ? <Users size={16} /> : <Globe size={16} />}
                        {showAnonymous ? 'Showing Anonymous' : 'Identified Users Only'}
                    </button>
                    <button onClick={fetchAnalytics} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl border border-white/5 transition-all flex items-center gap-2 text-sm font-semibold">
                        <RefreshCcw size={16} /> Refresh
                    </button>
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-500 text-xs font-black uppercase tracking-tighter">Live Systems</span>
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                <StatCard label="Total Sessions" value={stats.totalSessions} icon={<Activity size={20} />} trend="+12%" up />
                <StatCard label="Unique Users" value={stats.activeUsers} icon={<Users size={20} />} trend="+5%" up />
                <StatCard label="AI Consumption" value={stats.totalTokens.toLocaleString()} suffix=" TKNS" icon={<Binary size={20} />} />
                <StatCard label="Burn Rate" value={`$${stats.totalCost.toFixed(4)}`} icon={<DollarSign size={20} />} trend="-2%" down />
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="chart-title"><Cpu size={18} className="text-blue-500" /> AI Consumption Trend</h3>
                    <div className="h-[300px] w-100">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeries}>
                                <defs>
                                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3 className="chart-title"><PieChartIcon size={18} className="text-purple-500" /> Model Proportions</h3>
                    <div className="h-[300px] w-100 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={modelUsage}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {modelUsage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 justify-center">
                        {modelUsage.map((m, i) => (
                            <div key={m.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{m.name.split('-')[0]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="activity-table-wrap">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Users size={16} className="text-blue-500" /> Recent User Sessions
                        </h3>
                    </div>
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Time Spent</th>
                                <th>Funnel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((act) => (
                                <tr key={act.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                                {act.user_name?.[0] || '?'}
                                            </div>
                                            <span className="font-bold text-white">{act.user_name || 'Anonymous'}</span>
                                        </div>
                                    </td>
                                    <td className="text-xs">{act.user_email || 'n/a'}</td>
                                    <td>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Clock size={12} className="text-slate-500" />
                                            {Math.round(act.total_time_spent_sec / 60)}m
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`tag ${act.max_funnel_stage === 'Finalize' ? 'tag-green' : 'tag-blue'}`}>
                                            {act.max_funnel_stage || 'Exploration'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="activity-table-wrap">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Terminal size={16} className="text-purple-500" /> AI Execution Logs
                        </h3>
                    </div>
                    <table className="activity-table">
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Model</th>
                                <th>User</th>
                                <th>Tokens</th>
                                <th>Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aiLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="font-bold text-white text-xs">{log.feature_name}</td>
                                    <td>
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500">
                                            <ShieldCheck size={12} className="text-emerald-500" />
                                            {log.model_name.split('-')[0]}
                                        </div>
                                    </td>
                                    <td className="text-xs text-slate-400">
                                        {log.user_email || 'Anonymous'}
                                    </td>
                                    <td className="text-xs font-mono">{log.total_tokens}</td>
                                    <td>
                                        <span className="text-emerald-400 font-bold text-xs">
                                            ${log.estimated_cost_usd?.toFixed(4)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, trend, up, down, suffix = '' }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tight ${up ? 'text-emerald-500' : 'text-red-500'}`}>
                        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">
                {value}
                {suffix && <span className="text-xs text-slate-500 ml-1 uppercase">{suffix}</span>}
            </div>
        </motion.div>
    )
}
