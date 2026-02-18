import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import API_BASE_URL from '../env';

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

export interface RecentActivity {
    id: number;
    type: 'trend' | 'opinion' | 'skill' | 'calendar';
    title: string;
    description: string;
    icon: string;
    timestamp: string;
    timeAgo: string;
}

export interface CalendarEvent {
    id: number;
    user_id: number;
    content_script_id?: number;
    title: string;
    topic?: string;
    platform: string;
    scheduled_time: string;
    status: 'Planned' | 'Published' | 'Archived';
    ai_suggestion_reason?: string;
    created_at: string;
}

export interface CalendarSuggestion {
    topic: string;
    reason: string;
    best_time: string;
    platform: string;
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
}

export interface Quiz {
    milestone_id: string;
    questions: QuizQuestion[];
}

export interface Certificate {
    id: string;
    skill_name: string;
    verification_hash: string;
    share_url: string;
    issued_at: string;
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    certifications_count: number;
    avatar?: string;
}

export interface AlertRule {
    id: number;
    user_id: number;
    topic: string;
    threshold_score: number;
    channels: string[];
    is_active: boolean;
    last_triggered_at?: string;
    created_at: string;
}

export interface ContentPackage {
    hooks: any;
    script: any;
    captions: any;
    hashtags: any;
    thumbnails: any;
}

export interface ContentScript {
    id: number;
    user_id: number;
    topic: string;
    platform: string;
    content_style: string;
    duration: number;
    niche?: string;
    hooks?: any;
    full_script?: any;
    captions?: any;
    hashtags?: any;
    thumbnail_titles?: any;
    generation_status: string;
    created_at: string;
}

export interface GenerationRequest {
    topic: string;
    platform?: string;
    duration?: number;
    style?: string;
    niche?: string;
}

// Creator Collaboration Types
export interface CreatorProfile {
    id: number;
    user_id: number;
    display_name: string;
    bio?: string;
    profile_image_url?: string;
    niche: string;
    sub_niches?: string[];
    audience_size: number;
    platforms: Record<string, number>; // e.g., { youtube: 10000, tiktok: 5000 }
    content_style: 'educational' | 'entertainment' | 'vlogs' | 'tutorials' | 'reviews' | 'comedy' | 'howto';
    collab_interests?: string[];
    is_open_to_collabs: boolean;
    preferred_min_audience?: number;
    preferred_max_audience?: number;
    created_at: string;
    updated_at?: string;
}

export interface CollabRequest {
    id: number;
    sender_id: number;
    receiver_id: number;
    sender_profile?: CreatorProfile;
    receiver_profile?: CreatorProfile;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    message?: string;
    collab_type?: string;
    ai_generated_pitch: boolean;
    response_message?: string;
    responded_at?: string;
    created_at: string;
    expires_at?: string;
}

export interface CollabMatch {
    profile: CreatorProfile;
    match_score: number;
    score_breakdown?: {
        niche_match: number;
        audience_compatibility: number;
        style_match: number;
        platform_overlap: number;
        activity_score: number;
    };
}

export interface CollabCompatibility {
    total_score: number;
    score_breakdown: {
        niche_match: number;
        audience_compatibility: number;
        style_match: number;
        platform_overlap: number;
        activity_score: number;
    };
    ai_analysis?: string;
}

export interface CollabIdea {
    title: string;
    description: string;
    format: string;
    potential_reach: string;
}

// ============ COMPETITOR ANALYSIS TYPES ============

export interface CompetitorVideo {
    id: number;
    competitor_id: number;
    video_id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    views: number;
    likes: number;
    comments: number;
    engagement_rate: number;
    viral_score?: number;
    published_at: string;
    ai_analysis?: {
        hook_breakdown?: string;
        content_structure?: string;
        engagement_tactics?: string[];
        viral_factors?: string[];
        recommended_adaptations?: string[];
    };
}

export interface Competitor {
    id: number;
    user_id: number;
    channel_id: string;
    channel_url: string;
    channel_name: string;
    channel_description?: string;
    subscriber_count: number;
    video_count: number;
    total_views: number;
    thumbnail_url?: string;
    niche?: string;
    last_synced_at?: string;
    created_at: string;
    videos?: CompetitorVideo[];
}

// ============ AUTH CONTEXT BASE TYPES ============

export interface ContentGaps {
    topics_analyzed: number;
    user_topics: string[];
    competitor_topics: string[];
    top_competitor_content: { title: string; views: number; competitor: string }[];
    gap_opportunities: string[];
    ai_analysis?: {
        underserved_topics: string[];
        content_recommendations: string[];
        competitive_advantage: string;
    };
}

export interface ViralAnalysis {
    hook_breakdown: string;
    content_structure: string;
    engagement_tactics: string[];
    viral_factors: string[];
    recommended_adaptations: string[];
}

// ============ ANALYTICS & ROI TYPES ============

export interface ContentPerformance {
    id: number;
    title: string;
    video_url?: string;
    video_id?: string;
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    watch_time_hours: number;
    used_platform_suggestion: boolean;
    suggestion_type?: 'topic' | 'hook' | 'script' | 'hashtags' | null;
    content_script_id?: number;
    engagement_rate: number;
    cpm: number;
    estimated_revenue: number;
    published_at: string;
    created_at: string;
}

export interface ABTest {
    id: number;
    test_name: string;
    test_description?: string;
    test_variable: string;
    status: 'running' | 'completed';
    content_a_id: number;
    content_b_id: number;
    content_a?: ContentPerformance;
    content_b?: ContentPerformance;
    winner_id?: number | null;
    confidence_score?: number;
    ai_analysis?: string;
    created_at: string;
}

export interface ROIAnalysis {
    suggestion_performance: {
        suggestion_type: string;
        avg_views: number;
        avg_engagement: number;
        revenue_generated: number;
        content_count: number;
    }[];
    roi_with_ai: number; // multiplier, e.g., 2.5x
    total_estimated_revenue: number;
    growth_percentage: number;
}

export interface WeeklyReport {
    this_week: {
        views: number;
        likes: number;
        content_count: number;
        revenue: number;
    };
    last_week: {
        views: number;
        likes: number;
        content_count: number;
        revenue: number;
    };
    growth: {
        views: number;
        revenue: number;
    };
    top_performing_content: ContentPerformance[];
    ai_insights?: string;
}

export interface ContentScore {
    overall_score: number;
    predicted_performance: 'high' | 'medium' | 'low';
    breakdown: {
        hook_strength: number;
        engagement_potential: number;
        seo_optimization: number;
    };
    suggestions: string[];
}

// ============ NICHE FINDER TYPES ============

export interface NicheAnalysis {
    id: number;
    user_id: number;
    niche_name: string;
    description?: string;
    demand_score: number;
    competition_score: number;
    opportunity_score: number;
    estimated_monthly_earnings?: number;
    growth_trend: string;
    audience_size?: string;
    example_channels?: string[];
    keywords?: string[];
    ai_analysis?: any;
    created_at: string;
}

interface AuthContextType {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: (token: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGithub: (code: string) => Promise<{ success: boolean; error?: string }>;
    getProfile: () => Promise<{ success: boolean; data?: any; error?: string }>;
    updateProfile: (email: string) => Promise<{ success: boolean; error?: string }>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    deleteAccount: () => Promise<{ success: boolean; error?: string }>;
    analyzeTrends: (topic: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    analyzeOpinion: (topic: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    buildSkillPath: (skill: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    getDashboardStats: () => Promise<{ success: boolean; data?: DashboardStats; error?: string }>;
    getRecentActivities: (limit?: number) => Promise<{ success: boolean; data?: RecentActivity[]; error?: string }>;
    getCalendarEvents: (startDate?: string, endDate?: string) => Promise<{ success: boolean; data?: CalendarEvent[]; error?: string }>;
    createCalendarEvent: (data: Partial<CalendarEvent>) => Promise<{ success: boolean; data?: CalendarEvent; error?: string }>;
    updateCalendarEvent: (id: number, data: Partial<CalendarEvent>) => Promise<{ success: boolean; data?: CalendarEvent; error?: string }>;
    deleteCalendarEvent: (id: number) => Promise<{ success: boolean; error?: string }>;
    getCalendarSuggestions: (niche?: string, platform?: string) => Promise<{ success: boolean; data?: { predicted_trends: any[], optimal_slots: any[] }; error?: string }>;
    exportCalendar: () => Promise<void>;
    getQuiz: (milestoneId: string) => Promise<{ success: boolean; data?: Quiz; error?: string }>;
    submitQuiz: (milestoneId: string, answers: Record<string, number>) => Promise<{ success: boolean; data?: { score: number; passed: boolean; certificate?: Certificate }; error?: string }>;
    getLeaderboard: () => Promise<{ success: boolean; data?: LeaderboardEntry[]; error?: string }>;
    getUserCertificates: () => Promise<{ success: boolean; data?: Certificate[]; error?: string }>;
    verifyCertificate: (certId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    logout: () => void;
    isLoading: boolean;
    error: string | null;
    token: string | null;
    isAuthenticated: boolean;
    getAlertRules: () => Promise<{ success: boolean; data?: AlertRule[]; error?: string }>;
    createAlertRule: (data: Partial<AlertRule>) => Promise<{ success: boolean; data?: AlertRule; error?: string }>;
    updateAlertRule: (id: number, data: Partial<AlertRule>) => Promise<{ success: boolean; data?: AlertRule; error?: string }>;
    deleteAlertRule: (id: number) => Promise<{ success: boolean; error?: string }>;
    testSms: () => Promise<{ success: boolean; error?: string }>;

    // Content Generator
    generateContent: (data: GenerationRequest) => Promise<{ success: boolean; data?: any; error?: string }>;
    getContentHistory: (limit?: number, offset?: number) => Promise<{ success: boolean; data?: ContentScript[]; total?: number; error?: string }>;
    getContentById: (id: number) => Promise<{ success: boolean; data?: ContentScript; error?: string }>;
    deleteContent: (id: number) => Promise<{ success: boolean; error?: string }>;
    testGroqConnection: () => Promise<{ success: boolean; message?: string; error?: string }>;

    // Creator Collaboration
    getCreatorProfile: () => Promise<{ success: boolean; data?: CreatorProfile; error?: string }>;
    createOrUpdateCreatorProfile: (data: Partial<CreatorProfile>) => Promise<{ success: boolean; data?: CreatorProfile; error?: string }>;
    getCreatorProfileById: (profileId: number) => Promise<{ success: boolean; data?: CreatorProfile; error?: string }>;
    findCollabMatches: (filters?: { niche?: string; min_audience?: number; max_audience?: number; style?: string; limit?: number }) => Promise<{ success: boolean; data?: CollabMatch[]; error?: string }>;
    getCompatibility: (profileId: number) => Promise<{ success: boolean; data?: CollabCompatibility; error?: string }>;
    sendCollabRequest: (receiverId: number, data: { collab_type?: string; message?: string; ai_generated_pitch?: boolean }) => Promise<{ success: boolean; data?: CollabRequest; error?: string }>;
    getCollabRequests: (direction?: 'incoming' | 'outgoing' | 'both') => Promise<{ success: boolean; data?: { incoming: CollabRequest[]; outgoing: CollabRequest[] }; error?: string }>;
    respondToCollabRequest: (requestId: number, accept: boolean, message?: string) => Promise<{ success: boolean; error?: string }>;
    getCollabHistory: (limit?: number) => Promise<{ success: boolean; data?: CollabRequest[]; error?: string }>;
    generateCollabPitch: (receiverId: number) => Promise<{ success: boolean; data?: { pitch: string }; error?: string }>;
    generateCollabIdeas: (profileId: number) => Promise<{ success: boolean; data?: { ideas: CollabIdea[] }; error?: string }>;

    // Competitor Analysis
    addCompetitor: (channelUrl: string) => Promise<{ success: boolean; data?: Competitor; error?: string }>;
    listCompetitors: () => Promise<{ success: boolean; data?: { competitors: Competitor[]; total: number }; error?: string }>;
    getCompetitor: (competitorId: number) => Promise<{ success: boolean; data?: Competitor; error?: string }>;
    deleteCompetitor: (competitorId: number) => Promise<{ success: boolean; error?: string }>;
    syncCompetitor: (competitorId: number) => Promise<{ success: boolean; data?: { videos_added: number }; error?: string }>;
    getViralVideos: (competitorId: number, minScore?: number) => Promise<{ success: boolean; data?: { videos: CompetitorVideo[]; total: number }; error?: string }>;
    analyzeViralVideo: (competitorId: number, videoId: number) => Promise<{ success: boolean; data?: { video: CompetitorVideo; analysis: ViralAnalysis }; error?: string }>;
    getContentGaps: () => Promise<{ success: boolean; data?: ContentGaps; error?: string }>;

    // Analytics & ROI
    trackContent: (data: Partial<ContentPerformance>) => Promise<{ success: boolean; data?: ContentPerformance; error?: string }>;
    getROI: (days?: number) => Promise<{ success: boolean; data?: ROIAnalysis; error?: string }>;
    scoreContent: (data: { title?: string; hook?: string; description?: string; thumbnail_text?: string; platform?: string; niche?: string }) => Promise<{ success: boolean; data?: ContentScore; error?: string }>;
    getWeeklyReport: () => Promise<{ success: boolean; data?: WeeklyReport; error?: string }>;
    createABTest: (data: { test_name: string; test_description?: string; test_variable: string; content_a_id: number; content_b_id: number }) => Promise<{ success: boolean; data?: ABTest; error?: string }>;
    getABTest: (testId: number) => Promise<{ success: boolean; data?: ABTest; error?: string }>;
    listABTests: () => Promise<{ success: boolean; data?: { ab_tests: ABTest[]; total: number }; error?: string }>;
    suggestABTests: (data: { content_type?: string; niche?: string; current_approach?: string; goal?: string }) => Promise<{ success: boolean; data?: string[]; error?: string }>;
    getRevenueAttribution: (days?: number) => Promise<{ success: boolean; data?: any; error?: string }>;
    getContentPerformanceHistory: (limit?: number, offset?: number) => Promise<{ success: boolean; data?: ContentPerformance[]; total?: number; error?: string }>;

    // Niche Finder
    analyzeNiche: (nicheName: string, saveResult?: boolean) => Promise<{ success: boolean; data?: any; error?: string }>;
    exploreNiches: () => Promise<{ success: boolean; data?: any; error?: string }>;
    findMicroNiches: (parentNiche: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    findRelatedNiches: (nicheName: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    getNicheAnalysis: (nicheId: number) => Promise<{ success: boolean; data?: NicheAnalysis; error?: string }>;
    getNicheHistory: (limit?: number, offset?: number) => Promise<{ success: boolean; data?: { niches: NicheAnalysis[]; total: number }; error?: string }>;
    deleteNicheAnalysis: (nicheId: number) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.error || 'Login failed';
                setError(errorMessage);
                setIsLoading(false);
                return { success: false, error: errorMessage };
            }
            const authToken = data.token;
            setToken(authToken);
            localStorage.setItem('auth_token', authToken);
            setIsLoading(false);
            return { success: true };
        } catch (err) {
            setError('Network error occurred');
            setIsLoading(false);
            return { success: false, error: 'Network error occurred' };
        }
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.error || 'Registration failed';
                setError(errorMessage);
                setIsLoading(false);
                return { success: false, error: errorMessage };
            }
            setIsLoading(false);
            return { success: true };
        } catch (err) {
            setError('Network error occurred');
            setIsLoading(false);
            return { success: false, error: 'Network error occurred' };
        }
    }, []);

    const loginWithGoogle = useCallback(async (googleToken: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${googleToken}`,
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.error || 'Google login failed';
                setError(errorMessage);
                setIsLoading(false);
                return { success: false, error: errorMessage };
            }
            const authToken = data.token;
            setToken(authToken);
            localStorage.setItem('auth_token', authToken);
            setIsLoading(false);
            return { success: true };
        } catch (err) {
            setError('Network error occurred');
            setIsLoading(false);
            return { success: false, error: 'Network error occurred' };
        }
    }, []);

    const loginWithGithub = useCallback(async (githubCode: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/github`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: githubCode }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.error || 'GitHub login failed';
                setError(errorMessage);
                setIsLoading(false);
                return { success: false, error: errorMessage };
            }
            const authToken = data.token;
            setToken(authToken);
            localStorage.setItem('auth_token', authToken);
            setIsLoading(false);
            return { success: true };
        } catch (err) {
            setError('Network error occurred');
            setIsLoading(false);
            return { success: false, error: 'Network error occurred' };
        }
    }, []);

    const getProfile = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Handle 422 (token validation failed) - clear invalid token
            if (response.status === 422) {
                console.warn('Token validation failed (422). Clearing stale token.');
                setToken(null);
                localStorage.removeItem('auth_token');
                return { success: false, error: 'Session expired. Please log in again.' };
            }

            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const updateProfile = useCallback(async (email: string) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error };
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const updatePassword = useCallback(async (current_password: string, new_password: string) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/users/me/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current_password, new_password })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error };
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const analyzeTrends = useCallback(async (topic: string) => {
        console.log("TOKEN BEING SENT:", token);

        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/trends/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to analyze trends' };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const analyzeOpinion = useCallback(async (topic: string) => {
        console.log("Analyzing opinion for:", topic);

        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/opinions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to analyze opinion' };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const buildSkillPath = useCallback(async (skill: string) => {
        console.log("Building skill path for:", skill);

        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/skills/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ skill })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to build skill path' };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getDashboardStats = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                // If endpoint doesn't exist, return mock data for now
                return {
                    success: true,
                    data: {
                        activeTrends: 0,
                        sentimentAnalyzed: 0,
                        learningPaths: 0,
                        opportunities: 0,
                        trendsChange: '+0%',
                        sentimentChange: '+0%',
                        pathsChange: '+0%',
                        opportunitiesChange: '+0%'
                    }
                };
            }
            return { success: true, data };
        } catch (err) {
            // Return zeroed stats on error
            return {
                success: true,
                data: {
                    activeTrends: 0,
                    sentimentAnalyzed: 0,
                    learningPaths: 0,
                    opportunities: 0,
                    trendsChange: '+0%',
                    sentimentChange: '+0%',
                    pathsChange: '+0%',
                    opportunitiesChange: '+0%'
                }
            };
        }
    }, [token]);

    const getRecentActivities = useCallback(async (limit: number = 10) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/recent-activities?limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch activities' };
            return { success: true, data: data.activities };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getCalendarEvents = useCallback(async (startDate?: string, endDate?: string) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            let url = `${API_BASE_URL}/calendar/events`;
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch events' };
            return { success: true, data: data.events };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const createCalendarEvent = useCallback(async (eventData: Partial<CalendarEvent>) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/calendar/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to create event' };
            return { success: true, data: data.event };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const updateCalendarEvent = useCallback(async (id: number, eventData: Partial<CalendarEvent>) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to update event' };
            return { success: true, data: data.event };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const deleteCalendarEvent = useCallback(async (id: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/calendar/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const data = await response.json();
                return { success: false, error: data.error || 'Failed to delete event' };
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getCalendarSuggestions = useCallback(async (niche: string = 'Technology', platform: string = 'TikTok') => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/calendar/suggestions?niche=${niche}&platform=${platform}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch suggestions' };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const exportCalendar = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/calendar/export`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return;

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `content_calendar_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Failed to export calendar:', err);
        }
    }, [token]);

    const getQuiz = useCallback(async (milestoneId: string) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/skills/quiz/${milestoneId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch quiz' };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const submitQuiz = useCallback(async (milestoneId: string, answers: Record<string, number>) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/skills/quiz/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ milestone_id: milestoneId, answers })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to submit quiz' };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getLeaderboard = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/skills/leaderboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch leaderboard' };
            return { success: true, data: data.leaderboard };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getUserCertificates = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/skills/certificates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch certificates' };
            return { success: true, data: data.certificates };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const verifyCertificate = useCallback(async (certId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/verify/${certId}`);
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.message || 'Verification failed' };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        localStorage.removeItem('auth_token');
    }, []);

    const getAlertRules = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/rules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch rules' };
            return { success: true, data: data.rules };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const createAlertRule = useCallback(async (ruleData: Partial<AlertRule>) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/rules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ruleData)
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to create rule' };
            return { success: true, data: data.rule };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const updateAlertRule = useCallback(async (id: number, ruleData: Partial<AlertRule>) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/rules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ruleData)
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to update rule' };
            return { success: true, data: data.rule };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const deleteAlertRule = useCallback(async (id: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/rules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const data = await response.json();
                return { success: false, error: data.error || 'Failed to delete rule' };
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const testSms = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/test-sms`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to send test SMS' };
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const generateContent = useCallback(async (genData: GenerationRequest) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/content/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(genData)
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Generation failed' };
            return { success: true, data: data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getContentHistory = useCallback(async (limit = 20, offset = 0) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/content/history?limit=${limit}&offset=${offset}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch history' };
            return { success: true, data: data.contents, total: data.total };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getContentById = useCallback(async (id: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/content/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch content' };
            return { success: true, data: data.content };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const deleteContent = useCallback(async (id: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/content/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Deletion failed' };
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const testGroqConnection = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/content/test-connection`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Connection test failed' };
            return { success: true, message: data.message };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    // ============ CREATOR COLLABORATION API ============

    const getCreatorProfile = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch profile' };
            return { success: true, data: data.profile };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const createOrUpdateCreatorProfile = useCallback(async (profileData: Partial<CreatorProfile>) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to save profile' };
            return { success: true, data: data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getCreatorProfileById = useCallback(async (profileId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/profile/${profileId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Profile not found' };
            return { success: true, data: data.profile };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const findCollabMatches = useCallback(async (filters?: { niche?: string; min_audience?: number; max_audience?: number; style?: string; limit?: number }) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const params = new URLSearchParams();
            if (filters?.niche) params.append('niche', filters.niche);
            if (filters?.min_audience) params.append('min_audience', filters.min_audience.toString());
            if (filters?.max_audience) params.append('max_audience', filters.max_audience.toString());
            if (filters?.style) params.append('style', filters.style);
            if (filters?.limit) params.append('limit', filters.limit.toString());

            const url = `${API_BASE_URL}/collaboration/matches${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to find matches' };
            return { success: true, data: data.matches };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getCompatibility = useCallback(async (profileId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/compatibility/${profileId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to get compatibility' };
            return { success: true, data: { total_score: data.match_score?.total_score, score_breakdown: data.match_score?.score_breakdown, ai_analysis: data.ai_analysis } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const sendCollabRequest = useCallback(async (receiverId: number, requestData: { collab_type?: string; message?: string; ai_generated_pitch?: boolean }) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiver_id: receiverId, ...requestData })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to send request' };
            return { success: true, data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getCollabRequests = useCallback(async (direction: 'incoming' | 'outgoing' | 'both' = 'both') => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/requests?direction=${direction}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch requests' };
            return { success: true, data: { incoming: data.incoming || [], outgoing: data.outgoing || [] } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const respondToCollabRequest = useCallback(async (requestId: number, accept: boolean, message?: string) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/request/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ accept, message })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to respond to request' };
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getCollabHistory = useCallback(async (limit: number = 20) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/history?limit=${limit}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to fetch history' };
            return { success: true, data: data.history };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const generateCollabPitch = useCallback(async (receiverId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/pitch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiver_id: receiverId })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to generate pitch' };
            return { success: true, data: { pitch: data.pitch } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const generateCollabIdeas = useCallback(async (profileId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/collaboration/ideas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profile_id: profileId })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to generate ideas' };
            return { success: true, data: { ideas: data.ideas } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    // ============ COMPETITOR ANALYSIS API ============

    const addCompetitor = useCallback(async (channelUrl: string) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/competitor/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ channel_url: channelUrl })
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to add competitor' };
            return { success: true, data: data };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const listCompetitors = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/competitor/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to list competitors' };
            return { success: true, data: { competitors: data.competitors, total: data.total } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getCompetitor = useCallback(async (competitorId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/competitor/${competitorId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Competitor not found' };
            return { success: true, data: data.competitor };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const deleteCompetitor = useCallback(async (competitorId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/competitor/${competitorId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to delete competitor' };
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const syncCompetitor = useCallback(async (competitorId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/competitor/${competitorId}/sync`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to sync competitor' };
            return { success: true, data: { videos_added: data.videos_added } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getViralVideos = useCallback(async (competitorId: number, minScore: number = 70) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/competitor/${competitorId}/viral?min_score=${minScore}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to get viral videos' };
            return { success: true, data: { videos: data.videos, total: data.total } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const analyzeViralVideo = useCallback(async (competitorId: number, videoId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/competitor/${competitorId}/viral/${videoId}/analyze`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to analyze video' };
            return { success: true, data: { video: data.video, analysis: data.analysis } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getContentGaps = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/competitor/gaps`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Failed to get content gaps' };
            return { success: true, data: data.gaps };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    // ============ ANALYTICS & ROI API ============

    const trackContent = useCallback(async (data: Partial<ContentPerformance>) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to track content' };
            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getROI = useCallback(async (days: number = 30) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/roi?days=${days}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to get ROI analysis' };
            return { success: true, data: result.roi };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const scoreContent = useCallback(async (data: { title?: string; hook?: string; description?: string; thumbnail_text?: string; platform?: string; niche?: string }) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to score content' };
            return { success: true, data: result.score };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getWeeklyReport = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/report/weekly`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to get weekly report' };
            return { success: true, data: result.report };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const createABTest = useCallback(async (data: { test_name: string; test_description?: string; test_variable: string; content_a_id: number; content_b_id: number }) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/ab-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to create A/B test' };
            return { success: true, data: result };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getABTest = useCallback(async (testId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/ab-test/${testId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'A/B test not found' };
            return { success: true, data: result.ab_test };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const listABTests = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/ab-test/list`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to list A/B tests' };
            return { success: true, data: { ab_tests: result.ab_tests, total: result.total } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const suggestABTests = useCallback(async (data: { content_type?: string; niche?: string; current_approach?: string; goal?: string }) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/ab-test/suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to get suggestions' };
            return { success: true, data: result.suggestions };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getRevenueAttribution = useCallback(async (days: number = 30) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/revenue?days=${days}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to get revenue' };
            return { success: true, data: result.revenue };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getContentPerformanceHistory = useCallback(async (limit: number = 20, offset: number = 0) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/analytics/history?limit=${limit}&offset=${offset}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to get history' };
            return { success: true, data: result.history, total: result.total };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    // ============ NICHE FINDER API ============

    const analyzeNiche = useCallback(async (nicheName: string, saveResult: boolean = true) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/niche/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ niche_name: nicheName, save_result: saveResult })
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to analyze niche' };
            return { success: true, data: result.analysis, niche_id: result.niche_id };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const exploreNiches = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/niche/explore`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to explore niches' };
            return { success: true, data: result.trending };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const findMicroNiches = useCallback(async (parentNiche: string) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/niche/micro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ parent_niche: parentNiche })
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to find micro-niches' };
            return { success: true, data: result.micro_niches };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const findRelatedNiches = useCallback(async (nicheName: string) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/niche/related`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ niche_name: nicheName })
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to find related niches' };
            return { success: true, data: result.related };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getNicheAnalysis = useCallback(async (nicheId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/niche/${nicheId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Niche not found' };
            return { success: true, data: result.niche };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const getNicheHistory = useCallback(async (limit: number = 20, offset: number = 0) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/niche/history?limit=${limit}&offset=${offset}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to get history' };
            return { success: true, data: { niches: result.niches, total: result.total } };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const deleteNicheAnalysis = useCallback(async (nicheId: number) => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/niche/${nicheId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) return { success: false, error: result.error || 'Failed to delete niche' };
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token]);

    const deleteAccount = useCallback(async () => {
        if (!token) return { success: false, error: 'No token' };
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const data = await response.json();
                return { success: false, error: data.error };
            }
            logout();
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error' };
        }
    }, [token, logout]);

    return (
        <AuthContext.Provider value={{
            login,
            register,
            loginWithGoogle,
            loginWithGithub,
            getProfile,
            analyzeTrends,
            analyzeOpinion,
            buildSkillPath,
            getDashboardStats,
            getRecentActivities,
            getCalendarEvents,
            createCalendarEvent,
            updateCalendarEvent,
            deleteCalendarEvent,
            getCalendarSuggestions,
            exportCalendar,
            getQuiz,
            submitQuiz,
            getLeaderboard,
            getUserCertificates,
            verifyCertificate,
            updateProfile,
            updatePassword,
            deleteAccount,
            getAlertRules,
            createAlertRule,
            updateAlertRule,
            deleteAlertRule,
            testSms,
            generateContent,
            getContentHistory,
            getContentById,
            deleteContent,
            testGroqConnection,
            // Creator Collaboration
            getCreatorProfile,
            createOrUpdateCreatorProfile,
            getCreatorProfileById,
            findCollabMatches,
            getCompatibility,
            sendCollabRequest,
            getCollabRequests,
            respondToCollabRequest,
            getCollabHistory,
            generateCollabPitch,
            generateCollabIdeas,
            // Competitor Analysis
            addCompetitor,
            listCompetitors,
            getCompetitor,
            deleteCompetitor,
            syncCompetitor,
            getViralVideos,
            analyzeViralVideo,
            getContentGaps,
            // Analytics & ROI
            trackContent,
            getROI,
            scoreContent,
            getWeeklyReport,
            createABTest,
            getABTest,
            listABTests,
            suggestABTests,
            getRevenueAttribution,
            getContentPerformanceHistory,
            // Niche Finder
            analyzeNiche,
            exploreNiches,
            findMicroNiches,
            findRelatedNiches,
            getNicheAnalysis,
            getNicheHistory,
            deleteNicheAnalysis,
            logout,
            isLoading,
            error,
            token,
            isAuthenticated: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
