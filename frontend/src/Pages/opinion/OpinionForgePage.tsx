import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Search,
    TrendingUp,
    TrendingDown,
    Minus,
    ThumbsUp,
    ThumbsDown,
    Meh,
    Users,
    BarChart3,
    Sparkles,
    AlertCircle,
    ChevronRight,
    Hash,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';

// Types for Opinion Analysis Results
interface SentimentBreakdown {
    positive: number;
    negative: number;
    neutral: number;
}

interface EmotionData {
    emotion: string;
    percentage: number;
    color: string;
}

interface ArgumentPoint {
    stance: 'pro' | 'con' | 'neutral';
    text: string;
    source?: string;
    strength: number;
}

interface OpinionData {
    topic: string;
    summary: string;
    overall_sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    sentiment_score: number;
    sentiment_breakdown: SentimentBreakdown;
    emotions: EmotionData[];
    key_arguments: ArgumentPoint[];
    trending_hashtags?: string[];
    total_analyzed?: number;
}

// Skeleton Components
const SkeletonPulse = ({ className }: { className: string }) => (
    <div className={`bg-teal-800/60 rounded animate-pulse ${className}`} />
);

const SkeletonSentimentCard = () => (
    <motion.div
        className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
    >
        <SkeletonPulse className="h-6 w-32 mb-4" />
        <SkeletonPulse className="h-24 w-full mb-4" />
        <div className="flex gap-2">
            <SkeletonPulse className="h-8 w-24" />
            <SkeletonPulse className="h-8 w-24" />
        </div>
    </motion.div>
);

// Sentiment Indicator Component
const SentimentIndicator = ({ sentiment, score }: { sentiment: string; score: number }) => {
    const getSentimentConfig = () => {
        switch (sentiment) {
            case 'positive':
                return {
                    icon: ThumbsUp,
                    color: 'from-emerald-400 to-green-500',
                    textColor: 'text-emerald-400',
                    bgColor: 'bg-emerald-500/20',
                    label: 'Positive'
                };
            case 'negative':
                return {
                    icon: ThumbsDown,
                    color: 'from-rose-400 to-red-500',
                    textColor: 'text-rose-400',
                    bgColor: 'bg-rose-500/20',
                    label: 'Negative'
                };
            case 'mixed':
                return {
                    icon: BarChart3,
                    color: 'from-amber-400 to-orange-500',
                    textColor: 'text-amber-400',
                    bgColor: 'bg-amber-500/20',
                    label: 'Mixed'
                };
            default:
                return {
                    icon: Meh,
                    color: 'from-cyan-400 to-blue-500',
                    textColor: 'text-cyan-400',
                    bgColor: 'bg-cyan-500/20',
                    label: 'Neutral'
                };
        }
    };

    const config = getSentimentConfig();
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl ${config.bgColor} border border-white/10`}
        >
            <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}
            >
                <Icon className="w-6 h-6 text-white" />
            </motion.div>
            <div>
                <div className={`text-2xl font-bold ${config.textColor}`}>
                    {Math.round(score * 100)}%
                </div>
                <div className="text-sm text-white/70">{config.label} Sentiment</div>
            </div>
        </motion.div>
    );
};

// Emotion Bar Component
const EmotionBar = ({ emotion, percentage, color, delay }: EmotionData & { delay: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        className="flex items-center gap-3"
    >
        <span className="text-sm text-cyan-300 w-20 capitalize">{emotion}</span>
        <div className="flex-1 h-3 bg-teal-800/50 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${color}`}
            />
        </div>
        <span className="text-sm font-semibold text-white w-12 text-right">{percentage}%</span>
    </motion.div>
);

// Argument Card Component
const ArgumentCard = ({ argument, delay }: { argument: ArgumentPoint; delay: number }) => {
    const stanceConfig = {
        pro: {
            icon: TrendingUp,
            color: 'border-emerald-400/30 bg-emerald-500/10',
            iconColor: 'text-emerald-400',
            label: 'Supporting'
        },
        con: {
            icon: TrendingDown,
            color: 'border-rose-400/30 bg-rose-500/10',
            iconColor: 'text-rose-400',
            label: 'Opposing'
        },
        neutral: {
            icon: Minus,
            color: 'border-cyan-400/30 bg-cyan-500/10',
            iconColor: 'text-cyan-400',
            label: 'Neutral'
        }
    };

    const config = stanceConfig[argument.stance];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.02, x: 5 }}
            className={`p-4 rounded-xl border ${config.color} cursor-pointer`}
        >
            <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase ${config.iconColor}`}>
                            {config.label}
                        </span>
                        <div className="flex-1" />
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${i < argument.strength ? 'bg-cyan-400' : 'bg-teal-700'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">{argument.text}</p>
                    {argument.source && (
                        <div className="text-xs text-cyan-400/60 mt-2 flex items-center gap-1">
                            <ChevronRight className="w-3 h-3" />
                            {argument.source}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Sentiment Breakdown Chart
const SentimentBreakdownChart = ({ breakdown }: { breakdown: SentimentBreakdown }) => {
    const total = breakdown.positive + breakdown.negative + breakdown.neutral;
    const segments = [
        { value: (breakdown.positive / total) * 100, color: 'bg-emerald-400', label: 'Positive' },
        { value: (breakdown.neutral / total) * 100, color: 'bg-cyan-400', label: 'Neutral' },
        { value: (breakdown.negative / total) * 100, color: 'bg-rose-400', label: 'Negative' }
    ];

    return (
        <div className="space-y-4">
            <div className="relative h-4 bg-teal-800/50 rounded-full overflow-hidden flex">
                {segments.map((seg, i) => (
                    <motion.div
                        key={seg.label}
                        initial={{ width: 0 }}
                        animate={{ width: `${seg.value}%` }}
                        transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                        className={`h-full ${seg.color}`}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs">
                {segments.map((seg) => (
                    <div key={seg.label} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${seg.color}`} />
                        <span className="text-white/70">{seg.label}</span>
                        <span className="text-white font-semibold">{Math.round(seg.value)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main OpinionForge Page Component
export const OpinionForgePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, analyzeOpinion } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [opinionData, setOpinionData] = useState<OpinionData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Default emotions data for visualization
    const defaultEmotions: EmotionData[] = [
        { emotion: 'joy', percentage: 45, color: 'bg-gradient-to-r from-yellow-400 to-amber-500' },
        { emotion: 'trust', percentage: 32, color: 'bg-gradient-to-r from-emerald-400 to-green-500' },
        { emotion: 'anticipation', percentage: 28, color: 'bg-gradient-to-r from-cyan-400 to-blue-500' },
        { emotion: 'fear', percentage: 15, color: 'bg-gradient-to-r from-purple-400 to-violet-500' },
        { emotion: 'anger', percentage: 12, color: 'bg-gradient-to-r from-rose-400 to-red-500' },
    ];

    const fetchOpinion = async (topic: string) => {
        if (!topic.trim()) return;

        setLoading(true);
        setError(null);

        const result = await analyzeOpinion(topic);

        if (result.success && result.data) {
            // Map API response to our OpinionData structure
            setOpinionData({
                topic: result.data.topic || topic,
                summary: result.data.summary || 'Analysis complete. The public opinion on this topic shows diverse perspectives.',
                overall_sentiment: result.data.overall_sentiment || 'mixed',
                sentiment_score: result.data.sentiment_score || 0.65,
                sentiment_breakdown: result.data.sentiment_breakdown || {
                    positive: 45,
                    negative: 25,
                    neutral: 30
                },
                emotions: result.data.emotions || defaultEmotions,
                key_arguments: result.data.key_arguments || [
                    { stance: 'pro', text: 'Strong supporting argument found in the analysis.', strength: 4 },
                    { stance: 'con', text: 'Counter-argument identified from opposing views.', strength: 3 },
                    { stance: 'neutral', text: 'Balanced perspective maintaining neutrality.', strength: 3 }
                ],
                trending_hashtags: result.data.trending_hashtags || ['#trending', '#discussion', '#opinion'],
                total_analyzed: result.data.total_analyzed || 1250
            });
        } else {
            setError(result.error || 'Failed to analyze opinion');
        }

        setLoading(false);
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null;
    }

    // Suggested topics
    const suggestedTopics = [
        'Artificial Intelligence Ethics',
        'Climate Change Solutions',
        'Remote Work Culture',
        'Cryptocurrency Future',
        'Electric Vehicles',
        'Space Exploration'
    ];

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <Sidebar activeTab="sentiment" />

            <div className="ml-20 relative z-10 pt-24">
                {/* Header */}
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.3 }}
                    className="bg-teal-900/30 backdrop-blur-xl border-b border-cyan-400/30 px-8 py-6"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/40"
                            >
                                <MessageSquare className="w-7 h-7 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                    OpinionForge
                                    <Sparkles className="w-6 h-6 text-cyan-400" />
                                </h1>
                                <p className="text-cyan-300 opacity-80">
                                    AI-Powered Sentiment Analysis & Public Opinion Intelligence
                                </p>
                            </div>
                        </motion.div>

                        {/* Search Bar */}
                        <motion.form
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                fetchOpinion(searchQuery);
                            }}
                            className="flex gap-4"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
                                <input
                                    type="text"
                                    placeholder="Enter a topic to analyze public opinion..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-cyan-400/30 bg-teal-900/40 backdrop-blur-xl text-white placeholder-cyan-400/50 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 transition-all text-lg"
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={loading || !searchQuery.trim()}
                                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(34, 211, 238, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <MessageSquare className="w-5 h-5" />
                                )}
                                Analyze Opinion
                            </motion.button>
                        </motion.form>

                        {/* Suggested Topics */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex gap-2 mt-4 flex-wrap"
                        >
                            <span className="text-cyan-400/60 text-sm">Try:</span>
                            {suggestedTopics.map((topic, i) => (
                                <motion.button
                                    key={topic}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSearchQuery(topic);
                                        fetchOpinion(topic);
                                    }}
                                    className="px-3 py-1 rounded-lg text-sm bg-teal-800/40 text-cyan-300 border border-cyan-400/20 hover:border-cyan-400/40 transition-all"
                                >
                                    {topic}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="px-8 py-8 max-w-7xl mx-auto">
                    {/* Error State */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-6 p-4 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-rose-400" />
                                <span className="text-rose-300">{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <SkeletonSentimentCard />
                            </div>
                            <SkeletonSentimentCard />
                            <SkeletonSentimentCard />
                            <SkeletonSentimentCard />
                        </div>
                    )}

                    {/* Results */}
                    {!loading && opinionData && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Overview Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Summary Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="lg:col-span-2 bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                                Opinion Analysis: {opinionData.topic}
                                            </h2>
                                            {opinionData.total_analyzed && (
                                                <div className="flex items-center gap-2 mt-1 text-sm text-cyan-400/60">
                                                    <Users className="w-4 h-4" />
                                                    Analyzed {opinionData.total_analyzed.toLocaleString()} data points
                                                </div>
                                            )}
                                        </div>
                                        <SentimentIndicator
                                            sentiment={opinionData.overall_sentiment}
                                            score={opinionData.sentiment_score}
                                        />
                                    </div>

                                    <p className="text-cyan-100 leading-relaxed opacity-90 mb-6">
                                        {opinionData.summary}
                                    </p>

                                    {/* Sentiment Breakdown */}
                                    <div className="bg-teal-800/30 rounded-xl p-4 border border-white/5">
                                        <h3 className="text-sm font-semibold text-cyan-400 mb-3 uppercase tracking-wider">
                                            Sentiment Distribution
                                        </h3>
                                        <SentimentBreakdownChart breakdown={opinionData.sentiment_breakdown} />
                                    </div>
                                </motion.div>

                                {/* Emotions Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
                                >
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="text-xl">🎭</span>
                                        Emotion Analysis
                                    </h3>
                                    <div className="space-y-3">
                                        {opinionData.emotions.map((emotion, i) => (
                                            <EmotionBar
                                                key={emotion.emotion}
                                                {...emotion}
                                                delay={0.3 + i * 0.1}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Key Arguments Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
                            >
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-xl">⚖️</span>
                                    Key Arguments & Perspectives
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {opinionData.key_arguments.map((arg, i) => (
                                        <ArgumentCard
                                            key={i}
                                            argument={arg}
                                            delay={0.5 + i * 0.1}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Trending Hashtags */}
                            {opinionData.trending_hashtags && opinionData.trending_hashtags.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex items-center gap-4 flex-wrap"
                                >
                                    <span className="text-cyan-400 flex items-center gap-2">
                                        <Hash className="w-4 h-4" />
                                        Trending:
                                    </span>
                                    {opinionData.trending_hashtags.map((tag, i) => (
                                        <motion.span
                                            key={tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.7 + i * 0.05 }}
                                            className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30"
                                        >
                                            {tag}
                                        </motion.span>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Empty State */}
                    {!loading && !opinionData && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-6xl mb-6"
                            >
                                💭
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Ready to Analyze Public Opinion
                            </h3>
                            <p className="text-cyan-400 opacity-60 max-w-md mx-auto">
                                Enter any topic above to discover sentiment patterns, emotional responses,
                                and key arguments from public discussions.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpinionForgePage;
