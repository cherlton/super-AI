import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { Container } from '../../component/layout/Container';
import { Card } from '../../component/Card';
import { Button } from '../../component/common/Button';
import { User, Lock, Mail, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';

export const SettingsPage: React.FC = () => {
    const { getProfile, updateProfile, updatePassword, deleteAccount } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [emailForm, setEmailForm] = useState({ email: '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const result = await getProfile();
        if (result.success) {
            setProfile(result.data);
            setEmailForm({ email: result.data.email });
        } else if (result.error) {
            setMessage({ type: 'error', text: result.error });
        }
        setLoading(false);
    };

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        const result = await updateProfile(emailForm.email);
        if (result.success) {
            setMessage({ type: 'success', text: 'Email updated successfully' });
            loadProfile();
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to update email' });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (passwordForm.new !== passwordForm.confirm) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        const result = await updatePassword(passwordForm.current, passwordForm.new);
        if (result.success) {
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordForm({ current: '', new: '', confirm: '' });
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to change password' });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
            const result = await deleteAccount();
            if (!result.success) {
                setMessage({ type: 'error', text: result.error || 'Failed to delete account' });
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative pt-24 pb-12 bg-transparent">
            <AnimatedBackground />

            <Container size="md" className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Account Settings</h1>
                        <p className="text-cyan-300 mt-2">Manage your profile, security, and account preferences.</p>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                            ? 'bg-emerald-900/40 border-emerald-400/30 text-emerald-300'
                            : 'bg-red-900/40 border-red-400/30 text-red-300'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar/Profile Card */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card variant="transparent" className="text-center p-8 border-cyan-400/20">
                                <div className="w-24 h-24 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-400/30 shadow-lg shadow-cyan-500/20">
                                    <User className="w-12 h-12 text-cyan-400" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">{profile?.email?.split('@')[0] || 'User'}</h2>
                                <p className="text-sm text-cyan-300 mb-6 opacity-80">{profile?.email}</p>

                                <div className="space-y-4 text-left border-t border-white/10 pt-6">
                                    <div className="flex items-center gap-3 text-sm text-cyan-100/70">
                                        <Calendar size={16} className="text-cyan-400" />
                                        <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Loading...'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-cyan-100/70">
                                        <ShieldCheck size={16} className="text-emerald-400" />
                                        <span>Verified Account</span>
                                    </div>
                                </div>
                            </Card>

                            <Card variant="transparent" className="border-red-500/30 p-6">
                                <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                    <Trash2 size={18} />
                                    Danger Zone
                                </h3>
                                <p className="text-xs text-red-300/80 mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <Button
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all w-full"
                                    onClick={handleDeleteAccount}
                                >
                                    Delete Account
                                </Button>
                            </Card>
                        </div>

                        {/* Main Settings Forms */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Profile Information */}
                            <Card variant="transparent" padding="lg" className="border-cyan-400/10">
                                <div className="flex items-center gap-2 mb-6 text-cyan-400">
                                    <Mail size={20} />
                                    <h3 className="text-lg font-bold text-white">Profile Information</h3>
                                </div>
                                <form onSubmit={handleUpdateEmail} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-200 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={emailForm.email}
                                            onChange={(e) => setEmailForm({ email: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all placeholder:text-white/20 text-lg shadow-inner"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" variant="primary" className="bg-gradient-to-r from-cyan-500 to-blue-500 border-none px-8 py-3 h-auto text-base font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">Save Changes</Button>
                                    </div>
                                </form>
                            </Card>

                            {/* Security Settings */}
                            <Card variant="transparent" padding="lg" className="border-cyan-400/10">
                                <div className="flex items-center gap-2 mb-6 text-cyan-400">
                                    <Lock size={20} />
                                    <h3 className="text-lg font-bold text-white">Security Settings</h3>
                                </div>
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-cyan-200 mb-2">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.current}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all placeholder:text-white/20 shadow-inner"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-cyan-200 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.new}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all placeholder:text-white/20 shadow-inner"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-cyan-200 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.confirm}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 outline-none transition-all placeholder:text-white/20 shadow-inner"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button type="submit" variant="primary" className="bg-gradient-to-r from-cyan-500 to-blue-500 border-none px-8 py-3 h-auto text-base font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40">Update Password</Button>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </div>
    );
};

export default SettingsPage;
