import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    Award,
    CheckCircle,
    XCircle,
    Copy,
    Calendar,
    User,
    BrainCircuit,
    ArrowLeft,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';

export const PublicVerifyPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { verifyCertificate } = useAuth();
    const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const [certData, setCertData] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const verify = async () => {
            if (!id) return;
            const result = await verifyCertificate(id);
            if (result.success) {
                setCertData(result.data);
                setStatus('valid');
            } else {
                setStatus('invalid');
            }
        };
        verify();
    }, [id, verifyCertificate]);

    const handleCopy = () => {
        if (!certData) return;
        navigator.clipboard.writeText(certData.verification_hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl relative z-10"
            >
                {/* Back Link */}
                <motion.button
                    whileHover={{ x: -5 }}
                    onClick={() => navigate('/')}
                    className="absolute -top-12 left-0 text-cyan-400 font-bold flex items-center gap-2 hover:text-cyan-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Platform
                </motion.button>

                <div className="bg-teal-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.1)]">
                    <AnimatePresence mode="wait">
                        {status === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-20 text-center"
                            >
                                <RefreshCw className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-6" />
                                <h2 className="text-2xl font-bold text-white mb-2">Verifying Integrity</h2>
                                <p className="text-cyan-400/60 font-mono text-sm">Checking cryptographic proof...</p>
                            </motion.div>
                        )}

                        {status === 'valid' && (
                            <motion.div
                                key="valid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                            >
                                {/* Success Banner */}
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-center relative overflow-hidden">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.3 }}
                                        className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/40 shadow-xl"
                                    >
                                        <ShieldCheck className="w-10 h-10 text-white" />
                                    </motion.div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight">VERIFIED AUTHENTIC</h2>
                                    <p className="text-white/80 font-medium">This credential has been validated on SuperAI Node.</p>

                                    {/* Decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rotate-45 translate-x-16 -translate-y-16" />
                                </div>

                                <div className="p-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                        <InfoItem
                                            icon={User}
                                            label="Recipient"
                                            value={certData.username}
                                        />
                                        <InfoItem
                                            icon={Award}
                                            label="Skill Mastered"
                                            value={certData.skill_name}
                                        />
                                        <InfoItem
                                            icon={Calendar}
                                            label="Issue Date"
                                            value={new Date(certData.issued_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        />
                                        <InfoItem
                                            icon={BrainCircuit}
                                            label="Learning Model"
                                            value="SuperAI LLaMA-v3 Core"
                                        />
                                    </div>

                                    {/* Proof Section */}
                                    <div className="bg-teal-950/60 rounded-3xl p-6 border border-white/10">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                Cryptographic Proof
                                            </div>
                                            <button
                                                onClick={handleCopy}
                                                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-cyan-400"
                                            >
                                                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <div className="font-mono text-xs text-white/40 break-all leading-relaxed">
                                            {certData.verification_hash}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {status === 'invalid' && (
                            <motion.div
                                key="invalid"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-20 text-center"
                            >
                                <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
                                <h2 className="text-3xl font-black text-rose-500 mb-4 uppercase">Verification Failed</h2>
                                <p className="text-cyan-400/60 max-w-sm mx-auto mb-10">
                                    The integrity check for this certificate failed. The record may have been tampered with or does not exist.
                                </p>
                                <button
                                    onClick={() => setStatus('loading')}
                                    className="px-8 py-3 bg-white/5 border border-rose-500/30 text-rose-400 rounded-xl font-bold hover:bg-rose-500/10 transition-all flex items-center justify-center gap-2 mx-auto"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Retry Verification
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className="space-y-1">
        <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400/40 uppercase tracking-widest">
            <Icon className="w-3 h-3" />
            {label}
        </div>
        <div className="text-lg font-bold text-white">{value}</div>
    </div>
);
