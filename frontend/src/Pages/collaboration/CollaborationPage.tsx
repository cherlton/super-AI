import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Search,
    UserPlus,
    MessageSquare,
    Sparkles,

    Send,
    Check,
    X,

    Lightbulb,
    Heart,
    Youtube,
    Instagram,
    Target,
    AlertCircle,
    Edit3,
    Filter
} from 'lucide-react';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';
import type { CreatorProfile, CollabMatch, CollabRequest, CollabIdea } from '../../context/AuthContext';

// ============ TYPES ============

type TabType = 'profile' | 'matches' | 'requests' | 'ideas';

interface ProfileFormData {
    display_name: string;
    bio: string;
    niche: string;
    sub_niches: string[];
    content_style: 'educational' | 'entertainment' | 'vlogs' | 'tutorials' | 'reviews' | 'comedy' | 'howto';
    platforms: Record<string, number>;
    collab_interests: string[];
    is_open_to_collabs: boolean;
    preferred_min_audience: number;
    preferred_max_audience: number;
}

// ============ SKELETON COMPONENTS ============

const SkeletonPulse = ({ className }: { className: string }) => (
    <div className={`animate-pulse bg-gradient-to-r from-teal-800/40 to-teal-700/40 rounded ${className}`} />
);

const SkeletonCard = () => (
    <div className="bg-teal-900/40 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400/20">
        <div className="flex items-center gap-4 mb-4">
            <SkeletonPulse className="w-16 h-16 rounded-full" />
            <div className="flex-1">
                <SkeletonPulse className="h-5 w-32 mb-2" />
                <SkeletonPulse className="h-4 w-24" />
            </div>
        </div>
        <SkeletonPulse className="h-4 w-full mb-2" />
        <SkeletonPulse className="h-4 w-3/4" />
    </div>
);

// ============ MATCH SCORE BADGE ============

const MatchScoreBadge = ({ score }: { score: number }) => {
    const getColor = () => {
        if (score >= 80) return 'from-green-400 to-emerald-500';
        if (score >= 60) return 'from-cyan-400 to-blue-500';
        if (score >= 40) return 'from-yellow-400 to-orange-500';
        return 'from-pink-400 to-red-500';
    };

    return (
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getColor()} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-lg">{score}</span>
        </div>
    );
};

// ============ PLATFORM ICON ============

const PlatformIcon = ({ platform }: { platform: string }) => {
    const icons: Record<string, React.ReactNode> = {
        youtube: <Youtube className="w-4 h-4 text-red-500" />,
        instagram: <Instagram className="w-4 h-4 text-pink-500" />,
        tiktok: <span className="text-xs font-bold">TT</span>,
    };
    return icons[platform.toLowerCase()] || <span className="text-xs">{platform[0].toUpperCase()}</span>;
};

// ============ NICHE OPTIONS ============

const NICHE_OPTIONS = [
    'Technology', 'Gaming', 'Lifestyle', 'Fitness', 'Education',
    'Entertainment', 'Business', 'Fashion', 'Food', 'Travel',
    'Music', 'Art', 'Science', 'Health', 'Finance'
];

const STYLE_OPTIONS = [
    'educational', 'entertainment', 'vlogs', 'tutorials', 'reviews', 'comedy', 'howto'
] as const;

const COLLAB_TYPES = [
    'Guest Appearance', 'Joint Video', 'Shoutout', 'Challenge', 'Interview', 'Reaction', 'Duet'
];

// ============ PROFILE FORM COMPONENT ============

const ProfileForm = ({
    profile,
    onSave,
    isSaving
}: {
    profile: CreatorProfile | null;
    onSave: (data: ProfileFormData) => void;
    isSaving: boolean;
}) => {
    const [formData, setFormData] = useState<ProfileFormData>({
        display_name: profile?.display_name || '',
        bio: profile?.bio || '',
        niche: profile?.niche || 'Technology',
        sub_niches: profile?.sub_niches || [],
        content_style: profile?.content_style || 'educational',
        platforms: profile?.platforms || { youtube: 0 },
        collab_interests: profile?.collab_interests || [],
        is_open_to_collabs: profile?.is_open_to_collabs ?? true,
        preferred_min_audience: profile?.preferred_min_audience || 0,
        preferred_max_audience: profile?.preferred_max_audience || 1000000,
    });

    const handlePlatformChange = (platform: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            platforms: { ...prev.platforms, [platform]: value }
        }));
    };

    const toggleCollabInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            collab_interests: prev.collab_interests.includes(interest)
                ? prev.collab_interests.filter(i => i !== interest)
                : [...prev.collab_interests, interest]
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <div className="bg-teal-900/40 backdrop-blur-lg rounded-3xl p-8 border border-cyan-400/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Edit3 className="w-6 h-6 text-cyan-400" />
                    {profile ? 'Edit Your Profile' : 'Create Your Creator Profile'}
                </h2>

                <div className="space-y-6">
                    {/* Display Name */}
                    <div>
                        <label className="block text-cyan-300 text-sm font-medium mb-2">Display Name *</label>
                        <input
                            type="text"
                            value={formData.display_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                            className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-3 text-white placeholder-cyan-600 focus:outline-none focus:border-cyan-400 transition-all"
                            placeholder="Your creator name"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-cyan-300 text-sm font-medium mb-2">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-3 text-white placeholder-cyan-600 focus:outline-none focus:border-cyan-400 transition-all h-24 resize-none"
                            placeholder="Tell others about your content..."
                        />
                    </div>

                    {/* Niche */}
                    <div>
                        <label className="block text-cyan-300 text-sm font-medium mb-2">Primary Niche *</label>
                        <select
                            value={formData.niche}
                            onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                            className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-all"
                        >
                            {NICHE_OPTIONS.map(niche => (
                                <option key={niche} value={niche}>{niche}</option>
                            ))}
                        </select>
                    </div>

                    {/* Content Style */}
                    <div>
                        <label className="block text-cyan-300 text-sm font-medium mb-2">Content Style</label>
                        <div className="flex flex-wrap gap-2">
                            {STYLE_OPTIONS.map(style => (
                                <button
                                    key={style}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, content_style: style }))}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.content_style === style
                                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white'
                                        : 'bg-teal-800/60 text-cyan-300 hover:bg-teal-700/60'
                                        }`}
                                >
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Platforms */}
                    <div>
                        <label className="block text-cyan-300 text-sm font-medium mb-2">Your Platforms</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['youtube', 'tiktok', 'instagram'].map(platform => (
                                <div key={platform} className="bg-teal-800/40 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <PlatformIcon platform={platform} />
                                        <span className="text-white text-sm capitalize">{platform}</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.platforms[platform] || ''}
                                        onChange={(e) => handlePlatformChange(platform, parseInt(e.target.value) || 0)}
                                        className="w-full bg-teal-900/60 border border-cyan-400/20 rounded-lg px-3 py-2 text-white text-sm placeholder-cyan-600 focus:outline-none focus:border-cyan-400"
                                        placeholder="Followers"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Collab Interests */}
                    <div>
                        <label className="block text-cyan-300 text-sm font-medium mb-2">Collaboration Interests</label>
                        <div className="flex flex-wrap gap-2">
                            {COLLAB_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => toggleCollabInterest(type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.collab_interests.includes(type)
                                        ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white'
                                        : 'bg-teal-800/60 text-cyan-300 hover:bg-teal-700/60'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Open to Collabs Toggle */}
                    <div className="flex items-center justify-between bg-teal-800/40 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5 text-pink-400" />
                            <span className="text-white font-medium">Open to Collaborations</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, is_open_to_collabs: !prev.is_open_to_collabs }))}
                            className={`w-14 h-8 rounded-full transition-all ${formData.is_open_to_collabs ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-teal-700'
                                }`}
                        >
                            <motion.div
                                className="w-6 h-6 bg-white rounded-full shadow-lg"
                                animate={{ x: formData.is_open_to_collabs ? 30 : 4 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    {/* Save Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSave(formData)}
                        disabled={isSaving || !formData.display_name || !formData.niche}
                        className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Save Profile
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// ============ MATCH CARD COMPONENT ============

const MatchCard = ({
    match,

    onSendRequest,
    onGeneratePitch,
    delay
}: {
    match: CollabMatch;
    onViewProfile: () => void;
    onSendRequest: () => void;
    onGeneratePitch: () => void;
    delay: number;
}) => {
    const profile = match.profile;
    const totalFollowers = Object.values(profile.platforms || {}).reduce((a, b) => a + b, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className="bg-teal-900/40 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400/20 hover:border-cyan-400/40 transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        {profile.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg">{profile.display_name}</h3>
                        <p className="text-cyan-400 text-sm">{profile.niche}</p>
                    </div>
                </div>
                <MatchScoreBadge score={match.match_score} />
            </div>

            {profile.bio && (
                <p className="text-cyan-200/80 text-sm mb-4 line-clamp-2">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-cyan-300">
                    <Users className="w-4 h-4" />
                    <span>{totalFollowers.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                    <Target className="w-4 h-4" />
                    <span className="capitalize">{profile.content_style}</span>
                </div>
            </div>

            {/* Platforms */}
            <div className="flex items-center gap-2 mb-4">
                {Object.entries(profile.platforms || {}).map(([platform, count]) => (
                    count > 0 && (
                        <div key={platform} className="flex items-center gap-1 bg-teal-800/60 px-3 py-1 rounded-full">
                            <PlatformIcon platform={platform} />
                            <span className="text-cyan-300 text-xs">{(count as number).toLocaleString()}</span>
                        </div>
                    )
                ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onGeneratePitch}
                    className="flex-1 py-2 bg-teal-800/60 text-cyan-300 rounded-xl hover:bg-teal-700/60 transition-all flex items-center justify-center gap-2 text-sm"
                >
                    <Sparkles className="w-4 h-4" />
                    AI Pitch
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSendRequest}
                    className="flex-1 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 text-sm"
                >
                    <Send className="w-4 h-4" />
                    Connect
                </motion.button>
            </div>
        </motion.div>
    );
};

// ============ REQUEST CARD COMPONENT ============

const RequestCard = ({
    request,
    isIncoming,
    onAccept,
    onDecline,
    delay
}: {
    request: CollabRequest;
    isIncoming: boolean;
    onAccept?: () => void;
    onDecline?: () => void;
    delay: number;
}) => {
    const profile = isIncoming ? request.sender_profile : request.receiver_profile;

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        accepted: 'bg-green-500/20 text-green-400',
        declined: 'bg-red-500/20 text-red-400',
        expired: 'bg-gray-500/20 text-gray-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: isIncoming ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay * 0.1 }}
            className="bg-teal-900/40 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400/20"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {profile?.display_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{profile?.display_name || 'Unknown'}</h3>
                        <p className="text-cyan-400 text-sm">{profile?.niche || 'Creator'}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
            </div>

            {request.collab_type && (
                <div className="flex items-center gap-2 mb-3">
                    <UserPlus className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300 text-sm">{request.collab_type}</span>
                </div>
            )}

            {request.message && (
                <p className="text-cyan-200/70 text-sm mb-4 bg-teal-800/40 p-3 rounded-xl">
                    "{request.message}"
                </p>
            )}

            {isIncoming && request.status === 'pending' && (
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAccept}
                        className="flex-1 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Accept
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onDecline}
                        className="flex-1 py-2 bg-teal-800/60 text-cyan-300 rounded-xl hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Decline
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};

// ============ IDEA CARD COMPONENT ============

const IdeaCard = ({ idea, delay }: { idea: CollabIdea; delay: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay * 0.1 }}
        className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/20"
    >
        <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">{idea.title}</h3>
                <p className="text-purple-200/80 text-sm mb-3">{idea.description}</p>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-purple-300">{idea.format}</span>
                    <span className="text-pink-300">{idea.potential_reach}</span>
                </div>
            </div>
        </div>
    </motion.div>
);

// ============ MAIN PAGE COMPONENT ============

export const CollaborationPage = () => {
    const {
        isAuthenticated,
        getCreatorProfile,
        createOrUpdateCreatorProfile,
        findCollabMatches,
        getCollabRequests,
        respondToCollabRequest,
        generateCollabPitch,

        sendCollabRequest
    } = useAuth();

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [profile, setProfile] = useState<CreatorProfile | null>(null);
    const [matches, setMatches] = useState<CollabMatch[]>([]);
    const [requests, setRequests] = useState<{ incoming: CollabRequest[]; outgoing: CollabRequest[] }>({ incoming: [], outgoing: [] });
    const [ideas,] = useState<CollabIdea[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Filters for matches
    const [filters, setFilters] = useState({
        niche: '',
        style: '',
        min_audience: 0,
        max_audience: 10000000
    });
    const [showFilters, setShowFilters] = useState(false);

    // Pitch modal
    const [pitchModal, setPitchModal] = useState<{ isOpen: boolean; profileId: number | null; pitch: string }>({
        isOpen: false,
        profileId: null,
        pitch: ''
    });

    // Request modal
    const [requestModal, setRequestModal] = useState<{
        isOpen: boolean;
        profileId: number | null;
        message: string;
        collabType: string;
    }>({
        isOpen: false,
        profileId: null,
        message: '',
        collabType: 'Guest Appearance'
    });

    // Fetch profile on load
    const fetchProfile = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        const result = await getCreatorProfile();
        if (result.success && result.data) {
            setProfile(result.data);
            setActiveTab('matches'); // Switch to matches if profile exists
        }
        setIsLoading(false);
    }, [isAuthenticated, getCreatorProfile]);

    // Fetch matches
    const fetchMatches = useCallback(async () => {
        if (!profile) return;

        setIsLoading(true);
        const result = await findCollabMatches({
            niche: filters.niche || undefined,
            style: filters.style || undefined,
            min_audience: filters.min_audience || undefined,
            max_audience: filters.max_audience || undefined,
            limit: 20
        });
        if (result.success && result.data) {
            setMatches(result.data);
        }
        setIsLoading(false);
    }, [profile, filters, findCollabMatches]);

    // Fetch requests
    const fetchRequests = useCallback(async () => {
        if (!profile) return;

        setIsLoading(true);
        const result = await getCollabRequests('both');
        if (result.success && result.data) {
            setRequests(result.data);
        }
        setIsLoading(false);
    }, [profile, getCollabRequests]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (activeTab === 'matches' && profile) {
            fetchMatches();
        } else if (activeTab === 'requests' && profile) {
            fetchRequests();
        }
    }, [activeTab, profile, fetchMatches, fetchRequests]);

    // Save profile
    const handleSaveProfile = async (data: ProfileFormData) => {
        setIsSaving(true);
        setError(null);

        const result = await createOrUpdateCreatorProfile(data);
        if (result.success) {
            setProfile(result.data as CreatorProfile);
            setSuccessMessage('Profile saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
            setActiveTab('matches');
        } else {
            setError(result.error || 'Failed to save profile');
        }
        setIsSaving(false);
    };

    // Generate pitch
    const handleGeneratePitch = async (profileId: number) => {
        setPitchModal({ isOpen: true, profileId, pitch: '' });
        const result = await generateCollabPitch(profileId);
        if (result.success && result.data) {
            setPitchModal(prev => ({ ...prev, pitch: result.data?.pitch || '' }));
        } else {
            setPitchModal(prev => ({ ...prev, pitch: 'Failed to generate pitch. Please try again.' }));
        }
    };

    // Send request
    const handleSendRequest = async () => {
        if (!requestModal.profileId) return;

        const result = await sendCollabRequest(requestModal.profileId, {
            collab_type: requestModal.collabType,
            message: requestModal.message
        });

        if (result.success) {
            setSuccessMessage('Collaboration request sent!');
            setRequestModal({ isOpen: false, profileId: null, message: '', collabType: 'Guest Appearance' });
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            setError(result.error || 'Failed to send request');
        }
    };

    // Respond to request
    const handleRespondToRequest = async (requestId: number, accept: boolean) => {
        const result = await respondToCollabRequest(requestId, accept);
        if (result.success) {
            setSuccessMessage(accept ? 'Request accepted!' : 'Request declined');
            fetchRequests();
            setTimeout(() => setSuccessMessage(null), 3000);
        } else {
            setError(result.error || 'Failed to respond');
        }
    };



    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'profile', label: 'My Profile', icon: <Edit3 className="w-4 h-4" /> },
        { id: 'matches', label: 'Find Matches', icon: <Users className="w-4 h-4" /> },
        { id: 'requests', label: 'Requests', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'ideas', label: 'Collab Ideas', icon: <Lightbulb className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900">
            <AnimatedBackground />
            <Sidebar activeTab="collab" />

            <div className="ml-20 min-h-screen p-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        Collab Matchmaker
                    </h1>
                    <p className="text-cyan-300 text-lg">Find your perfect collaboration partners with AI-powered matching</p>
                </motion.div>

                {/* Alerts */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 bg-red-500/20 border border-red-400/30 rounded-xl p-4 flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <span className="text-red-300">{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 bg-green-500/20 border border-green-400/30 rounded-xl p-4 flex items-center gap-3"
                        >
                            <Check className="w-5 h-5 text-green-400" />
                            <span className="text-green-300">{successMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveTab(tab.id)}
                            disabled={!profile && tab.id !== 'profile'}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-teal-900/40 text-cyan-300 hover:bg-teal-800/60 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.id === 'requests' && (requests.incoming.filter(r => r.status === 'pending').length > 0) && (
                                <span className="w-5 h-5 bg-pink-500 rounded-full text-xs flex items-center justify-center text-white">
                                    {requests.incoming.filter(r => r.status === 'pending').length}
                                </span>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <ProfileForm
                                profile={profile}
                                onSave={handleSaveProfile}
                                isSaving={isSaving}
                            />
                        </motion.div>
                    )}

                    {/* Matches Tab */}
                    {activeTab === 'matches' && (
                        <motion.div
                            key="matches"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {/* Filters */}
                            <div className="mb-6 flex items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-2 bg-teal-900/40 text-cyan-300 rounded-xl hover:bg-teal-800/60"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchMatches}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </motion.button>
                            </div>

                            {showFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 bg-teal-900/40 rounded-2xl p-6 border border-cyan-400/20"
                                >
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-cyan-300 text-sm mb-2">Niche</label>
                                            <select
                                                value={filters.niche}
                                                onChange={(e) => setFilters(prev => ({ ...prev, niche: e.target.value }))}
                                                className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-2 text-white"
                                            >
                                                <option value="">All Niches</option>
                                                {NICHE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-cyan-300 text-sm mb-2">Style</label>
                                            <select
                                                value={filters.style}
                                                onChange={(e) => setFilters(prev => ({ ...prev, style: e.target.value }))}
                                                className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-2 text-white"
                                            >
                                                <option value="">All Styles</option>
                                                {STYLE_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-cyan-300 text-sm mb-2">Min Audience</label>
                                            <input
                                                type="number"
                                                value={filters.min_audience}
                                                onChange={(e) => setFilters(prev => ({ ...prev, min_audience: parseInt(e.target.value) || 0 }))}
                                                className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-2 text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-cyan-300 text-sm mb-2">Max Audience</label>
                                            <input
                                                type="number"
                                                value={filters.max_audience}
                                                onChange={(e) => setFilters(prev => ({ ...prev, max_audience: parseInt(e.target.value) || 10000000 }))}
                                                className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-2 text-white"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Matches Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                                </div>
                            ) : matches.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {matches.map((match, i) => (
                                        <MatchCard
                                            key={match.profile.id}
                                            match={match}
                                            onViewProfile={() => { }}
                                            onSendRequest={() => setRequestModal({ isOpen: true, profileId: match.profile.id, message: '', collabType: 'Guest Appearance' })}
                                            onGeneratePitch={() => handleGeneratePitch(match.profile.id)}
                                            delay={i}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Users className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                                    <p className="text-cyan-300 text-lg">No matches found</p>
                                    <p className="text-cyan-400/50">Try adjusting your filters or check back later</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Requests Tab */}
                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Incoming */}
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-cyan-400" />
                                        Incoming Requests
                                    </h2>
                                    <div className="space-y-4">
                                        {requests.incoming.length > 0 ? (
                                            requests.incoming.map((req, i) => (
                                                <RequestCard
                                                    key={req.id}
                                                    request={req}
                                                    isIncoming={true}
                                                    onAccept={() => handleRespondToRequest(req.id, true)}
                                                    onDecline={() => handleRespondToRequest(req.id, false)}
                                                    delay={i}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-cyan-400/50">
                                                No incoming requests
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Outgoing */}
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <Send className="w-5 h-5 text-cyan-400" />
                                        Sent Requests
                                    </h2>
                                    <div className="space-y-4">
                                        {requests.outgoing.length > 0 ? (
                                            requests.outgoing.map((req, i) => (
                                                <RequestCard
                                                    key={req.id}
                                                    request={req}
                                                    isIncoming={false}
                                                    delay={i}
                                                />
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-cyan-400/50">
                                                No sent requests
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Ideas Tab */}
                    {activeTab === 'ideas' && (
                        <motion.div
                            key="ideas"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {ideas.length > 0 ? (
                                <div className="space-y-4 max-w-3xl">
                                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        AI-Generated Collaboration Ideas
                                    </h2>
                                    {ideas.map((idea, i) => (
                                        <IdeaCard key={i} idea={idea} delay={i} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Lightbulb className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                                    <p className="text-cyan-300 text-lg">No ideas yet</p>
                                    <p className="text-cyan-400/50">Click "AI Pitch" on a match to generate collaboration ideas</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pitch Modal */}
            <AnimatePresence>
                {pitchModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setPitchModal({ isOpen: false, profileId: null, pitch: '' })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-teal-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full border border-cyan-400/30"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                    AI-Generated Pitch
                                </h3>
                                <button
                                    onClick={() => setPitchModal({ isOpen: false, profileId: null, pitch: '' })}
                                    className="text-cyan-300 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {pitchModal.pitch ? (
                                <div className="bg-teal-800/60 rounded-xl p-4 text-cyan-200 whitespace-pre-wrap">
                                    {pitchModal.pitch}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    if (pitchModal.profileId) {
                                        setRequestModal({
                                            isOpen: true,
                                            profileId: pitchModal.profileId,
                                            message: pitchModal.pitch,
                                            collabType: 'Guest Appearance'
                                        });
                                        setPitchModal({ isOpen: false, profileId: null, pitch: '' });
                                    }
                                }}
                                disabled={!pitchModal.pitch}
                                className="w-full mt-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-xl disabled:opacity-50"
                            >
                                Use This Pitch
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Request Modal */}
            <AnimatePresence>
                {requestModal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setRequestModal({ isOpen: false, profileId: null, message: '', collabType: 'Guest Appearance' })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-teal-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full border border-cyan-400/30"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Send className="w-5 h-5 text-cyan-400" />
                                    Send Collaboration Request
                                </h3>
                                <button
                                    onClick={() => setRequestModal({ isOpen: false, profileId: null, message: '', collabType: 'Guest Appearance' })}
                                    className="text-cyan-300 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-cyan-300 text-sm mb-2">Collaboration Type</label>
                                    <select
                                        value={requestModal.collabType}
                                        onChange={(e) => setRequestModal(prev => ({ ...prev, collabType: e.target.value }))}
                                        className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-3 text-white"
                                    >
                                        {COLLAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-cyan-300 text-sm mb-2">Your Pitch Message</label>
                                    <textarea
                                        value={requestModal.message}
                                        onChange={(e) => setRequestModal(prev => ({ ...prev, message: e.target.value }))}
                                        className="w-full bg-teal-800/60 border border-cyan-400/30 rounded-xl px-4 py-3 text-white h-32 resize-none"
                                        placeholder="Introduce yourself and explain why you'd like to collaborate..."
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSendRequest}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Send Request
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollaborationPage;
