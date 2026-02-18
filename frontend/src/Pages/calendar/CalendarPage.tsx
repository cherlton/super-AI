import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    Plus,
    Sparkles,
    Download,
    ChevronLeft,
    ChevronRight,
    Clock,
    X,
    CalendarDays
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';
import type { CalendarEvent } from '../../context/AuthContext';

// Simple Calendar Grid Component (Inline for now to keep it cohesive)
const CalendarGrid = ({ year, month, events, onSelectDate }: any) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className="grid grid-cols-7 gap-px bg-cyan-400/20 rounded-xl overflow-hidden border border-cyan-400/20 shadow-2xl">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-teal-950/80 p-3 text-center text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-cyan-400/20">
                    {day}
                </div>
            ))}
            {blanks.map(i => (
                <div key={`blank-${i}`} className="bg-teal-950/30 min-h-[120px] p-2" />
            ))}
            {days.map(day => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter((e: CalendarEvent) => e.scheduled_time.startsWith(dateStr));
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                return (
                    <motion.div
                        key={day}
                        whileHover={{ backgroundColor: 'rgba(34, 211, 238, 0.05)' }}
                        onClick={() => onSelectDate(dateStr)}
                        className={`bg-teal-950/50 min-h-[120px] p-2 border-r border-b border-cyan-400/10 cursor-pointer transition-colors relative group ${isToday ? 'bg-cyan-400/5' : ''}`}
                    >
                        <div className={`text-sm font-medium mb-2 flex items-center justify-center w-7 h-7 rounded-full transition-colors ${isToday ? 'bg-cyan-400 text-teal-950' : 'text-cyan-300'}`}>
                            {day}
                        </div>
                        <div className="space-y-1">
                            {dayEvents.map((event: CalendarEvent) => (
                                <div
                                    key={event.id}
                                    className={`text-[10px] p-1.5 rounded-md border truncate shadow-sm flex items-center gap-1.5 ${event.status === 'Published'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : event.status === 'Archived'
                                            ? 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                                            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                        }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${event.status === 'Published' ? 'bg-emerald-400' : 'bg-cyan-400'
                                        }`} />
                                    {event.title}
                                </div>
                            ))}
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute bottom-2 right-2 p-1 bg-cyan-400/10 rounded-md text-cyan-400"
                        >
                            <Plus className="w-3 h-3" />
                        </motion.div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export const CalendarPage = () => {
    const {
        isAuthenticated,
        getCalendarEvents,
        getCalendarSuggestions,
        createCalendarEvent,
        exportCalendar
    } = useAuth();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [suggestions, setSuggestions] = useState<any>(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [newPostData, setNewPostData] = useState<{
        title: string;
        topic: string;
        platform: string;
        scheduled_time: string;
        status: 'Planned' | 'Published' | 'Archived';
    }>({
        title: '',
        topic: '',
        platform: 'TikTok',
        scheduled_time: '',
        status: 'Planned'
    });

    const fetchEvents = async () => {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1).toISOString();
        const endDate = new Date(year, month + 1, 0).toISOString();

        const result = await getCalendarEvents(startDate, endDate);
        if (result.success && result.data) {
            setEvents(result.data);
        }
        setLoading(false);
    };

    const fetchSuggestions = async () => {
        setLoadingSuggestions(true);
        const result = await getCalendarSuggestions();
        if (result.success && result.data) {
            setSuggestions(result.data);
        }
        setLoadingSuggestions(false);
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchEvents();
            fetchSuggestions();
        }
    }, [isAuthenticated, currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createCalendarEvent({
            ...newPostData,
            scheduled_time: `${selectedDate}T12:00:00` // Default time
        });
        if (result.success) {
            setIsCreateModalOpen(false);
            fetchEvents();
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen relative overflow-hidden">
            <AnimatedBackground />
            <Sidebar activeTab="calendar" />

            <div className="ml-20 relative z-10 pt-24 px-8 pb-12 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <h1 className="text-4xl font-bold text-white flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20">
                                <CalendarDays className="w-8 h-8 text-white" />
                            </div>
                            Content Strategy Hub
                            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                        </h1>
                        <p className="text-cyan-300/70 mt-2 text-lg">
                            AI-Powered Content Calendar & Scheduler
                        </p>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => exportCalendar()}
                            className="px-5 py-3 bg-teal-900/40 border border-cyan-400/30 text-cyan-400 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-teal-900/60"
                        >
                            <Download className="w-5 h-5" />
                            Export CSV
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(34, 211, 238, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                setSelectedDate(new Date().toISOString().split('T')[0]);
                                setIsCreateModalOpen(true);
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-teal-950 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-cyan-500/20"
                        >
                            <Plus className="w-6 h-6" />
                            Schedule Post
                        </motion.button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Calendar Content */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3 space-y-6"
                    >
                        {/* Calendar Navigation */}
                        <div className="bg-teal-900/30 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="text-2xl font-bold text-white tracking-tight">
                                    {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                                </div>
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 211, 238, 0.15)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handlePrevMonth}
                                        className="w-10 h-10 rounded-xl border border-cyan-400/30 flex items-center justify-center text-cyan-400 transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 211, 238, 0.15)' }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleNextMonth}
                                        className="w-10 h-10 rounded-xl border border-cyan-400/30 flex items-center justify-center text-cyan-400 transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-teal-950/60 p-1.5 rounded-xl border border-cyan-400/10">
                                {['Month', 'Week', 'List'].map(view => (
                                    <button
                                        key={view}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'Month'
                                            ? 'bg-cyan-400 text-teal-950 shadow-lg shadow-cyan-500/20'
                                            : 'text-cyan-400/60 hover:text-cyan-400'
                                            }`}
                                    >
                                        {view}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        {loading ? (
                            <div className="h-[600px] bg-teal-900/20 backdrop-blur-xl rounded-2xl border border-cyan-400/10 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="p-4 rounded-full bg-cyan-400/10 border border-cyan-400/30"
                                >
                                    <CalendarIcon className="w-12 h-12 text-cyan-400" />
                                </motion.div>
                            </div>
                        ) : (
                            <CalendarGrid
                                year={currentDate.getFullYear()}
                                month={currentDate.getMonth()}
                                events={events}
                                onSelectDate={(date: string) => {
                                    setSelectedDate(date);
                                    setIsCreateModalOpen(true);
                                }}
                            />
                        )}
                    </motion.div>

                    {/* Sidebar Suggestions */}
                    <div className="space-y-8">
                        {/* AI Insights Card */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-indigo-950/40 backdrop-blur-xl border border-indigo-400/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700" />

                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                                AI Content Forecast
                            </h3>

                            {loadingSuggestions ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-indigo-500/5 rounded-xl animate-pulse border border-indigo-400/10" />
                                    ))}
                                </div>
                            ) : Array.isArray(suggestions?.predicted_trends) ? (
                                <div className="space-y-4">
                                    {suggestions.predicted_trends.map((trend: any, idx: number) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ x: 5 }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-all cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="px-2 py-0.5 bg-indigo-500/20 rounded-md text-[10px] font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/30">
                                                    Peak in {trend.peak_in || '7-14'} days
                                                </div>
                                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div className="text-white font-bold text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                                                {trend.topic}
                                            </div>
                                            <div className="text-[11px] text-cyan-300/60 leading-relaxed">
                                                {trend.reason}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-3">🔮</div>
                                    <p className="text-sm text-indigo-300/60">No foresight available yet. Keep analyzing topics!</p>
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={fetchSuggestions}
                                className="w-full mt-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-300 text-sm font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh Insights
                            </motion.button>
                        </motion.div>

                        {/* Optimal Times Card */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-teal-900/30 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Clock className="w-6 h-6 text-cyan-400" />
                                Peak Engagement
                            </h3>

                            <div className="space-y-4">
                                {Array.isArray(suggestions?.optimal_slots) ? suggestions.optimal_slots.map((slot: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-xl bg-cyan-400/5 border border-cyan-400/20 flex flex-col items-center justify-center group-hover:bg-cyan-400/10 transition-colors">
                                            <div className="text-[10px] font-bold text-cyan-400/60">{slot.day}</div>
                                            <div className="text-sm font-bold text-white">{slot.time}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-white mb-0.5">{slot.platform}</div>
                                            <div className="bg-cyan-400/20 h-1.5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${slot.score}%` }}
                                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )) :
                                    <p className="text-sm text-cyan-400/40 text-center py-4 italic">Select a platform to see slots</p>
                                }
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-teal-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-xl bg-teal-900/90 border border-cyan-400/30 rounded-3xl shadow-3xl p-8 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-2 text-cyan-400/60 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreatePost} className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Schedule Strategy</h2>
                                    <p className="text-cyan-300/60 text-sm">Planning for: <span className="text-cyan-400 font-bold">{selectedDate}</span></p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-cyan-400/70 uppercase tracking-widest pl-1">Post Title</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="What are you posting about?"
                                            value={newPostData.title}
                                            onChange={e => setNewPostData({ ...newPostData, title: e.target.value })}
                                            className="w-full bg-teal-950/50 border border-cyan-400/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 transition-all placeholder-cyan-400/30"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-cyan-400/70 uppercase tracking-widest pl-1">Platform</label>
                                            <select
                                                value={newPostData.platform}
                                                onChange={e => setNewPostData({ ...newPostData, platform: e.target.value })}
                                                className="w-full bg-teal-950/50 border border-cyan-400/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="TikTok">TikTok</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="YouTube">YouTube</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-cyan-400/70 uppercase tracking-widest pl-1">Status</label>
                                            <select
                                                value={newPostData.status}
                                                onChange={e => setNewPostData({ ...newPostData, status: e.target.value as any })}
                                                className="w-full bg-teal-950/50 border border-cyan-400/20 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="Planned">Planned</option>
                                                <option value="Published">Published</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(34, 211, 238, 0.4)' }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-teal-950 font-black text-lg rounded-2xl shadow-xl transition-all"
                                >
                                    CONFIRM SCHEDULE
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const RefreshCw = ({ className }: { className?: string }) => (
    <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M3 21v-5h5" />
    </motion.svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

export default CalendarPage;
