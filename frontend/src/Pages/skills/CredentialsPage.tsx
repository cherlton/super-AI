import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award,
    Trophy,
    Share2,
    CheckCircle,
    ShieldCheck,
    Calendar,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';
import { useNavigate } from 'react-router-dom';

interface Certificate {
    id: string;
    skill_name: string;
    verification_hash: string;
    share_url: string;
    issued_at: string;
}

interface LeaderboardEntry {
    rank: number;
    username: string;
    certifications_count: number;
    avatar?: string;
}

export const CredentialsPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, getUserCertificates, getLeaderboard } = useAuth();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'certificates' | 'leaderboard'>('certificates');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const [certsRes, leaderRes] = await Promise.all([
                getUserCertificates(),
                getLeaderboard()
            ]);

            if (certsRes.success && certsRes.data) setCertificates(certsRes.data);
            if (leaderRes.success && leaderRes.data) setLeaderboard(leaderRes.data);
            setLoading(false);
        };

        fetchData();
    }, [isAuthenticated, getUserCertificates, getLeaderboard, navigate]);

    const handleCopyHash = (hash: string) => {
        navigator.clipboard.writeText(hash);
        setCopiedId(hash);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <Sidebar activeTab="skills" />

            <div className="ml-20 relative z-10 pt-24 pb-20 px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">ACHIEVEMENTS</h1>
                            <p className="text-cyan-400 font-medium">Verify your skills and see where you stand globally.</p>
                        </motion.div>

                        <div className="flex bg-teal-900/40 backdrop-blur-xl p-1 rounded-2xl border border-white/10">
                            <button
                                onClick={() => setActiveTab('certificates')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'certificates'
                                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg'
                                    : 'text-cyan-100/60 hover:text-white'
                                    }`}
                            >
                                <Award className="w-5 h-5" />
                                My Certificates
                            </button>
                            <button
                                onClick={() => setActiveTab('leaderboard')}
                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'leaderboard'
                                    ? 'bg-gradient-to-r from-purple-400 to-violet-500 text-white shadow-lg'
                                    : 'text-cyan-100/60 hover:text-white'
                                    }`}
                            >
                                <Trophy className="w-5 h-5" />
                                Leaderboard
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex items-center justify-center py-40">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"
                            />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'certificates' ? (
                                <motion.div
                                    key="certs"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    {certificates.length > 0 ? (
                                        certificates.map((cert) => (
                                            <CertificateCard
                                                key={cert.id}
                                                cert={cert}
                                                onCopy={() => handleCopyHash(cert.verification_hash)}
                                                isCopied={copiedId === cert.verification_hash}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 text-center bg-teal-900/20 rounded-3xl border-2 border-dashed border-white/5">
                                            <ShieldCheck className="w-20 h-20 text-white/10 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-white mb-2">No Certificates Yet</h3>
                                            <p className="text-cyan-400/60 mb-8 max-w-xs mx-auto">Complete milestones in SkillBridge to earn your first certification.</p>
                                            <button
                                                onClick={() => navigate('/skills')}
                                                className="px-8 py-3 bg-cyan-400 text-teal-950 rounded-xl font-bold hover:scale-105 transition-all"
                                            >
                                                EXPLORE SKILLS
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="leaderboard"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="bg-teal-900/30 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
                                >
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="px-8 py-5 text-cyan-400 text-sm font-bold uppercase tracking-wider">Rank</th>
                                                    <th className="px-8 py-5 text-cyan-400 text-sm font-bold uppercase tracking-wider">User</th>
                                                    <th className="px-8 py-5 text-cyan-400 text-sm font-bold uppercase tracking-wider text-right">Certifications</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {leaderboard.map((entry) => (
                                                    <LeaderboardRow key={entry.username} entry={entry} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

const CertificateCard = ({ cert, onCopy, isCopied }: { cert: Certificate, onCopy: () => void, isCopied: boolean }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="bg-teal-900/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden group"
    >
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-cyan-400/20 transition-all" />

        <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Award className="w-10 h-10 text-teal-950" />
            </div>
            <div className="text-[10px] font-black text-cyan-400/40 uppercase tracking-[0.2em]">Verified Skill</div>
        </div>

        <h3 className="text-2xl font-black text-white mb-2 leading-tight">{cert.skill_name}</h3>
        <div className="flex items-center gap-2 text-cyan-300/60 text-sm mb-8">
            <Calendar className="w-4 h-4" />
            Issued: {new Date(cert.issued_at).toLocaleDateString()}
        </div>

        <div className="bg-teal-950/60 rounded-2xl p-4 border border-white/5 mb-8">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">Hash Status</span>
                {isCopied ? <span className="text-[10px] text-emerald-400 font-bold">COPIED!</span> : <CheckCircle className="w-3 h-3 text-emerald-400" />}
            </div>
            <div
                onClick={onCopy}
                className="text-[10px] font-mono text-white/30 break-all cursor-pointer hover:text-white/50 transition-colors"
            >
                {cert.verification_hash}
            </div>
        </div>

        <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all">
                <Share2 className="w-4 h-4" />
                Share
            </button>
            <button
                onClick={() => window.open(`/verify/${cert.id}`, '_blank')}
                className="flex-1 py-3 bg-cyan-400 hover:bg-cyan-300 text-teal-950 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all"
            >
                <ShieldCheck className="w-4 h-4" />
                Verify
            </button>
        </div>
    </motion.div>
);

const LeaderboardRow = ({ entry }: { entry: LeaderboardEntry }) => {
    const isTop3 = entry.rank <= 3;
    const rankColors = {
        1: 'from-amber-300 to-amber-500 shadow-amber-500/20',
        2: 'from-slate-300 to-slate-400 shadow-slate-400/20',
        3: 'from-orange-400 to-orange-600 shadow-orange-600/20'
    };

    return (
        <tr className={`group transition-colors ${isTop3 ? 'bg-white/[0.02]' : 'hover:bg-white/[0.01]'}`}>
            <td className="px-8 py-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isTop3
                    ? `bg-gradient-to-br ${rankColors[entry.rank as 1 | 2 | 3]} text-teal-950 shadow-lg`
                    : 'bg-teal-900/50 text-cyan-400 border border-white/10'
                    }`}>
                    {entry.rank}
                </div>
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-cyan-400/20 overflow-hidden bg-teal-900/60 p-1">
                        <img
                            src={entry.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`}
                            alt={entry.username}
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white flex items-center gap-2">
                            {entry.username}
                            {isTop3 && <Sparkles className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="text-xs text-cyan-400/40">SuperAI Master Builder</div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6 text-right">
                <div className="inline-flex items-center gap-3 bg-teal-900/40 px-4 py-2 rounded-xl border border-white/5">
                    <span className="text-xl font-black text-white">{entry.certifications_count}</span>
                    <Award className="w-5 h-5 text-amber-400" />
                </div>
            </td>
        </tr>
    );
};
