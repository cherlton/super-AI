import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Search, Plus, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import type { RecentActivity } from '../../context/AuthContext';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';

interface DashboardStats {
    activeTrends: number;
    sentimentAnalyzed: number;
    learningPaths: number;
    opportunities: number;
    trendsChange: string;
    sentimentChange: string;
    pathsChange: string;
    opportunitiesChange: string;
}


interface StatCardProps {
    title: string;
    value: string | number;
    change: string;
    delay: number;
    isLoading?: boolean;
}

const StatCard = ({ title, value, change, delay, isLoading }: StatCardProps) => {
    const isPositive = change.startsWith('+') && change !== '+0%';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4, ease: "easeOut" }}
            whileHover={{
                y: -4,
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
            }}
            className="bg-teal-900/50 backdrop-blur-xl rounded-xl p-5 border border-cyan-400/20 relative overflow-hidden"
        >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <div className="relative z-10">
                {/* Title */}
                <div className="text-xs font-medium text-cyan-300/70 uppercase tracking-wider mb-3">
                    {title}
                </div>

                {/* Value and Change Row */}
                <div className="flex items-end justify-between">
                    {isLoading ? (
                        <div className="h-9 w-20 bg-teal-800/60 rounded animate-pulse" />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.15 }}
                            className="text-3xl font-semibold text-white tracking-tight"
                        >
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </motion.div>
                    )}

                    {/* Change indicator */}
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.25 }}
                        className={`text-xs font-medium px-2 py-1 rounded-md ${isPositive
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-cyan-300/60 bg-cyan-500/5'
                            }`}
                    >
                        {change}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const SkeletonSummary = () => (
    <div className="lg:col-span-2 bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
            <div className="h-6 bg-teal-800/60 rounded animate-pulse w-3/4" />
            <div className="space-y-2">
                <div className="h-4 bg-teal-800/60 rounded animate-pulse w-full" />
                <div className="h-4 bg-teal-800/60 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-teal-800/60 rounded animate-pulse w-4/6" />
            </div>
            <div className="h-6 bg-teal-800/60 rounded-full animate-pulse w-24" />
        </div>
        <div className="w-full md:w-72 h-44 bg-teal-800/60 rounded-xl animate-pulse flex-shrink-0" />
    </div>
);

const SkeletonClusters = () => (
    <div className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 space-y-4">
        <div className="h-6 bg-teal-800/60 rounded animate-pulse w-1/2" />
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-xl border border-white/10 animate-pulse" />
            ))}
        </div>
    </div>
);

const SkeletonCard = () => (
    <div className="group cursor-pointer">
        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-teal-900/40 border border-cyan-400/20">
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                animate={{
                    x: ['-100%', '100%'],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
        <div className="flex gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-teal-800/60 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-teal-800/60 rounded animate-pulse w-full" />
                <div className="h-3 bg-teal-800/60 rounded animate-pulse w-2/3" />
            </div>
        </div>
    </div>
);

const TrendCard = ({ videoId, title, thumbnail, url, delay }: {
    videoId: string;
    title: string;
    thumbnail: string;
    url: string;
    delay: number;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="group cursor-pointer relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => window.open(url, '_blank')}
        >
            {/* Thumbnail/Preview Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-teal-900/40 border border-cyan-400/20 shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300">
                {/* Skeleton during initial load */}
                {!isLoaded && (
                    <div className="absolute inset-0 bg-teal-900/40 animate-pulse flex items-center justify-center">
                        <motion.div
                            className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    </div>
                )}

                {/* Static Thumbnail */}
                <img
                    src={thumbnail}
                    alt={title}
                    onLoad={() => setIsLoaded(true)}
                    className={`w-full h-full object-cover transition-all duration-500 scale-100 group-hover:scale-105 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                />

                {/* Video Preview (Iframe) */}
                {isHovered && (
                    <div className="absolute inset-0 pointer-events-none">
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}`}
                            className="w-full h-full object-cover"
                            allow="autoplay; encrypted-media"
                            title={title}
                        />
                    </div>
                )}

                <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white z-10">
                    LIVE PREVIEW
                </div>
            </div>

            {/* Info */}
            <div className="flex gap-3 px-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold border border-white/10 shadow-lg">
                    AI
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors mb-1">
                        {title}
                    </h3>
                    <div className="flex flex-col text-xs text-cyan-300 opacity-70">
                        <span>Insight Sphere AI</span>
                        <span>Check out the latest trends</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, analyzeTrends, getDashboardStats, getRecentActivities } = useAuth();
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [trendsData, setTrendsData] = useState<any>(null);
    const [loadingTrends, setLoadingTrends] = useState(false);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [featuredVideoIndex, setFeaturedVideoIndex] = useState(0);

    // Reset featured video index when trends data changes
    useEffect(() => {
        setFeaturedVideoIndex(0);
    }, [trendsData]);

    const fetchTrends = async (topic: string = 'AI and Tech') => {
        setLoadingTrends(true);
        const result = await analyzeTrends(topic);
        if (result.success) {
            setTrendsData(result.data);
        } else {
            console.error('Failed to fetch trends:', result.error);
        }
        setLoadingTrends(false);
    };

    const fetchStats = async () => {
        setLoadingStats(true);
        const result = await getDashboardStats();
        if (result.success && result.data) {
            setStats(result.data);
        }
        setLoadingStats(false);
    };

    const fetchRecentActivities = async () => {
        const result = await getRecentActivities(5);
        if (result.success && result.data) {
            setRecentActivities(result.data);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTrends();
            fetchStats();
            fetchRecentActivities();
        }
    }, [isAuthenticated]);

    // Protection logic: Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // If not authenticated, return null while redirecting
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Content */}
            <div className="ml-20 relative z-10 pt-24">
                {/* Header */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.3 }}
                    className="bg-teal-900/30 backdrop-blur-xl border-b border-cyan-400/30 px-8 py-4"
                >
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <motion.h1
                                className="text-2xl font-bold text-white flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Sparkles className="w-6 h-6 text-cyan-400" />
                                The Insight-Sphere
                            </motion.h1>
                            <p className="text-sm text-cyan-300 mt-1">
                                AI-Powered Content & Skill Intelligence Platform
                            </p>
                        </motion.div>

                        <motion.div
                            className="flex items-center gap-4"
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    fetchTrends(searchQuery);
                                }}
                                className="relative group"
                            >
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                                <input
                                    type="text"
                                    placeholder="Search trends, topics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-80 rounded-xl border border-cyan-400/30 bg-teal-900/40 backdrop-blur-xl text-white placeholder-cyan-400/50 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 transition-all"
                                />
                            </form>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(34, 211, 238, 0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fetchTrends(searchQuery)}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/40"
                            >
                                <Plus className="w-5 h-5" />
                                New Analysis
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Dashboard Content */}
                <div className="px-8 py-8 max-w-7xl mx-auto">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                        <StatCard
                            title="Active Trends"
                            value={stats?.activeTrends ?? 0}
                            change={stats?.trendsChange ?? '+0%'}
                            delay={0.1}
                            isLoading={loadingStats}
                        />
                        <StatCard
                            title="Sentiment Analyzed"
                            value={stats?.sentimentAnalyzed ?? 0}
                            change={stats?.sentimentChange ?? '+0%'}
                            delay={0.15}
                            isLoading={loadingStats}
                        />
                        <StatCard
                            title="Learning Paths"
                            value={stats?.learningPaths ?? 0}
                            change={stats?.pathsChange ?? '+0%'}
                            delay={0.2}
                            isLoading={loadingStats}
                        />
                        <StatCard
                            title="Opportunities"
                            value={stats?.opportunities ?? 0}
                            change={stats?.opportunitiesChange ?? '+0%'}
                            delay={0.25}
                            isLoading={loadingStats}
                        />
                    </div>

                    {/* Trending Opportunities */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">🔥</span>
                                Trending Opportunities
                            </h2>
                            <motion.button
                                whileHover={{ x: 5 }}
                                className="text-sm text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
                            >
                                View all →
                            </motion.button>
                        </div>

                        {/* Trend Insights Section */}
                        {loadingTrends ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                                <SkeletonSummary />
                                <SkeletonClusters />
                            </div>
                        ) : trendsData && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="lg:col-span-2 bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20 flex flex-col md:flex-row gap-6"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-cyan-400" />
                                            Trend Summary: {trendsData.topic}
                                        </h3>
                                        <div className="text-sm text-cyan-300/80 mb-4">
                                            Identified trends across {trendsData.videos?.length || 0} videos for '{trendsData.topic}'.
                                        </div>
                                        <p className="text-cyan-100 leading-relaxed opacity-90 mb-6">
                                            {trendsData.summary}
                                        </p>
                                        <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-400/10 px-3 py-1.5 rounded-full border border-cyan-400/20">
                                            <TrendingUp className="w-3 h-3" />
                                            TOP INSIGHT
                                        </div>
                                    </div>

                                    {/* Featured Video with Navigation */}
                                    {trendsData.videos && trendsData.videos.length > 0 && (
                                        <div className="w-full md:w-80 flex-shrink-0">
                                            {/* Header with Navigation */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest opacity-70">
                                                    Featured Insight #{featuredVideoIndex + 1}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setFeaturedVideoIndex(prev =>
                                                            prev === 0 ? trendsData.videos.length - 1 : prev - 1
                                                        )}
                                                        className="w-7 h-7 rounded-md bg-teal-800/60 hover:bg-teal-700/70 border border-cyan-400/20 flex items-center justify-center text-cyan-300 transition-colors"
                                                        aria-label="Previous video"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setFeaturedVideoIndex(prev =>
                                                            prev === trendsData.videos.length - 1 ? 0 : prev + 1
                                                        )}
                                                        className="w-7 h-7 rounded-md bg-teal-800/60 hover:bg-teal-700/70 border border-cyan-400/20 flex items-center justify-center text-cyan-300 transition-colors"
                                                        aria-label="Next video"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Video Card with Animation */}
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={featuredVideoIndex}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.25 }}
                                                >
                                                    <TrendCard
                                                        videoId={trendsData.videos[featuredVideoIndex].id}
                                                        title={trendsData.videos[featuredVideoIndex].title}
                                                        thumbnail={trendsData.videos[featuredVideoIndex].thumbnail}
                                                        url={trendsData.videos[featuredVideoIndex].url}
                                                        delay={0}
                                                    />
                                                </motion.div>
                                            </AnimatePresence>

                                            {/* Video Counter */}
                                            <div className="flex items-center justify-center gap-1.5 mt-3">
                                                {trendsData.videos.slice(0, Math.min(trendsData.videos.length, 8)).map((_: any, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setFeaturedVideoIndex(idx)}
                                                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === featuredVideoIndex
                                                            ? 'bg-cyan-400 w-4'
                                                            : 'bg-cyan-400/30 hover:bg-cyan-400/50'
                                                            }`}
                                                        aria-label={`Go to video ${idx + 1}`}
                                                    />
                                                ))}
                                                {trendsData.videos.length > 8 && (
                                                    <span className="text-[10px] text-cyan-400/60 ml-1">
                                                        +{trendsData.videos.length - 8}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
                                >
                                    <h3 className="text-lg font-bold text-white mb-4">Top Clusters</h3>
                                    <div className="space-y-3">
                                        {Object.entries(trendsData.clusters || {}).map(([key, value]: [string, any]) => (
                                            <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
                                                <div className="text-cyan-400 font-bold mb-1 uppercase tracking-wider text-[10px]">
                                                    {key.replace('_', ' ')}
                                                </div>
                                                <div className="text-white opacity-80">{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Category Chips Bar */}
                        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
                            {['All', 'Technology', 'AI Research', 'Content Creation', 'Digital Marketing', 'Future Tech', 'Productivity'].map((cat) => (
                                <motion.button
                                    key={cat}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSearchQuery(cat);
                                        fetchTrends(cat);
                                    }}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${searchQuery === cat || (cat === 'All' && !searchQuery)
                                        ? 'bg-cyan-400 text-teal-950 border-cyan-400 shadow-lg shadow-cyan-500/30'
                                        : 'bg-teal-900/40 text-cyan-300 border-cyan-400/20 hover:border-cyan-400/40'
                                        }`}
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>

                        {/* Video Grid Container with Scroll */}
                        <div className="relative">
                            <div
                                className="max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-400/30 scrollbar-track-transparent"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'rgba(34, 211, 238, 0.3) transparent'
                                }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-4">
                                    {loadingTrends ? (
                                        [1, 2, 3, 4].map((i) => (
                                            <SkeletonCard key={i} />
                                        ))
                                    ) : trendsData?.videos?.length > 1 ? (
                                        trendsData.videos.slice(1).map((video: any, index: number) => (
                                            <TrendCard
                                                key={video.id + index}
                                                videoId={video.id}
                                                title={video.title}
                                                thumbnail={video.thumbnail}
                                                url={video.url}
                                                delay={0.1 + index * 0.03}
                                            />
                                        ))
                                    ) : trendsData?.videos?.length === 1 ? (
                                        null
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="col-span-full py-20 text-center"
                                        >
                                            <div className="text-4xl mb-4">🔍</div>
                                            <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                                            <p className="text-cyan-400 opacity-60">
                                                Try searching for a different topic like "Space Exploration" or "Healthy Recipes".
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom shadow fade to indicate more content */}
                            {trendsData?.videos?.length > 5 && (
                                <div
                                    className="absolute bottom-0 left-0 right-2 h-12 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(to top, rgba(13, 42, 45, 0.95) 0%, rgba(13, 42, 45, 0.7) 40%, transparent 100%)'
                                    }}
                                />
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-teal-900/40 backdrop-blur-xl rounded-xl border border-cyan-400/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-semibold text-white">
                                Recent Activity
                            </h2>
                            <span className="text-xs text-cyan-400/60 font-medium">
                                Last 24 hours
                            </span>
                        </div>
                        <div className="space-y-3">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((item, i) => (
                                    <motion.div
                                        key={item.id || i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 + i * 0.08 }}
                                        whileHover={{ x: 4, backgroundColor: 'rgba(20, 51, 54, 0.5)' }}
                                        className="flex items-center gap-4 py-3 px-4 rounded-lg bg-teal-800/20 cursor-pointer transition-colors border-l-2 border-transparent hover:border-cyan-400/50"
                                    >
                                        {/* Type Badge */}
                                        <div className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${item.type === 'trend'
                                            ? 'text-cyan-300 bg-cyan-500/15'
                                            : item.type === 'opinion'
                                                ? 'text-blue-300 bg-blue-500/15'
                                                : 'text-purple-300 bg-purple-500/15'
                                            }`}>
                                            {item.type}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-white text-sm truncate">
                                                {item.title}
                                            </div>
                                            <div className="text-xs text-cyan-300/70 truncate">
                                                {item.description}
                                            </div>
                                        </div>

                                        {/* Time */}
                                        <div className="text-xs text-cyan-400/50 whitespace-nowrap">
                                            {item.timeAgo}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-cyan-400/50 text-sm">
                                    No recent activity found.
                                </div>
                            )}
                        </div>

                        {/* View All Link */}
                        <motion.button
                            whileHover={{ x: 4 }}
                            className="mt-4 text-sm text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
                        >
                            View all activity →
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;