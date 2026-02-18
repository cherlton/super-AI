import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    History,
    Zap,
    Video,
    Hash,
    MessageSquare,
    Image as ImageIcon,
    Layout,
    ArrowRight,
    Trash2,
    RefreshCw,
    X,
    CheckCircle,
    Copy,
    Play,
    Scissors,
    Music,
    AlertCircle
} from 'lucide-react';
import { useAuth, type ContentScript } from '../../context/AuthContext';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';
import { useNavigate } from 'react-router-dom';

export const StrategyNavigatorPage = () => {
    const navigate = useNavigate();
    const {
        isAuthenticated,
        generateContent,
        getContentHistory,
        getContentById,
        deleteContent,
    } = useAuth();

    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState('tiktok');
    const [duration, setDuration] = useState(60);
    const [style, setStyle] = useState('engaging');
    const [niche, setNiche] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [currentPackage, setCurrentPackage] = useState<any>(null);
    const [activeSection, setActiveSection] = useState<'hooks' | 'script' | 'social' | 'strategy'>('hooks');
    const [history, setHistory] = useState<ContentScript[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [showHistory, setShowHistory] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchHistory();
    }, [isAuthenticated, navigate]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        const result = await getContentHistory(10, 0);
        if (result.success && result.data) {
            setHistory(result.data);
        }
        setLoadingHistory(false);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) return;

        setIsGenerating(true);
        setCurrentPackage(null);

        const result = await generateContent({ topic, platform, duration, style, niche });

        setIsGenerating(false);
        if (result.success && result.data) {
            setCurrentPackage(result.data.content_package);
            setActiveSection('hooks');
            fetchHistory();
            showNotification('success', 'Content strategy generated successfully!');
        } else {
            showNotification('error', result.error || 'Generation failed. Please check your API connection.');
        }
    };

    const handleLoadPackage = async (id: number) => {
        const result = await getContentById(id);
        if (result.success && result.data) {
            const data = result.data;
            setCurrentPackage({
                hooks: data.hooks,
                script: data.full_script,
                captions: data.captions,
                hashtags: data.hashtags,
                thumbnails: data.thumbnail_titles
            });
            setTopic(data.topic);
            setPlatform(data.platform);
            setActiveSection('hooks');
            setShowHistory(false);
        }
    };

    const handleDeletePackage = async (id: number) => {
        if (!window.confirm('Delete this strategy?')) return;
        const result = await deleteContent(id);
        if (result.success) {
            setHistory(history.filter(h => h.id !== id));
            showNotification('success', 'Strategy deleted.');
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showNotification('success', 'Copied to clipboard!');
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen relative overflow-hidden">
            <AnimatedBackground />
            <Sidebar activeTab="trends" />

            <div className={`ml-20 relative z-10 pt-24 pb-20 px-8 transition-all duration-500 ${showHistory ? 'blur-sm grayscale opacity-30 select-none' : ''}`}>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter flex items-center gap-4">
                                <span className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl shadow-xl shadow-cyan-500/20">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </span>
                                STRATEGY NAVIGATOR
                            </h1>
                            <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Powered by LLaMA 3.1 & Insight Engine</p>
                        </motion.div>

                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowHistory(true)}
                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <History className="w-5 h-5" />
                                HISTORY
                            </motion.button>
                        </div>
                    </div>

                    {/* Notification Toast */}
                    <AnimatePresence>
                        {notification && (
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -50, opacity: 0 }}
                                className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${notification.type === 'success'
                                        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
                                        : 'bg-rose-500/20 border-rose-400/30 text-rose-400'
                                    }`}
                            >
                                {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                <span className="font-bold">{notification.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Generation Panel */}
                        <div className="lg:col-span-4 space-y-8">
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleGenerate}
                                className="bg-teal-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 space-y-8"
                            >
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] ml-1">Video Topic or Theme</label>
                                    <div className="relative">
                                        <textarea
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g., Why AI won't replace developers, but developers who use AI will replace those who don't..."
                                            className="w-full bg-teal-950/50 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-400/50 transition-all font-medium min-h-[120px] shadow-inner"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] ml-1 text-center block">Target Platform</label>
                                        <div className="flex bg-teal-950/50 rounded-2xl p-1 border border-white/5">
                                            {['tiktok', 'youtube'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setPlatform(p)}
                                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${platform === p ? 'bg-cyan-500 text-teal-950 shadow-lg' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] ml-1 text-center block">Duration</label>
                                        <select
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value))}
                                            className="w-full bg-teal-950/50 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs font-black appearance-none focus:outline-none focus:border-cyan-400/50"
                                        >
                                            <option value={30}>30 SEC</option>
                                            <option value={60}>60 SEC</option>
                                            <option value={90}>90 SEC</option>
                                            <option value={180}>3 MIN</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] ml-1">Specific Niche (Optional)</label>
                                    <input
                                        type="text"
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                        placeholder="e.g. SaaS Founders, Fitness Coaches..."
                                        className="w-full bg-teal-950/50 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-400/50"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] ml-1">Content Style</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Engaging', 'Educational', 'Storytelling', 'Controversial'].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setStyle(s.toLowerCase())}
                                                className={`py-3 rounded-xl text-xs font-bold transition-all border ${style === s.toLowerCase() ? 'bg-white/10 border-cyan-400 text-cyan-400' : 'bg-teal-950/30 border-white/5 text-white/30 hover:border-white/20'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isGenerating}
                                    type="submit"
                                    className="w-full py-5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-cyan-500/30 flex items-center justify-center gap-3"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="w-6 h-6 animate-spin" />
                                            GENERATING...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-6 h-6" />
                                            IGNITE STRATEGY
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>

                            {/* Tips Card */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-cyan-400/5 border border-cyan-400/20 rounded-3xl p-6"
                            >
                                <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-widest mb-3">
                                    <Zap className="w-4 h-4" />
                                    Optimization Tip
                                </div>
                                <p className="text-sm text-cyan-100/60 font-medium italic">
                                    "For TikTok, make sure your hook addresses a specific 'I want' or 'I fear' within the first 1.5 seconds..."
                                </p>
                            </motion.div>
                        </div>

                        {/* Result Display */}
                        <div className="lg:col-span-8">
                            {isGenerating ? (
                                <div className="h-full min-h-[600px] flex flex-col items-center justify-center space-y-8 bg-teal-900/20 border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <div className="relative">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            className="w-40 h-40 rounded-full border-t-2 border-r-2 border-cyan-400/30 flex items-center justify-center"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-12 h-12 text-cyan-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-white mb-2">Engaging Neural Engine...</h3>
                                        <p className="text-cyan-400/40 font-mono text-xs uppercase tracking-widest">Constructing viral hooks & structural pacing</p>
                                    </div>
                                </div>
                            ) : currentPackage ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[3rem] p-10 h-full min-h-[700px] flex flex-col shadow-2xl shadow-black/40"
                                >
                                    {/* Navigation Tabs */}
                                    <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
                                        <TabButton active={activeSection === 'hooks'} icon={Scissors} label="Hooks" onClick={() => setActiveSection('hooks')} />
                                        <TabButton active={activeSection === 'script'} icon={Video} label="Script" onClick={() => setActiveSection('script')} />
                                        <TabButton active={activeSection === 'social'} icon={MessageSquare} label="Social Post" onClick={() => setActiveSection('social')} />
                                        <TabButton active={activeSection === 'strategy'} icon={Hash} label="Strategy" onClick={() => setActiveSection('strategy')} />
                                    </div>

                                    {/* Content View */}
                                    <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-cyan-400/20 scrollbar-track-transparent">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeSection}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {activeSection === 'hooks' && (
                                                    <div className="space-y-6">
                                                        <h4 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
                                                            <div className="p-2 bg-rose-500/20 rounded-xl"><Scissors className="w-6 h-6 text-rose-400" /></div>
                                                            5 PSYCHOLOGICAL HOOKS
                                                        </h4>
                                                        {currentPackage.hooks.hooks.map((hook: any, i: number) => (
                                                            <div key={i} className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.08] hover:border-cyan-400/30">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <span className="px-3 py-1 bg-cyan-400/10 text-cyan-400 text-[10px] font-black uppercase rounded-lg border border-cyan-400/20">{hook.type}</span>
                                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => copyToClipboard(hook.text)} className="p-2 text-white/40 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xl font-bold text-white leading-relaxed mb-4">"{hook.text}"</p>
                                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                                    <span className="text-xs text-white/40 font-medium">Trigger: <span className="text-white">{hook.emotion}</span></span>
                                                                    <span className="text-xs text-emerald-400 font-bold">+{hook.estimated_retention_boost} Booster</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {activeSection === 'script' && (
                                                    <div className="space-y-10">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <h4 className="text-2xl font-black text-white flex items-center gap-3">
                                                                <div className="p-2 bg-blue-500/20 rounded-xl"><Video className="w-6 h-6 text-blue-400" /></div>
                                                                MASTER SCRIPT
                                                            </h4>
                                                            <span className="px-4 py-1 bg-white/5 rounded-full text-xs font-bold text-white/60 border border-white/10 uppercase tracking-tighter">
                                                                {currentPackage.script.title}
                                                            </span>
                                                        </div>

                                                        {currentPackage.script.segments.map((seg: any, i: number) => (
                                                            <div key={i} className="relative pl-10 border-l-2 border-cyan-400/20 pb-10 last:pb-0">
                                                                <div className="absolute left-[-11px] top-0 w-5 h-5 bg-teal-900 border-2 border-cyan-400 rounded-full flex items-center justify-center text-[10px] font-black text-cyan-400">
                                                                    {seg.start_time}
                                                                </div>
                                                                <div className="bg-teal-950/30 rounded-3xl p-8 border border-white/5 group hover:border-cyan-400/30 transition-all">
                                                                    <div className="flex items-center justify-between mb-6">
                                                                        <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">{seg.name} ({seg.start_time}-{seg.end_time}s)</span>
                                                                        <Play className="w-4 h-4 text-white/10 group-hover:text-cyan-400 transition-colors" />
                                                                    </div>
                                                                    <p className="text-lg font-medium text-white italic leading-relaxed mb-8 opacity-90">"{seg.script}"</p>
                                                                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                                                        <div className="space-y-2">
                                                                            <span className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                                                                <Layout className="w-3 h-3" /> Visuals
                                                                            </span>
                                                                            <p className="text-xs text-cyan-300/60 leading-relaxed font-medium">{seg.visual_cues}</p>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <span className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                                                                                <Music className="w-3 h-3" /> Delivery
                                                                            </span>
                                                                            <p className="text-xs text-purple-300/60 leading-relaxed font-medium">{seg.delivery_notes}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {activeSection === 'social' && (
                                                    <div className="space-y-8">
                                                        <h4 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
                                                            <div className="p-2 bg-purple-500/20 rounded-xl"><MessageSquare className="w-6 h-6 text-purple-400" /></div>
                                                            OPTIMIZED CAPTIONS
                                                        </h4>
                                                        {(currentPackage.captions[platform] || currentPackage.captions.tiktok).captions.map((cap: any, i: number) => (
                                                            <div key={i} className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.08]">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Option {i + 1}</span>
                                                                    <button onClick={() => copyToClipboard(cap.text)} className="p-2 text-white/40 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                                                                </div>
                                                                <p className="text-lg text-white font-medium mb-4">{cap.text}</p>
                                                                <div className="flex gap-4">
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white/5 rounded text-white/40">{cap.character_count} chars</span>
                                                                    {cap.includes_cta && <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded uppercase">CTA Included</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="bg-purple-400/10 border border-purple-400/20 rounded-2xl p-6 mt-10">
                                                            <h5 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2">Platform Pro-Tip</h5>
                                                            <p className="text-sm text-purple-100/60 font-medium">{(currentPackage.captions[platform] || currentPackage.captions.tiktok).best_posting_tip}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {activeSection === 'strategy' && (
                                                    <div className="space-y-12">
                                                        <div className="grid md:grid-cols-2 gap-8">
                                                            <div className="space-y-6">
                                                                <h4 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
                                                                    <div className="p-2 bg-emerald-500/20 rounded-xl"><Hash className="w-6 h-6 text-emerald-400" /></div>
                                                                    HASHTAG STACK
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {currentPackage.hashtags.categories.high_volume.map((tag: string, i: number) => (
                                                                        <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-cyan-400">#{tag.replace('#', '')}</span>
                                                                    ))}
                                                                    {currentPackage.hashtags.categories.medium_volume.map((tag: string, i: number) => (
                                                                        <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white/60">#{tag.replace('#', '')}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-6">
                                                                <h4 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
                                                                    <div className="p-2 bg-amber-500/20 rounded-xl"><ImageIcon className="w-6 h-6 text-amber-400" /></div>
                                                                    HIGH-CTR TITLES
                                                                </h4>
                                                                <div className="space-y-4">
                                                                    {currentPackage.thumbnails.titles.map((title: any, i: number) => (
                                                                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                                                            <div className="text-xs font-black text-amber-400/40 uppercase mb-2">Suggest #{i + 1}</div>
                                                                            <p className="text-lg font-black text-white mb-2 leading-tight">"{title.text}"</p>
                                                                            <p className="text-[10px] text-white/30 italic">Visual: {title.suggested_visual}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>

                                    {/* Footer / Summary */}
                                    <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex -space-x-3">
                                                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-teal-800 border-2 border-teal-950 flex items-center justify-center text-[10px] font-black text-cyan-400">AI</div>)}
                                            </div>
                                            <p className="text-sm font-bold text-white/40 tracking-tighter uppercase mb-0">Strategy generated in ~420ms <span className="text-cyan-400 ml-2">EST. TIME SAVED: 4-6 HOURS</span></p>
                                        </div>
                                        <motion.button
                                            whileHover={{ x: 5 }}
                                            onClick={() => window.print()}
                                            className="px-6 py-2 bg-white/10 rounded-xl text-xs font-black text-white flex items-center gap-2 border border-white/10"
                                        >
                                            EXPORT STRATEGY <ArrowRight className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[600px] flex flex-col items-center justify-center space-y-8 bg-teal-900/20 border-2 border-dashed border-white/5 rounded-[3rem] px-20">
                                    <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 to-blue-500/10 flex items-center justify-center border border-cyan-400/20 text-cyan-400">
                                        <Sparkles className="w-16 h-16" />
                                    </div>
                                    <div className="text-center group">
                                        <h3 className="text-3xl font-black text-white mb-4 transition-all group-hover:text-cyan-400">Ready to go Viral?</h3>
                                        <p className="text-cyan-400/40 font-medium max-w-sm mx-auto leading-relaxed">
                                            Describe your topic on the left and our LLaMA 3.1 engine will construct a complete high-retention strategy in seconds.
                                        </p>
                                    </div>
                                    <motion.div
                                        animate={{ y: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]"
                                    >
                                        Waiting for input...
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* History Sidebar Overlay */}
            <AnimatePresence>
                {showHistory && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistory(false)}
                            className="fixed inset-0 z-[100] bg-teal-950/80 backdrop-blur-sm shadow-[0_0_100px_rgba(0,0,0,0.5)] cursor-col-resize"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[110] bg-teal-900 border-l border-white/10 shadow-2xl overflow-hidden shadow-cyan-500/10"
                        >
                            <div className="p-10 h-full flex flex-col">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                        <History className="w-6 h-6 text-cyan-400" />
                                        STRATEGY ARCHIVE
                                    </h2>
                                    <button onClick={() => setShowHistory(false)} className="p-2 text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-cyan-400/20 scrollbar-track-transparent">
                                    {loadingHistory ? (
                                        <div className="flex flex-col items-center justify-center py-20 opacity-20">
                                            <RefreshCw className="w-12 h-12 animate-spin text-cyan-400" />
                                            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-cyan-400">Loading Database...</p>
                                        </div>
                                    ) : history.length > 0 ? (
                                        <div className="space-y-4 pb-20">
                                            {history.map((item) => (
                                                <div key={item.id} className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/[0.08] hover:border-cyan-400/30">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{item.platform} ({item.duration}s)</span>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeletePackage(item.id); }}
                                                                className="p-1.5 text-white/20 hover:text-rose-500"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white mb-4 line-clamp-1 leading-tight group-hover:text-cyan-400 transition-colors">{item.topic}</h3>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-tighter">{new Date(item.created_at).toLocaleDateString()}</span>
                                                        <button
                                                            onClick={() => handleLoadPackage(item.id)}
                                                            className="flex items-center gap-2 text-xs font-black text-cyan-400 hover:text-white transition-colors uppercase tracking-widest"
                                                        >
                                                            VIEW <ArrowRight className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 opacity-30">
                                            <History className="w-12 h-12 mx-auto mb-4" />
                                            <p className="font-bold">No generated strategies yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const TabButton = ({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all whitespace-nowrap border-2 font-black text-xs uppercase tracking-widest ${active
                ? 'bg-cyan-500 text-teal-950 border-cyan-400 shadow-xl shadow-cyan-500/20'
                : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/10'
            }`}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-teal-900' : 'text-cyan-400/40'}`} />
        {label}
    </button>
);
