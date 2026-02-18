import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    PieChart,
    History,
    Plus,
    Sparkles,

    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Eye,
    Zap,
    Split,
    Layout,
    ChevronRight,
    Calendar,
    Filter,
    RefreshCw,
    PlayCircle
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';
import type { ContentPerformance, ABTest, WeeklyReport, ROIAnalysis } from '../../context/AuthContext';

// ============ SUB-COMPONENTS ============

const StatCard = ({ label, value, subValue, icon: Icon, trend, color }: any) => {
    const colorClasses: any = {
        green: 'bg-green-500/10 text-green-400',
        cyan: 'bg-cyan-500/10 text-cyan-400',
        yellow: 'bg-yellow-500/10 text-yellow-400',
        purple: 'bg-purple-500/10 text-purple-400',
    };

    return (
        <div className="bg-teal-900/40 backdrop-blur-lg rounded-3xl p-6 border border-cyan-400/10 hover:border-cyan-400/30 transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color] || 'bg-white/10 text-white'} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="text-sm text-cyan-300/60 font-medium mb-1">{label}</div>
            <div className="text-2xl font-black text-white">{value}</div>
            {subValue && <div className="text-[10px] text-cyan-500/40 mt-2 uppercase tracking-tighter">{subValue}</div>}
        </div>
    );
};

const ABTestCard = ({ test, onSelect }: { test: ABTest, onSelect: (t: ABTest) => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => onSelect(test)}
        className="bg-teal-900/40 backdrop-blur-md rounded-2xl p-5 border border-purple-400/10 hover:border-purple-400/30 transition-all cursor-pointer group"
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <Split className="w-4 h-4" />
                </div>
                <h4 className="text-white font-bold text-sm truncate max-w-[150px]">{test.test_name}</h4>
            </div>
            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${test.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                {test.status}
            </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 text-center">
                <div className="text-[10px] text-cyan-300/40 uppercase mb-1">Variant A</div>
                <div className="text-sm font-bold text-white">{test.content_a?.views?.toLocaleString() || 0}</div>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex-1 text-center">
                <div className="text-[10px] text-cyan-300/40 uppercase mb-1">Variant B</div>
                <div className="text-sm font-bold text-white">{test.content_b?.views?.toLocaleString() || 0}</div>
            </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 text-[10px]">
            <span className="text-cyan-300/40">Variable: <span className="text-cyan-300">{test.test_variable}</span></span>
            <ChevronRight className="w-4 h-4 text-cyan-300/40 group-hover:translate-x-1 transition-transform" />
        </div>
    </motion.div>
);

// ============ MAIN PAGE ============

export const AnalyticsPage = () => {
    const {
        getROI,
        getWeeklyReport,
        listABTests,
        getContentPerformanceHistory,

    } = useAuth();

    const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
    const [roiAnalysis, setRoiAnalysis] = useState<ROIAnalysis | null>(null);
    const [abTests, setAbTests] = useState<ABTest[]>([]);
    const [history, setHistory] = useState<ContentPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'roi' | 'ab-tests' | 'history'>('overview');

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const [report, roi, tests, contentHistory] = await Promise.all([
            getWeeklyReport(),
            getROI(),
            listABTests(),
            getContentPerformanceHistory(10)
        ]);

        if (report.success) setWeeklyReport(report.data!);
        if (roi.success) setRoiAnalysis(roi.data!);
        if (tests.success) setAbTests(tests.data!.ab_tests);
        if (contentHistory.success) setHistory(contentHistory.data!);

        setIsLoading(false);
    }, [getWeeklyReport, getROI, listABTests, getContentPerformanceHistory]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950 font-sans text-cyan-50">
            <AnimatedBackground />
            <Sidebar activeTab="analytics" />

            <div className="ml-20 p-8 relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-4">
                            <BarChart3 className="w-10 h-10 text-cyan-400" />
                            ROI Sentinel
                        </h1>
                        <p className="text-cyan-300/60 mt-2 font-medium tracking-wide italic">Track performance, measure ROI, and optimize growth.</p>
                    </motion.div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10 transition-all"
                        >
                            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-400/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Track Performance
                        </button>
                    </div>
                </header>

                {/* Main Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        label="Est. Revenue"
                        value={`$${weeklyReport?.this_week?.revenue?.toLocaleString() || '0'}`}
                        trend={weeklyReport?.growth?.revenue}
                        icon={DollarSign}
                        color="green"
                    />
                    <StatCard
                        label="Total Views"
                        value={weeklyReport?.this_week?.views?.toLocaleString() || '0'}
                        trend={weeklyReport?.growth?.views}
                        icon={Eye}
                        color="cyan"
                    />
                    <StatCard
                        label="AI Performance Lift"
                        value={`${roiAnalysis?.roi_with_ai || '1.0'}x`}
                        subValue="Based on suggestion ROI"
                        icon={Zap}
                        color="yellow"
                    />
                    <StatCard
                        label="Growth Score"
                        value={`${roiAnalysis?.growth_percentage || '0'}%`}
                        subValue="MoM Growth Rate"
                        icon={TrendingUp}
                        color="purple"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/5 pb-1 mb-10 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Performance Hub', icon: Layout },
                        { id: 'roi', label: 'ROI Attribution', icon: PieChart },
                        { id: 'ab-tests', label: 'A/B Laboratory', icon: Split },
                        { id: 'history', label: 'Raw History', icon: History },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-cyan-400' : 'text-cyan-300/40 hover:text-cyan-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div layoutId="tab-underline-analytics" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-12 gap-8"
                        >
                            {/* AI Insights Card */}
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                <div className="bg-gradient-to-br from-indigo-900/40 to-cyan-900/40 p-8 rounded-[2rem] border border-cyan-400/20 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-4 right-4 animate-pulse">
                                        <Sparkles className="w-8 h-8 text-cyan-400 opacity-40" />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        Performance Insights
                                    </h3>

                                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/5 min-h-[150px]">
                                        {weeklyReport?.ai_insights ? (
                                            <p className="text-cyan-100/90 leading-relaxed whitespace-pre-line text-sm">
                                                {weeklyReport.ai_insights}
                                            </p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full opacity-40 py-10">
                                                <Calendar className="w-12 h-12 mb-4" />
                                                <p>Analyzing this week's data points...</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Top Performing List */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-3 px-2">
                                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                                        High Impact Content
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {weeklyReport?.top_performing_content?.map((video,) => (
                                            <div key={video.id} className="bg-teal-900/20 hover:bg-teal-900/40 transition-all rounded-3xl p-5 border border-white/5 flex gap-4 group">
                                                <div className="w-16 h-16 rounded-2xl bg-teal-800 flex-shrink-0 flex items-center justify-center text-cyan-400">
                                                    <PlayCircle className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-bold text-sm truncate">{video.title}</h4>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center gap-1 text-[10px] text-cyan-300/40">
                                                            <Eye className="w-3 h-3" />
                                                            {(video.views ?? 0).toLocaleString()}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-green-400/60 font-black">
                                                            <DollarSign className="w-3 h-3" />
                                                            ${(video.estimated_revenue ?? 0).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Overview */}
                            <div className="col-span-12 lg:col-span-4 space-y-6">
                                <div className="bg-teal-900/40 p-6 rounded-3xl border border-white/5">
                                    <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-cyan-400" />
                                        Activity Mix
                                    </h3>
                                    <div className="space-y-4">
                                        {roiAnalysis?.suggestion_performance?.map((sp, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-cyan-300/40">
                                                    <span>{sp.suggestion_type}</span>
                                                    <span>{sp.content_count} videos</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(sp.revenue_generated / (roiAnalysis.total_estimated_revenue || 1)) * 100}%` }}
                                                        className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-indigo-900/20 p-6 rounded-3xl border border-indigo-400/10 text-center">
                                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ArrowUpRight className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-white font-bold mb-1">Weekly Goal</h4>
                                    <p className="text-cyan-300/40 text-[10px] uppercase tracking-widest mb-4">85% content completion</p>
                                    <div className="text-2xl font-black text-indigo-400">12/15</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'roi' && (
                        <motion.div
                            key="roi"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {roiAnalysis?.suggestion_performance?.map((sp, i) => (
                                    <div key={i} className="bg-teal-900/40 border border-white/10 p-6 rounded-3xl group hover:border-cyan-400/40 transition-all">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="text-xs font-black uppercase tracking-widest text-cyan-400/60">{sp.suggestion_type} Suggestion</div>
                                            <div className="p-2 rounded-xl bg-cyan-400/10 text-cyan-400">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <div className="text-sm text-cyan-300/40">Revenue Lift</div>
                                                <div className="text-xl font-black text-white">${(sp.revenue_generated ?? 0).toLocaleString()}</div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-sm text-cyan-300/40">Avg Engagement</div>
                                                <div className="text-xl font-black text-green-400">{(sp.avg_engagement * 100).toFixed(1)}%</div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <div className="text-sm text-cyan-300/40">Avg Views</div>
                                                <div className="text-xl font-black text-white">{Math.floor(sp.avg_views / 1000)}k</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ab-tests' && (
                        <motion.div
                            key="ab-tests"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">Active Variations</h3>
                                <button className="text-cyan-400 text-sm font-bold flex items-center gap-2 hover:underline">
                                    <Sparkles className="w-4 h-4" />
                                    AI Suggested Tests
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {abTests.length > 0 ? abTests.map(test => (
                                    <ABTestCard key={test.id} test={test} onSelect={() => { }} />
                                )) : (
                                    <div className="col-span-full py-20 text-center bg-teal-900/10 rounded-3xl border border-dashed border-white/10 text-cyan-300/20">
                                        <Split className="w-12 h-12 mx-auto mb-4" />
                                        <p>No A/B tests found. Start one to scientificly optimize your content.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="overflow-hidden bg-teal-900/20 rounded-3xl border border-white/5"
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-cyan-300/40 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4">Content Title</th>
                                        <th className="px-6 py-4">Platform</th>
                                        <th className="px-6 py-4 text-right">Views</th>
                                        <th className="px-6 py-4 text-right">Revenue</th>
                                        <th className="px-6 py-4 text-right">Engagement</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-cyan-100/80">
                                    {history.map(item => (
                                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-white truncate max-w-[200px]">{item.title}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-white/5 px-2 py-1 rounded text-[10px] uppercase font-bold">{item.platform}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">{(item.views ?? 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right text-green-400 font-bold">${(item.estimated_revenue ?? 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-mono">{(item.engagement_rate * 100).toFixed(1)}%</td>
                                            <td className="px-6 py-4">
                                                {item.used_platform_suggestion && (
                                                    <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-black uppercase italic">
                                                        <Zap className="w-3 h-3 fill-yellow-400" /> AI Guided
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AnalyticsPage;
