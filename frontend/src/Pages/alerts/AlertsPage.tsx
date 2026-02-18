import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    Plus,
    Zap,
    Mail,
    Smartphone,
    Trash2,
    AlertTriangle,
    RefreshCw,
    X,
    CheckCircle,
    Search,
    Activity
} from 'lucide-react';
import { useAuth, type AlertRule } from '../../context/AuthContext';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';
import { useNavigate } from 'react-router-dom';

export const AlertsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule, testSms } = useAuth();
    const [rules, setRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRule, setNewRule] = useState({
        topic: '',
        threshold_score: 70,
        channels: ['email']
    });
    const [testLoading, setTestLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchRules();
    }, [isAuthenticated, navigate]);

    const fetchRules = async () => {
        setLoading(true);
        const result = await getAlertRules();
        if (result.success && result.data) {
            setRules(result.data);
        }
        setLoading(false);
    };

    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createAlertRule(newRule);
        if (result.success) {
            setIsModalOpen(false);
            setNewRule({ topic: '', threshold_score: 70, channels: ['email'] });
            fetchRules();
            showNotification('success', 'Alert rule created successfully!');
        } else {
            showNotification('error', result.error || 'Failed to create rule');
        }
    };

    const handleToggleStatus = async (rule: AlertRule) => {
        const result = await updateAlertRule(rule.id, { is_active: !rule.is_active });
        if (result.success) {
            setRules(rules.map(r => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
        }
    };

    const handleDeleteRule = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this alert rule?')) return;
        const result = await deleteAlertRule(id);
        if (result.success) {
            setRules(rules.filter(r => r.id !== id));
            showNotification('success', 'Rule deleted.');
        }
    };

    const handleTestSms = async () => {
        setTestLoading(true);
        const result = await testSms();
        setTestLoading(false);
        if (result.success) {
            showNotification('success', 'Test SMS sent! Check your phone.');
        } else {
            showNotification('error', result.error || 'Failed to send test SMS. Make sure your phone number is set.');
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen relative overflow-hidden">
            <AnimatedBackground />
            <Sidebar activeTab="home" />

            <div className="ml-20 relative z-10 pt-24 pb-20 px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-4">
                                <span className="p-3 bg-gradient-to-br from-purple-400 to-violet-600 rounded-2xl shadow-lg shadow-purple-500/20">
                                    <Bell className="w-8 h-8 text-white" />
                                </span>
                                TREND ALERTS
                            </h1>
                            <p className="text-cyan-400 font-medium">Proactive monitoring for your favorite topics.</p>
                        </motion.div>

                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleTestSms}
                                disabled={testLoading}
                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-cyan-400 font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                {testLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
                                TEST SMS
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="px-8 py-3 bg-gradient-to-r from-purple-400 to-violet-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl"
                            >
                                <Plus className="w-5 h-5" />
                                NEW ALERT
                            </motion.button>
                        </div>
                    </div>

                    {/* Stats/Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <StatusCard
                            icon={Zap}
                            label="Active Rules"
                            value={rules.filter(r => r.is_active).length.toString()}
                            color="purple"
                        />
                        <StatusCard
                            icon={Activity}
                            label="Monitoring Frequency"
                            value="Every Hour"
                            color="cyan"
                        />
                        <StatusCard
                            icon={CheckCircle}
                            label="Healthy Nodes"
                            value="1x Production"
                            color="emerald"
                        />
                    </div>

                    {/* Notification Toast */}
                    <AnimatePresence>
                        {notification && (
                            <motion.div
                                initial={{ y: -50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -50, opacity: 0 }}
                                className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${notification.type === 'success'
                                    ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
                                    : 'bg-rose-500/20 border-rose-400/30 text-rose-400'
                                    }`}
                            >
                                {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                <span className="font-bold">{notification.message}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Alert List */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-20">
                            <Activity className="w-16 h-16 animate-pulse text-cyan-400" />
                            <p className="mt-4 font-mono text-cyan-400">CONNECTING TO MONITORING ENGINE...</p>
                        </div>
                    ) : rules.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {rules.map((rule, idx) => (
                                <AlertRuleCard
                                    key={rule.id}
                                    rule={rule}
                                    index={idx}
                                    onToggle={() => handleToggleStatus(rule)}
                                    onDelete={() => handleDeleteRule(rule.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-teal-900/20 border-2 border-dashed border-white/5 rounded-[2.5rem] py-32 text-center"
                        >
                            <Bell className="w-16 h-16 text-white/10 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-2">No Active Monitors</h3>
                            <p className="text-cyan-400/40 max-w-sm mx-auto mb-10">
                                You haven't set up any trend alerts yet. Add a topic to start receiving real-time notifications.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsModalOpen(true)}
                                className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold transition-all"
                            >
                                CREATE YOUR FIRST ALERT
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Create Rule Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-32 md:pb-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-teal-950/90 backdrop-blur-md"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="relative w-full max-w-xl bg-teal-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
                        >
                            {/* Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -mt-32" />

                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-white">Setup Alert</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-white/40 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateRule} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest ml-1">Target Topic / Keywords</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input
                                            type="text"
                                            value={newRule.topic}
                                            onChange={(e) => setNewRule({ ...newRule, topic: e.target.value })}
                                            placeholder="e.g. AI Agents, Apple Vision Pro..."
                                            className="w-full bg-teal-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/10 focus:outline-none focus:border-purple-400/50 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Virality Threshold</label>
                                        <span className="text-purple-400 font-black text-xl">{newRule.threshold_score}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={newRule.threshold_score}
                                        onChange={(e) => setNewRule({ ...newRule, threshold_score: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-teal-950 rounded-lg appearance-none cursor-pointer accent-purple-400"
                                    />
                                    <div className="flex justify-between text-[10px] text-white/20 font-bold uppercase tracking-tighter">
                                        <span>Passive</span>
                                        <span>Viral</span>
                                        <span>Explosive</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest ml-1">Notification Channels</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <ChannelButton
                                            icon={Mail}
                                            label="Email"
                                            active={newRule.channels.includes('email')}
                                            onClick={() => {
                                                const channels = newRule.channels.includes('email')
                                                    ? newRule.channels.filter(c => c !== 'email')
                                                    : [...newRule.channels, 'email'];
                                                setNewRule({ ...newRule, channels });
                                            }}
                                        />
                                        <ChannelButton
                                            icon={Smartphone}
                                            label="SMS"
                                            active={newRule.channels.includes('sms')}
                                            onClick={() => {
                                                const channels = newRule.channels.includes('sms')
                                                    ? newRule.channels.filter(c => c !== 'sms')
                                                    : [...newRule.channels, 'sms'];
                                                setNewRule({ ...newRule, channels });
                                            }}
                                        />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-5 bg-gradient-to-r from-purple-400 to-violet-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-500/20"
                                >
                                    ACTIVATE MONITOR
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatusCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: 'purple' | 'cyan' | 'emerald' }) => {
    const colors = {
        purple: 'from-purple-400/20 to-violet-500/10 border-purple-400/20 text-purple-400',
        cyan: 'from-cyan-400/20 to-blue-500/10 border-cyan-400/20 text-cyan-400',
        emerald: 'from-emerald-400/20 to-teal-500/10 border-emerald-400/20 text-emerald-400'
    };

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`bg-teal-900/40 backdrop-blur-xl p-6 rounded-[2rem] border ${colors[color]} flex items-center gap-5`}
        >
            <div className={`p-4 rounded-2xl bg-white/5`}>
                <Icon className="w-8 h-8" />
            </div>
            <div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{label}</div>
                <div className="text-2xl font-black text-white">{value}</div>
            </div>
        </motion.div>
    );
};

const AlertRuleCard = ({ rule, index, onToggle, onDelete }: { rule: AlertRule, index: number, onToggle: () => void, onDelete: () => void }) => {
    const channels = Array.isArray(rule.channels) ? rule.channels : [];

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-teal-900/40 backdrop-blur-2xl rounded-3xl border ${rule.is_active ? 'border-white/10' : 'border-white/5 opacity-60'} p-8 flex flex-col md:flex-row items-center justify-between gap-8 transition-all hover:border-white/20`}
        >
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${rule.is_active ? 'bg-gradient-to-br from-cyan-400 to-blue-500' : 'bg-white/5'}`}>
                    <Search className={`w-7 h-7 ${rule.is_active ? 'text-white' : 'text-white/20'}`} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white leading-tight mb-1">{rule.topic}</h3>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400 px-2 py-0.5 bg-purple-400/10 rounded-lg">
                            <Zap className="w-3 h-3" />
                            Threshold: {rule.threshold_score}
                        </span>
                        <div className="flex gap-2">
                            {channels.includes('email') && <Mail className="w-4 h-4 text-white/30" />}
                            {channels.includes('sms') && <Smartphone className="w-4 h-4 text-white/30" />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <div className="text-right mr-4 hidden md:block">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Status</div>
                    <div className={`text-sm font-bold ${rule.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {rule.is_active ? 'MONITORING' : 'PAUSED'}
                    </div>
                </div>

                <button
                    onClick={onToggle}
                    className={`transition-colors h-10 w-16 rounded-full relative ${rule.is_active ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                    <motion.div
                        animate={{ x: rule.is_active ? 28 : 4 }}
                        className="absolute top-1 w-8 h-8 bg-white rounded-full shadow-md"
                    />
                </button>

                <button
                    onClick={onDelete}
                    className="p-3 bg-white/5 hover:bg-rose-500/20 text-white/20 hover:text-rose-500 rounded-xl transition-all"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
};

const ChannelButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all ${active
            ? 'bg-purple-400/20 border-purple-400/40 text-white shadow-lg shadow-purple-500/10'
            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
            }`}
    >
        <Icon className="w-5 h-5" />
        {label}
    </button>
);
