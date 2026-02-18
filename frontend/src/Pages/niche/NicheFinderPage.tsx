import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    TrendingUp,
    Target,
    Compass,

    Zap,

    Trash2,
    Layers,
    Sparkles,
    DollarSign,

    ChevronRight,
    RefreshCw,
    History,
    AlertCircle,
    CheckCircle2,
    PieChart,

} from 'lucide-react';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';
import type { NicheAnalysis } from '../../context/AuthContext';

// ============ SUB-COMPONENTS ============

const ScoreCard = ({ label, score, icon: Icon, color }: any) => (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-white">{score}</span>
        </div>
        <div className="text-[10px] text-cyan-300/40 uppercase font-black tracking-widest">{label}</div>
        <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                className={`h-full bg-${color}-400 rounded-full`}
            />
        </div>
    </div>
);

const MicroNicheCard = ({ niche, onAnalyze }: any) => (
    <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-teal-900/20 hover:bg-teal-900/40 transition-all rounded-2xl p-6 border border-white/5 relative group cursor-pointer"
        onClick={() => onAnalyze(niche.name || niche)}
    >
        <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                <Compass className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
                <TrendingUp className="w-3 h-3" />
                {niche.potential || 'High Potential'}
            </div>
        </div>
        <h4 className="text-white font-bold mb-2">{niche.name || niche}</h4>
        <p className="text-cyan-300/40 text-xs line-clamp-2">{niche.reason || 'Unsaturated market with high growth demand prediction.'}</p>
        <div className="mt-4 flex items-center text-cyan-400 text-[10px] font-black uppercase tracking-widest group-hover:gap-2 transition-all">
            Analyze Now <ChevronRight className="w-3 h-3" />
        </div>
    </motion.div>
);

// ============ MAIN PAGE ============

export const NicheFinderPage = () => {
    const {
        analyzeNiche,
        exploreNiches,
        findMicroNiches,
        getNicheHistory,
        deleteNicheAnalysis
    } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [history, setHistory] = useState<NicheAnalysis[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [microNiches, setMicroNiches] = useState<any[]>([]);
    const [currentAnalysis, setCurrentAnalysis] = useState<NicheAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'search' | 'history' | 'explore'>('search');

    const loadInitialData = useCallback(async () => {
        const [histRes, trendRes] = await Promise.all([
            getNicheHistory(5),
            exploreNiches()
        ]);

        if (histRes.success) setHistory(histRes.data?.niches || []);
        if (trendRes.success) setTrending(trendRes.data || []);
    }, [getNicheHistory, exploreNiches]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleAnalyze = async (query: string = searchQuery) => {
        if (!query.trim()) return;
        setIsAnalyzing(true);
        setError(null);
        setCurrentAnalysis(null);

        try {
            const result = await analyzeNiche(query);
            if (result.success) {
                setCurrentAnalysis(result.data);
                loadInitialData(); // Refresh history
            } else {
                setError(result.error || 'Failed to analyze niche');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExploreMicro = async (parent: string) => {
        setIsAnalyzing(true);
        const res = await findMicroNiches(parent);
        if (res.success) {
            setMicroNiches(res.data);
            setActiveView('search'); // Switch to main view to show micro niches
        }
        setIsAnalyzing(false);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this analysis?')) return;
        const res = await deleteNicheAnalysis(id);
        if (res.success) {
            setHistory(prev => prev.filter(n => n.id !== id));
            if (currentAnalysis?.id === id) setCurrentAnalysis(null);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 text-cyan-50">
            <AnimatedBackground />
            <Sidebar activeTab="niche" />

            <div className="ml-20 p-8 relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-5xl font-black bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-4">
                            <Target className="w-12 h-12 text-cyan-400" />
                            Niche Radar
                        </h1>
                        <p className="text-cyan-300/60 mt-2 font-medium tracking-wide">AI-Powered Blue Ocean Detection & Market Saturation Analysis</p>
                    </motion.div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                        {[
                            { id: 'search', label: 'Scanner', icon: Search },
                            { id: 'explore', label: 'Explore', icon: Compass },
                            { id: 'history', label: 'History', icon: History },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveView(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeView === tab.id ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20' : 'text-cyan-300/40 hover:text-cyan-300'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="grid grid-cols-12 gap-8">
                    {/* LEFT COLUMN: Input & Results */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        {activeView === 'search' && (
                            <>
                                {/* Search Section */}
                                <div className="bg-teal-900/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-cyan-400/20 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Sparkles className="w-32 h-32 text-cyan-400" />
                                    </div>

                                    <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        Market Scan
                                    </h3>

                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 relative group">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/40 group-focus-within:text-cyan-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                                                placeholder="Enter a niche or topic (e.g. AI for Accountants)..."
                                                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white placeholder-cyan-900 focus:outline-none focus:border-cyan-400/50 transition-all text-lg font-medium"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleAnalyze()}
                                            disabled={isAnalyzing}
                                            className="px-8 py-5 bg-gradient-to-br from-cyan-400 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-cyan-400/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center gap-3"
                                        >
                                            {isAnalyzing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Layers className="w-6 h-6" />}
                                            {isAnalyzing ? 'Analyzing...' : 'Scan Market'}
                                        </button>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl text-sm border border-red-400/20">
                                            <AlertCircle className="w-5 h-5" />
                                            {error}
                                        </motion.div>
                                    )}
                                </div>

                                {/* Analysis Result */}
                                <AnimatePresence mode="wait">
                                    {currentAnalysis ? (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-8"
                                        >
                                            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-10 relative">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-green-400/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" /> Verified Market
                                                            </div>
                                                            <span className="text-cyan-300/40 text-[10px] font-black uppercase tracking-widest">{currentAnalysis.growth_trend}</span>
                                                        </div>
                                                        <h2 className="text-4xl font-black text-white">{currentAnalysis.niche_name}</h2>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-6 rounded-3xl text-center shadow-2xl shadow-cyan-400/30">
                                                        <div className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Opportunity Score</div>
                                                        <div className="text-5xl font-black text-white">{currentAnalysis.opportunity_score}</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                                    <ScoreCard label="Demand Score" score={currentAnalysis.demand_score} icon={TrendingUp} color="cyan" />
                                                    <ScoreCard label="Competition" score={currentAnalysis.competition_score} icon={Target} color="purple" />
                                                    <ScoreCard label="Monetization" score={Math.min(100, (currentAnalysis.estimated_monthly_earnings || 0) / 100)} icon={DollarSign} color="green" />
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <Zap className="w-4 h-4" /> Market Verdict
                                                            </h4>
                                                            <p className="text-cyan-100/80 leading-relaxed italic border-l-2 border-cyan-400/30 pl-4">{currentAnalysis.description}</p>
                                                        </div>

                                                        {currentAnalysis.keywords && (
                                                            <div>
                                                                <h4 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">Content Pillars</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {currentAnalysis.keywords.map((kw, i) => (
                                                                        <span key={i} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white hover:bg-white/10 transition-all cursor-default">{kw}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="bg-slate-900/60 rounded-3xl p-6 border border-white/5 space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-white uppercase">Financial Projection</span>
                                                            <PieChart className="w-4 h-4 text-green-400" />
                                                        </div>
                                                        <div className="flex items-end gap-2">
                                                            <span className="text-5xl font-black text-green-400">${currentAnalysis.estimated_monthly_earnings?.toLocaleString() || '0'}</span>
                                                            <span className="text-cyan-300/40 text-xs mb-2 truncate">Potential Monthly Earnings</span>
                                                        </div>
                                                        <div className="pt-6 border-t border-white/5 space-y-4">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-cyan-300/40">Market Size</span>
                                                                <span className="text-white font-bold">{currentAnalysis.audience_size || 'Analyzed'}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-cyan-300/40">Difficulty</span>
                                                                <span className="text-yellow-400 font-bold">Medium to High</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {microNiches.length > 0 && (
                                                <div className="space-y-6 pt-8">
                                                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                        <Compass className="w-6 h-6 text-cyan-400" />
                                                        Unsaturated Micro-Niches
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {microNiches.map((n, i) => (
                                                            <MicroNicheCard key={i} niche={n} onAnalyze={handleAnalyze} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : microNiches.length > 0 && (
                                        <div className="space-y-6 pt-8">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                    <Compass className="w-6 h-6 text-cyan-400" />
                                                    Discovered Micro-Niches
                                                </h3>
                                                <button onClick={() => setMicroNiches([])} className="text-[10px] font-black text-cyan-400/60 uppercase tracking-widest hover:text-cyan-400">Clear</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {microNiches.map((n, i) => (
                                                    <MicroNicheCard key={i} niche={n} onAnalyze={handleAnalyze} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}

                        {activeView === 'explore' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {trending.map((n, i) => (
                                    <div key={i} className="bg-teal-900/20 rounded-3xl p-8 border border-white/10 group hover:border-cyan-400/40 transition-all">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-all">
                                                <Compass className="w-6 h-6" />
                                            </div>
                                            <div className="text-[10px] font-black text-cyan-300/40 uppercase tracking-widest italic group-hover:text-cyan-400 transition-colors">Trending Now</div>
                                        </div>
                                        <h4 className="text-2xl font-black text-white mb-4">{n.name || n}</h4>
                                        <p className="text-cyan-100/60 text-sm mb-8">{n.description || 'High demand detected in the current market cycle with increasing search volume trends.'}</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleAnalyze(n.name || n)}
                                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center justify-center gap-2"
                                            >
                                                Scan <Layers className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleExploreMicro(n.name || n)}
                                                className="flex-1 py-3 bg-cyan-400 hover:bg-cyan-300 rounded-xl text-xs font-black uppercase tracking-widest text-slate-950 flex items-center justify-center gap-2"
                                            >
                                                Micro <Zap className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeView === 'history' && (
                            <div className="space-y-4">
                                {history.map((n, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all">
                                        <div className="flex items-center gap-6 cursor-pointer" onClick={() => { setCurrentAnalysis(n); setActiveView('search'); }}>
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-cyan-400">
                                                <History className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold">{n.niche_name}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-[10px] uppercase font-black tracking-widest text-cyan-300/40">
                                                    <span>{new Date(n.created_at).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                                                    <span className="text-cyan-400">Score: {n.opportunity_score}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(n.id)} className="p-3 text-red-400/40 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="py-20 text-center opacity-20 flex flex-col items-center">
                                        <Layers className="w-16 h-16 mb-4" />
                                        <p>No analysis history found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Real-time Trends */}
                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        {/* Summary Widget */}
                        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-[2rem] p-8 border border-cyan-400/20">
                            <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Sentiment Shift
                            </h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-white/40 uppercase font-black">AI Adoption</span>
                                    <div className="text-right">
                                        <div className="text-white font-black text-lg">+14.2%</div>
                                        <div className="text-[10px] text-green-400 font-bold">Surging Demand</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-white/40 uppercase font-black">Personal Finance</span>
                                    <div className="text-right">
                                        <div className="text-white font-black text-lg">-5.8%</div>
                                        <div className="text-[10px] text-red-400 font-bold">Market Saturation</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs text-white/40 uppercase font-black">Sustainable Tech</span>
                                    <div className="text-right">
                                        <div className="text-white font-black text-lg">+22.1%</div>
                                        <div className="text-[10px] text-green-400 font-bold">Emerging Opportunity</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                                <PieChart className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                                <h4 className="text-white font-bold text-sm mb-1">Portfolio Balance</h4>
                                <p className="text-[10px] text-white/40 leading-tight">Your current niches are 65% diversified compared to competitor benchmarks.</p>
                            </div>
                        </div>

                        {/* Recent Discoveries */}
                        <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10">
                            <h3 className="text-sm font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Recent High Scores
                            </h3>
                            <div className="space-y-4">
                                {history.filter(h => h.opportunity_score > 70).slice(0, 3).map((h, i) => (
                                    <div
                                        key={i}
                                        onClick={() => { setCurrentAnalysis(h); setActiveView('search'); }}
                                        className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-green-400/40 transition-all"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-white font-bold text-xs truncate">{h.niche_name}</div>
                                            <div className="text-[10px] text-cyan-300/40 font-black mt-1 uppercase italic">{h.growth_trend}</div>
                                        </div>
                                        <div className="text-green-400 font-black text-lg ml-4">{h.opportunity_score}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setActiveView('history')}
                                className="w-full mt-6 py-3 border border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-400/40 hover:text-cyan-400 hover:border-cyan-400/40 transition-all"
                            >
                                View full history
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NicheFinderPage;
