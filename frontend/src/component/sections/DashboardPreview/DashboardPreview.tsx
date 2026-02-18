import React, { useState, useEffect } from 'react';
import { Container } from '../../layout/Container';
import { Card } from '../../Card';
import { Search, TrendingUp, Sparkles, MessageSquare, BookOpen, BarChart3, Plus, Play } from 'lucide-react';
import { useAuth } from '../../../hooks';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardPreview: React.FC = () => {
    const { analyzeTrends, isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [trendsData, setTrendsData] = useState<any>(null);
    const [activeDefaultTopic,] = useState('AI and Tech');

    const handleSearch = async (topic: string = searchQuery) => {
        if (!topic.trim() && !activeDefaultTopic) return;

        const searchTopic = topic.trim() || activeDefaultTopic;
        setLoading(true);
        try {
            const result = await analyzeTrends(searchTopic);
            if (result.success) {
                setTrendsData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch trends:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load initial data if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            handleSearch('AI and Tech');
        }
    }, [isAuthenticated]);

    return (
        <section id="dashboard" className="py-24 bg-white overflow-hidden">
            <Container>
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-primary-purple/10 text-primary-purple text-sm font-semibold rounded-full mb-4">
                        Dashboard  Preview
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-charcoal mb-6">
                        Your command center for
                        <br />
                        <span className="gradient-text">intelligent insights</span>
                    </h2>
                    <p className="text-lg text-neutral-dark-gray">
                        Experience the powers of real-time AI analysis. Search any topic to see
                        how Insight-Sphere patterns the future of content and learning.
                    </p>
                </div>

                {/* Dashboard Container */}
                <div className="relative">
                    {/* Background Glow Effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary-blue/20 via-primary-purple/20 to-accent-pink/20 rounded-3xl blur-3xl opacity-50" />

                    {/* Dashboard Frame */}
                    <Card
                        variant="elevated"
                        padding="none"
                        className="relative z-10 overflow-hidden border border-neutral-gray/50 shadow-2xl"
                    >
                        {/* Browser-like Header */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-light-gray border-b border-neutral-gray">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="px-4 py-1 bg-white rounded-md text-xs font-mono text-neutral-dark-gray border border-neutral-gray/30">
                                    app.insight-sphere.ai/dashboard
                                </div>
                            </div>
                            <div className="w-16" /> {/* Spacer */}
                        </div>

                        {/* DASHBOARD CONTENT */}
                        <div className="min-h-[600px] bg-gradient-to-br from-neutral-light-gray/30 to-white p-6 md:p-8">
                            <div className="grid grid-cols-12 gap-6 h-full">

                                {/* Sidebar Wrapper */}
                                <div className="hidden lg:block lg:col-span-2">
                                    <div className="glass rounded-xl p-4 h-full border border-white/40">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-bold text-neutral-charcoal text-sm">Insight</span>
                                        </div>
                                        <nav className="space-y-1">
                                            {[
                                                { label: 'Trends', icon: TrendingUp },
                                                { label: 'Sentiments', icon: MessageSquare },
                                                { label: 'Skills', icon: BookOpen },
                                                { label: 'Analytics', icon: BarChart3 },
                                            ].map((item, i) => (
                                                <div
                                                    key={item.label}
                                                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${i === 0 ? 'bg-primary-blue/10 text-primary-blue' : 'text-neutral-dark-gray hover:bg-neutral-gray/40'}`}
                                                >
                                                    <item.icon className="w-4 h-4" />
                                                    {item.label}
                                                </div>
                                            ))}
                                        </nav>
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className="col-span-12 lg:col-span-10 space-y-6">

                                    {/* Sub-Header with Search */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-neutral-charcoal">
                                                {loading ? 'Analyzing...' : trendsData ? `Results for "${trendsData.topic}"` : 'AI Dashboard'}
                                            </h3>
                                            <p className="text-xs text-neutral-dark-gray">
                                                {isAuthenticated ? 'Real-time data enabled' : 'Preview Mode — Sign in for full access'}
                                            </p>
                                        </div>

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                handleSearch();
                                            }}
                                            className="relative"
                                        >
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-dark-gray" />
                                            <input
                                                type="text"
                                                placeholder="Ask about any trend..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 pr-24 py-2 w-full md:w-80 rounded-xl border border-neutral-gray bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                                            />
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-neutral-charcoal text-white text-[10px] font-bold rounded-lg hover:bg-neutral-dark-gray transition-colors disabled:opacity-50"
                                            >
                                                {loading ? '...' : 'ANALYZZE'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Trends Found', value: trendsData?.videos?.length || '2,847', change: '+12%', icon: TrendingUp, color: 'text-primary-blue' },
                                            { label: 'Sentiment', value: '78%', change: '+5%', icon: MessageSquare, color: 'text-primary-purple' },
                                            { label: 'Skill Paths', value: '124', change: '+8%', icon: BookOpen, color: 'text-accent-pink' },
                                            { label: 'AI Cycles', value: '15.2K', change: '+23%', icon: Sparkles, color: 'text-yellow-500' },
                                        ].map((stat) => (
                                            <div key={stat.label} className="glass rounded-xl p-4 border border-white/50 shadow-sm relative overflow-hidden group">
                                                <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
                                                    <stat.icon size={48} />
                                                </div>
                                                <p className="text-neutral-dark-gray text-[10px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-neutral-charcoal leading-none mb-1">{stat.value}</p>
                                                <span className="text-[10px] text-green-500 font-bold bg-green-50 px-1.5 py-0.5 rounded-md self-start">{stat.change}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Dynamic Content Area */}
                                        <div className="md:col-span-2 space-y-6">
                                            {/* Summary Card */}
                                            <AnimatePresence mode="wait">
                                                {loading ? (
                                                    <motion.div
                                                        key="loading"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="glass rounded-2xl p-6 border border-white/60 min-h-[220px] flex flex-col justify-center gap-4"
                                                    >
                                                        <div className="h-6 bg-neutral-gray/20 rounded-md w-3/4 animate-pulse" />
                                                        <div className="space-y-2">
                                                            <div className="h-3 bg-neutral-gray/20 rounded-md w-full animate-pulse" />
                                                            <div className="h-3 bg-neutral-gray/20 rounded-md w-5/6 animate-pulse" />
                                                            <div className="h-3 bg-neutral-gray/20 rounded-md w-4/6 animate-pulse" />
                                                        </div>
                                                        <div className="h-10 bg-neutral-gray/20 rounded-xl w-32 animate-pulse" />
                                                    </motion.div>
                                                ) : trendsData ? (
                                                    <motion.div
                                                        key="content"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="bg-primary-blue/5 rounded-2xl p-6 border border-primary-blue/20 shadow-sm flex flex-col md:flex-row gap-6"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="px-2 py-0.5 bg-primary-blue text-white text-[10px] font-bold rounded-full">AI SUMMARY</span>
                                                                <span className="text-xs text-neutral-dark-gray font-medium">{trendsData.topic}</span>
                                                            </div>
                                                            <h4 className="text-base font-bold text-neutral-charcoal mb-4 leading-snug">
                                                                {trendsData.summary.substring(0, 100)}...
                                                            </h4>
                                                            <p className="text-sm text-neutral-dark-gray leading-relaxed mb-6 opacity-80">
                                                                {trendsData.summary}
                                                            </p>
                                                            <button className="flex items-center gap-2 text-xs font-bold text-primary-blue group hover:gap-3 transition-all">
                                                                GENERATE STRATEGY <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {trendsData.videos?.[0] && (
                                                            <div className="w-full md:w-60 flex-shrink-0 group cursor-pointer">
                                                                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/50 shadow-lg">
                                                                    <img
                                                                        src={trendsData.videos[0].thumbnail}
                                                                        alt="featured"
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
                                                                            <Play className="w-5 h-5 text-white fill-white" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <p className="text-[10px] font-bold text-neutral-charcoal mt-2 line-clamp-1 group-hover:text-primary-blue transition-colors uppercase tracking-tight">
                                                                    {trendsData.videos[0].title}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ) : (
                                                    <div className="glass rounded-2xl p-8 border border-white/60 flex flex-col items-center justify-center text-center">
                                                        <div className="w-16 h-16 rounded-full bg-neutral-gray/20 flex items-center justify-center mb-4">
                                                            <Search className="w-8 h-8 text-neutral-dark-gray opacity-40" />
                                                        </div>
                                                        <h4 className="font-bold text-neutral-charcoal mb-2">Ready for Discovery</h4>
                                                        <p className="text-sm text-neutral-dark-gray max-w-xs mx-auto mb-6">
                                                            Enter a topic above to see how our AI agents analyze trends and create connections.
                                                        </p>
                                                        <div className="flex gap-2">
                                                            {['Tech', 'Design', 'Marketing'].map(t => (
                                                                <button
                                                                    key={t}
                                                                    onClick={() => { setSearchQuery(t); handleSearch(t); }}
                                                                    className="px-3 py-1.5 rounded-lg border border-neutral-gray text-[10px] font-bold hover:bg-neutral-charcoal hover:text-white transition-all uppercase tracking-wider"
                                                                >
                                                                    {t}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </AnimatePresence>

                                            {/* Recent Analysis Feed */}
                                            <div className="glass rounded-xl p-6 border border-white/60">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="font-bold text-neutral-charcoal text-sm flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-primary-purple" />
                                                        Agent Live Stream
                                                    </h4>
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
                                                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> LIVE
                                                    </span>
                                                </div>
                                                <div className="space-y-4">
                                                    {[
                                                        { agent: 'TrendAgent', action: `Analyzing ${searchQuery || 'global'} market gaps`, time: 'Just now', color: 'bg-primary-blue' },
                                                        { agent: 'OpinionBot', action: 'Calculating sentiment volatility index', time: '2m ago', color: 'bg-primary-purple' },
                                                        { agent: 'SkillEngine', action: 'Mapping knowledge graph nodes', time: '5m ago', color: 'bg-accent-pink' },
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-xl border border-white/30 hover:bg-white/50 transition-colors cursor-pointer group">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform`}>
                                                                    <Sparkles size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-neutral-charcoal leading-none mb-1">{item.agent}</p>
                                                                    <p className="text-[10px] text-neutral-dark-gray">{item.action}</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-neutral-gray uppercase">{item.time}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column / Side Widgets */}
                                        <div className="space-y-6">
                                            {/* Top Clusters Card */}
                                            <div className="glass rounded-xl p-5 border border-white/60 bg-gradient-to-br from-white/40 to-white/10 h-full">
                                                <h4 className="font-bold text-neutral-charcoal text-sm mb-4 uppercase tracking-widest flex items-center justify-between">
                                                    Topic Clusters
                                                    <BarChart3 className="w-4 h-4 text-neutral-dark-gray opacity-40" />
                                                </h4>
                                                <div className="space-y-3">
                                                    {trendsData?.clusters ? (
                                                        Object.entries(trendsData.clusters).slice(0, 4).map(([key, val]: [string, any], i) => (
                                                            <motion.div
                                                                initial={{ x: 20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: i * 0.1 }}
                                                                key={key}
                                                                className="p-3 rounded-lg bg-white/60 border border-white shadow-sm cursor-pointer hover:border-primary-blue transition-colors group"
                                                            >
                                                                <p className="text-[9px] font-black text-primary-purple uppercase mb-1">{key}</p>
                                                                <p className="text-[11px] font-medium text-neutral-charcoal line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100">{val}</p>
                                                            </motion.div>
                                                        ))
                                                    ) : (
                                                        [1, 2, 3, 4].map(i => (
                                                            <div key={i} className="h-16 rounded-lg bg-neutral-gray/10 animate-pulse border border-white" />
                                                        ))
                                                    )}
                                                </div>
                                                <button className="w-full mt-6 py-2 rounded-xl bg-neutral-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary-blue transition-all">
                                                    Explore Map
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </Card>
                </div>
            </Container>
        </section>
    );
};

export default DashboardPreview;
