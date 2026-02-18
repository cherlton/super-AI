import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    TrendingUp,

    Plus,
    RefreshCw,
    Trash2,
    BarChart3,

    Youtube,
    Eye,
    ThumbsUp,

    Zap,
    Target,
    Sparkles,
    Filter,
    X,
    ExternalLink
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';
import type { Competitor, CompetitorVideo, ContentGaps, ViralAnalysis } from '../../context/AuthContext';

// ============ SUB-COMPONENTS ============

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) => (
    <div className="bg-teal-900/40 backdrop-blur-lg rounded-2xl p-4 border border-cyan-400/10 transition-all hover:border-cyan-400/30">
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                <Icon className={`w-4 h-4 text-${color}-400`} />
            </div>
            <span className="text-cyan-300/60 text-sm">{label}</span>
        </div>
        <div className="text-xl font-bold text-white">{value}</div>
    </div>
);

const ViralBadge = ({ score }: { score: number }) => {
    const getColor = () => {
        if (score >= 85) return 'from-orange-400 to-red-500';
        if (score >= 70) return 'from-yellow-400 to-orange-500';
        return 'from-blue-400 to-cyan-500';
    };

    return (
        <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${getColor()} flex items-center gap-1 shadow-lg shadow-black/20`}>
            <Zap className="w-3 h-3 text-white fill-white" />
            <span className="text-[10px] font-bold text-white">{score}</span>
        </div>
    );
};

const VideoCard = ({ video, onAnalyze }: { video: CompetitorVideo, onAnalyze: (v: CompetitorVideo) => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group relative bg-teal-900/40 backdrop-blur-md rounded-2xl overflow-hidden border border-cyan-400/10 hover:border-cyan-400/40 transition-all"
    >
        <div className="aspect-video relative overflow-hidden">
            <img
                src={video.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=400'}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-transparent to-transparent opacity-60" />

            {video.viral_score && (
                <div className="absolute top-2 right-2">
                    <ViralBadge score={video.viral_score} />
                </div>
            )}

            <div className="absolute bottom-2 left-2 flex gap-2">
                <div className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-white flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {Math.floor(video.views / 1000)}k
                </div>
            </div>
        </div>

        <div className="p-4">
            <h4 className="text-white font-medium text-sm line-clamp-2 mb-3 group-hover:text-cyan-400 transition-colors">
                {video.title}
            </h4>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-cyan-300/60">
                    <div className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {Math.floor(video.likes / 1000)}k
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {(video.engagement_rate * 100).toFixed(1)}%
                    </div>
                </div>

                <button
                    onClick={() => onAnalyze(video)}
                    className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400 hover:text-white transition-all shadow-lg shadow-cyan-400/10"
                >
                    <Sparkles className="w-4 h-4" />
                </button>
            </div>
        </div>
    </motion.div>
);

const AnalysisModal = ({ video, analysis, onClose }: { video: CompetitorVideo, analysis: ViralAnalysis | null, onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
        <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-teal-950/90 border border-cyan-400/20 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-400/5"
        >
            <div className="p-6 border-b border-cyan-400/10 flex items-center justify-between bg-gradient-to-r from-teal-900/50 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">AI Viral Analysis</h3>
                        <p className="text-cyan-400/60 text-sm truncate max-w-md">{video.title}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-cyan-400 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {!analysis ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                        <p className="text-cyan-300 animate-pulse">Groq LLM is dissecting the viral factors...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Hook & Structure */}
                        <div className="space-y-6">
                            <section>
                                <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                                    <Target className="w-4 h-4 text-orange-400" />
                                    The Hook Breakdown
                                </h4>
                                <div className="bg-teal-900/40 rounded-2xl p-4 text-cyan-100/80 text-sm leading-relaxed border border-cyan-400/5">
                                    {analysis.hook_breakdown}
                                </div>
                            </section>

                            <section>
                                <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                                    <BarChart3 className="w-4 h-4 text-purple-400" />
                                    Content Structure
                                </h4>
                                <div className="bg-teal-900/40 rounded-2xl p-4 text-cyan-100/80 text-sm leading-relaxed border border-cyan-400/5">
                                    {analysis.content_structure}
                                </div>
                            </section>
                        </div>

                        {/* Tactics & Adaptations */}
                        <div className="space-y-6">
                            <section>
                                <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    Viral Factors & Tactics
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.viral_factors.map((f: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-orange-400/10 text-orange-400 border border-orange-400/20 text-[10px] font-bold uppercase tracking-wider">
                                            {f}
                                        </span>
                                    ))}
                                    {analysis.engagement_tactics.map((t: string, i: number) => (
                                        <span key={i} className="px-3 py-1.5 rounded-lg bg-purple-400/10 text-purple-400 border border-purple-400/20 text-[10px] font-bold uppercase tracking-wider">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h4 className="flex items-center gap-2 text-white font-bold mb-3">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    Recommended Adaptations
                                </h4>
                                <ul className="space-y-3">
                                    {analysis.recommended_adaptations.map((a: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-cyan-100/80 text-sm">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                                            {a}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-cyan-400/10 bg-teal-900/20">
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-400/20 hover:scale-[1.02] transition-transform"
                >
                    Close Analysis
                </button>
            </div>
        </motion.div>
    </motion.div>
);

// ============ MAIN PAGE ============

export const CompetitorAnalysisPage = () => {
    const {
        addCompetitor,
        listCompetitors,
        getCompetitor,
        deleteCompetitor,
        syncCompetitor,
        getViralVideos,
        analyzeViralVideo,
        getContentGaps,
    } = useAuth();

    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
    const [videos, setVideos] = useState<CompetitorVideo[]>([]);
    const [contentGaps, setContentGaps] = useState<ContentGaps | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [channelUrl, setChannelUrl] = useState('');

    const [activeAnalysis, setActiveAnalysis] = useState<{ video: CompetitorVideo, analysis: ViralAnalysis | null } | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'viral' | 'gaps'>('overview');

    const loadCompetitors = useCallback(async () => {
        const result = await listCompetitors();
        if (result.success && result.data) {
            setCompetitors(result.data.competitors);
            if (result.data.competitors.length > 0 && !selectedCompetitor) {
                handleSelectCompetitor(result.data.competitors[0]);
            }
        }
    }, [listCompetitors]);

    useEffect(() => {
        loadCompetitors();
        loadContentGaps();
    }, [loadCompetitors]);

    const handleSelectCompetitor = async (comp: Competitor) => {
        setSelectedCompetitor(comp);
        setIsRefreshing(true);
        const [compResult, viralResult] = await Promise.all([
            getCompetitor(comp.id),
            getViralVideos(comp.id)
        ]);

        if (compResult.success) setSelectedCompetitor(compResult.data!);
        if (viralResult.success) setVideos(viralResult.data!.videos);
        setIsRefreshing(false);
    };

    const handleAddCompetitor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!channelUrl) return;
        setIsAdding(true);
        const result = await addCompetitor(channelUrl);
        if (result.success) {
            setChannelUrl('');
            loadCompetitors();
        }
        setIsAdding(false);
    };

    const handleSync = async () => {
        if (!selectedCompetitor) return;
        setIsRefreshing(true);
        const result = await syncCompetitor(selectedCompetitor.id);
        if (result.success) {
            handleSelectCompetitor(selectedCompetitor);
        }
        setIsRefreshing(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to stop tracking this competitor?')) return;
        const result = await deleteCompetitor(id);
        if (result.success) {
            setCompetitors(prev => prev.filter(c => c.id !== id));
            if (selectedCompetitor?.id === id) {
                setSelectedCompetitor(null);
                setVideos([]);
            }
        }
    };

    const handleAnalyzeVideo = async (video: CompetitorVideo) => {
        setActiveAnalysis({ video, analysis: null });
        const result = await analyzeViralVideo(video.competitor_id, video.id);
        if (result.success) {
            setActiveAnalysis({ video, analysis: result.data!.analysis });
        }
    };

    const loadContentGaps = async () => {
        const result = await getContentGaps();
        if (result.success) setContentGaps(result.data!);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 font-sans text-cyan-50">
            <AnimatedBackground />
            <Sidebar activeTab="trends" />

            <div className="ml-20 p-8 relative z-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-4">
                            <TrendingUp className="w-10 h-10 text-cyan-400" />
                            Competitor Pulse
                        </h1>
                        <p className="text-cyan-300/60 mt-2 font-medium tracking-wide">AI-Powered Benchmarking & Viral Analysis</p>
                    </motion.div>

                    <form onSubmit={handleAddCompetitor} className="flex gap-2">
                        <div className="relative group">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500 transition-transform group-focus-within:scale-110" />
                            <input
                                type="text"
                                value={channelUrl}
                                onChange={(e) => setChannelUrl(e.target.value)}
                                placeholder="Paste channel handle or URL..."
                                className="pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl w-80 focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-sm backdrop-blur-md"
                            />
                        </div>
                        <button
                            disabled={isAdding}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isAdding ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Track
                        </button>
                    </form>
                </header>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left Sidebar: Tracked Channels */}
                    <div className="col-span-12 lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400/60">Monitored Channels</h3>
                            <span className="text-[10px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-400/20">{competitors.length} Total</span>
                        </div>

                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {competitors.map((comp) => (
                                <motion.div
                                    key={comp.id}
                                    whileHover={{ x: 5 }}
                                    onClick={() => handleSelectCompetitor(comp)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedCompetitor?.id === comp.id
                                        ? 'bg-cyan-400/10 border-cyan-400/40 shadow-lg shadow-cyan-400/5'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-teal-800 border border-white/10">
                                            {comp.thumbnail_url && <img src={comp.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold text-sm truncate">{comp.channel_name}</h4>
                                            <p className="text-[10px] text-cyan-300/60 truncate">{comp.subscriber_count.toLocaleString()} subs</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(comp.id); }}
                                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400/40 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-9 space-y-8">
                        {selectedCompetitor ? (
                            <>
                                {/* Competitor Header & Stats */}
                                <div className="bg-teal-900/40 backdrop-blur-xl border border-cyan-400/10 rounded-3xl p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Youtube className="w-40 h-40" />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                        <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-cyan-400/40 shadow-xl shadow-cyan-400/10">
                                            <img src={selectedCompetitor.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-4 mb-2">
                                                <h2 className="text-3xl font-black text-white">{selectedCompetitor.channel_name}</h2>
                                                <a href={selectedCompetitor.channel_url} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-cyan-400 transition-colors">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                            <p className="text-cyan-300/70 text-sm line-clamp-2 max-w-2xl mb-6">
                                                {selectedCompetitor.channel_description || 'No description available for this channel.'}
                                            </p>

                                            <div className="flex flex-wrap gap-4">
                                                <StatCard icon={Users} label="Subscribers" value={selectedCompetitor.subscriber_count.toLocaleString()} color="cyan" />
                                                <StatCard icon={BarChart3} label="Avg Engagement" value="4.2%" color="purple" />
                                                <StatCard icon={Eye} label="Total Views" value={selectedCompetitor.total_views.toLocaleString()} color="blue" />
                                                <StatCard icon={Target} label="Niche" value={selectedCompetitor.niche || 'General'} color="orange" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 min-w-[200px]">
                                            <button
                                                onClick={handleSync}
                                                disabled={isRefreshing}
                                                className="w-full py-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all backdrop-blur-md"
                                            >
                                                <RefreshCw className={`w-5 h-5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                                                {isRefreshing ? 'Syncing...' : 'Sync Now'}
                                            </button>
                                            <p className="text-[10px] text-center text-cyan-300/40 uppercase tracking-tighter">
                                                Last synced: {selectedCompetitor.last_synced_at ? new Date(selectedCompetitor.last_synced_at).toLocaleString() : 'Never'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Navigation */}
                                <div className="flex gap-4 border-b border-white/5 pb-1">
                                    {[
                                        { id: 'overview', label: 'Recent Growth', icon: Activity },
                                        { id: 'viral', label: 'Viral Content Breakdown', icon: Zap },
                                        { id: 'gaps', label: 'Content Gap Analysis', icon: Target },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-cyan-400' : 'text-cyan-300/40 hover:text-cyan-300'
                                                }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <div className="mt-8">
                                    {activeTab === 'viral' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white">Viral Discovery</h3>
                                                    <p className="text-cyan-300/50 text-xs">High-performing videos from this channel ranked by Groq-score</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-cyan-300/40">Min Score:</span>
                                                    <Filter className="w-4 h-4 text-cyan-400" />
                                                </div>
                                            </div>

                                            {isRefreshing ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                                        <div key={i} className="aspect-video bg-white/5 animate-pulse rounded-2xl" />
                                                    ))}
                                                </div>
                                            ) : videos.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                    {videos.map(v => (
                                                        <VideoCard key={v.id} video={v} onAnalyze={handleAnalyzeVideo} />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-20 bg-teal-900/20 rounded-3xl border border-white/5 border-dashed">
                                                    <Zap className="w-12 h-12 text-cyan-400/20 mx-auto mb-4" />
                                                    <p className="text-cyan-300/40">No viral videos detected yet. Sync the channel to scan.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'gaps' && (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                                    <Target className="w-6 h-6 text-cyan-400" />
                                                    Market Opportunities
                                                </h3>

                                                {contentGaps?.gap_opportunities.map((gap, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="p-5 bg-teal-900/40 border-l-4 border-cyan-400 rounded-r-2xl border-y border-r border-white/5 flex items-center justify-between group hover:bg-teal-900/60 transition-all"
                                                    >
                                                        <span className="text-white font-medium">{gap}</span>
                                                        <Sparkles className="w-5 h-5 text-cyan-400 opacity-20 group-hover:opacity-100 transition-opacity" />
                                                    </motion.div>
                                                ))}

                                                {!contentGaps && (
                                                    <div className="p-8 text-center bg-teal-900/20 rounded-3xl border border-white/5 border-dashed">
                                                        <p className="text-cyan-300/40">Track at least 5 competitors for a full gap analysis.</p>
                                                    </div>
                                                )}
                                            </div>

                                            {contentGaps?.ai_analysis && (
                                                <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 p-8 rounded-3xl border border-cyan-400/20 shadow-xl relative overflow-hidden">
                                                    <div className="absolute top-4 right-4 animate-pulse">
                                                        <Sparkles className="w-8 h-8 text-cyan-400 opacity-40" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Strategic Recommendation</h4>

                                                    <div className="space-y-6">
                                                        <div>
                                                            <h5 className="text-[10px] font-black text-cyan-400 mb-2 uppercase tracking-widest">Competitive Advantage</h5>
                                                            <p className="text-cyan-100/90 text-sm leading-relaxed">{contentGaps.ai_analysis.competitive_advantage}</p>
                                                        </div>

                                                        <div>
                                                            <h5 className="text-[10px] font-black text-cyan-400 mb-3 uppercase tracking-widest">Growth Targets</h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                {contentGaps.ai_analysis.underserved_topics.map((t, i) => (
                                                                    <span key={i} className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium text-cyan-200">
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'overview' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-teal-900/40 p-6 rounded-3xl border border-white/5">
                                                <h3 className="text-lg font-bold text-white mb-6">Recent Videos</h3>
                                                <div className="space-y-4">
                                                    {selectedCompetitor.videos?.slice(0, 5).map(v => (
                                                        <div key={v.id} className="flex gap-4 p-2 rounded-xl hover:bg-white/5 transition-all">
                                                            <div className="w-24 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-teal-800">
                                                                <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xs font-bold text-white truncate">{v.title}</h4>
                                                                <div className="flex items-center gap-3 mt-1 text-[10px] text-cyan-300/40">
                                                                    <span>{Math.floor(v.views / 1000)}k views</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(v.published_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-teal-900/40 p-6 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center p-12">
                                                <BarChart3 className="w-16 h-16 text-cyan-400/20 mb-6" />
                                                <h3 className="text-xl font-bold text-white mb-2">Growth Analytics</h3>
                                                <p className="text-cyan-300/40 text-sm">Audience retention and subscription growth tracking coming in v2.4</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 bg-teal-900/10 rounded-[3rem] border-2 border-dashed border-white/5">
                                <Users className="w-20 h-20 text-cyan-400/10 mb-8" />
                                <h2 className="text-3xl font-black text-white/40">No Channel Selected</h2>
                                <p className="text-cyan-300/20 text-lg mt-2 max-w-sm">Select a competitor from the pulse list or add a new YouTube handle to start tracking.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {activeAnalysis && (
                    <AnalysisModal
                        video={activeAnalysis.video}
                        analysis={activeAnalysis.analysis}
                        onClose={() => setActiveAnalysis(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// Mock Icons/missing components
const Activity = (props: any) => <TrendingUp {...props} />;

export default CompetitorAnalysisPage;
