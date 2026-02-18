import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Search,
    CheckCircle,
    Circle,
    Play,
    Clock,
    Target,
    Sparkles,
    AlertCircle,
    ChevronRight,
    ChevronDown,
    Trophy,
    Star,
    Zap,
    RefreshCw,
    ExternalLink,
    Youtube,

    Award,
    X,
    Send,

} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';
import { AnimatedBackground } from '../../component/common/AnimatedBackground';
import { Sidebar } from '../../component/layout/Sidebar';

// Types for Skill Path Results
interface LearningResource {
    id: string;
    title: string;
    type: 'video' | 'article' | 'course' | 'quiz';
    duration: string;
    url: string;
    thumbnail?: string;
    source?: string;
    completed?: boolean;
}

interface SkillMilestone {
    id: string;
    title: string;
    description: string;
    resources: LearningResource[];
    estimatedTime: string;
    isCompleted: boolean;
    isExpanded: boolean;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: number;
}

interface Certificate {
    id: string;
    skill_name: string;
    verification_hash: string;
    share_url: string;
    issued_at: string;
}

interface SkillData {
    skill: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimated_total_time: string;
    milestones: SkillMilestone[];
    quiz?: QuizQuestion[];
    prerequisites?: string[];
    outcomes?: string[];
}

// Skeleton Components
const SkeletonPulse = ({ className }: { className: string }) => (
    <div className={`bg-teal-800/60 rounded animate-pulse ${className}`} />
);

const SkeletonMilestone = () => (
    <div className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20">
        <div className="flex items-center gap-4">
            <SkeletonPulse className="w-12 h-12 rounded-full" />
            <div className="flex-1">
                <SkeletonPulse className="h-5 w-48 mb-2" />
                <SkeletonPulse className="h-4 w-32" />
            </div>
        </div>
    </div>
);

// Difficulty Badge Component
const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
    const config = {
        beginner: {
            color: 'from-emerald-400 to-green-500',
            bgColor: 'bg-emerald-500/20',
            borderColor: 'border-emerald-400/30',
            label: 'Beginner'
        },
        intermediate: {
            color: 'from-amber-400 to-orange-500',
            bgColor: 'bg-amber-500/20',
            borderColor: 'border-amber-400/30',
            label: 'Intermediate'
        },
        advanced: {
            color: 'from-rose-400 to-red-500',
            bgColor: 'bg-rose-500/20',
            borderColor: 'border-rose-400/30',
            label: 'Advanced'
        }
    }[difficulty] || {
        color: 'from-cyan-400 to-blue-500',
        bgColor: 'bg-cyan-500/20',
        borderColor: 'border-cyan-400/30',
        label: difficulty
    };

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.borderColor} border text-white`}
        >
            {config.label}
        </motion.span>
    );
};

// Resource Card Component
const ResourceCard = ({ resource, delay }: { resource: LearningResource; delay: number }) => {
    const getIcon = () => {
        switch (resource.type) {
            case 'video': return Youtube;
            case 'course': return BookOpen;
            case 'quiz': return Target;
            default: return BookOpen;
        }
    };

    const Icon = getIcon();

    return (
        <motion.a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.02, x: 5 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-teal-800/30 border border-white/5 hover:border-cyan-400/30 transition-all cursor-pointer group"
        >
            {resource.thumbnail ? (
                <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white" />
                    </div>
                </div>
            ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-400/20">
                    <Icon className="w-5 h-5 text-cyan-400" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium text-sm truncate group-hover:text-cyan-400 transition-colors">
                    {resource.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-cyan-400/60">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.duration}
                    </span>
                    {resource.source && (
                        <span className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {resource.source}
                        </span>
                    )}
                    <span className="capitalize px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/20">
                        {resource.type}
                    </span>
                </div>
            </div>

            {resource.completed ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
                <ChevronRight className="w-5 h-5 text-cyan-400/40 group-hover:text-cyan-400 transition-colors" />
            )}
        </motion.a>
    );
};

// Milestone Card Component
const MilestoneCard = ({
    milestone,
    index,
    onToggle,
    onTakeQuiz
}: {
    milestone: SkillMilestone;
    index: number;
    onToggle: () => void;
    onTakeQuiz: (milestone: SkillMilestone) => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="relative"
        >
            {/* Connector Line */}
            {index > 0 && (
                <div className="absolute left-6 -top-6 w-0.5 h-6 bg-gradient-to-b from-cyan-400/50 to-cyan-400/20" />
            )}

            <motion.div
                whileHover={{ scale: 1.01 }}
                className={`bg-teal-900/40 backdrop-blur-xl rounded-2xl border transition-all ${milestone.isCompleted
                    ? 'border-emerald-400/30 bg-emerald-500/5'
                    : 'border-cyan-400/20 hover:border-cyan-400/40'
                    }`}
            >
                {/* Header */}
                <motion.button
                    onClick={onToggle}
                    className="w-full p-5 flex items-center gap-4 text-left"
                >
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${milestone.isCompleted
                            ? 'bg-gradient-to-br from-emerald-400 to-green-500'
                            : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                            }`}
                    >
                        {milestone.isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                        ) : (
                            <span>{index + 1}</span>
                        )}
                    </motion.div>

                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {milestone.title}
                            {milestone.isCompleted && (
                                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                    Completed
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-cyan-400/60">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {milestone.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {milestone.resources.length} resources
                            </span>
                        </div>
                    </div>

                    <motion.div
                        animate={{ rotate: milestone.isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                </motion.button>

                {/* Expanded Content */}
                <AnimatePresence>
                    {milestone.isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 pb-5 space-y-3">
                                <p className="text-cyan-100/80 text-sm mb-4">
                                    {milestone.description}
                                </p>
                                {milestone.resources.map((resource, i) => (
                                    <ResourceCard
                                        key={resource.id}
                                        resource={resource}
                                        delay={0.1 + i * 0.05}
                                    />
                                ))}

                                {/* Quiz Action */}
                                {!milestone.isCompleted && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTakeQuiz(milestone);
                                        }}
                                        className="w-full mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-400/30 text-purple-300 font-bold flex items-center justify-center gap-2 hover:from-purple-500/30 hover:to-violet-500/30 transition-all"
                                    >
                                        <Zap className="w-5 h-5 text-amber-400" />
                                        Take Milestone Quiz
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

// Quiz Modal Component
const QuizModal = ({ quiz, onClose, onSubmit }: { quiz: any, onClose: () => void, onSubmit: (answers: Record<string, number>) => void }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});

    const handleAnswer = (optionIndex: number) => {
        setAnswers({ ...answers, [quiz.questions[currentStep].id]: optionIndex });
        if (currentStep < quiz.questions.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const isComplete = Object.keys(answers).length === quiz.questions.length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-teal-950/90 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-teal-900 border border-purple-400/30 rounded-3xl p-8 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-purple-400" />
                            Milestone Assessment
                        </h2>
                        <div className="flex gap-1 mt-2">
                            {quiz.questions.map((_: any, i: number) => (
                                <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-full transition-all ${i === currentStep ? 'bg-purple-400' :
                                        i < currentStep ? 'bg-purple-400/40' : 'bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mb-10 min-h-[200px]">
                    <h3 className="text-xl text-white font-medium mb-6">
                        {quiz.questions[currentStep].question}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {quiz.questions[currentStep].options.map((option: string, i: number) => (
                            <motion.button
                                key={i}
                                whileHover={{ x: 10, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                                onClick={() => handleAnswer(i)}
                                className={`w-full p-4 rounded-xl text-left border transition-all ${answers[quiz.questions[currentStep].id] === i
                                    ? 'border-purple-400 bg-purple-400/20 text-white'
                                    : 'border-white/10 text-white/70 hover:border-purple-400/40'
                                    }`}
                            >
                                <span className="inline-block w-8 h-8 rounded-lg bg-white/5 border border-white/10 mr-4 text-center leading-8 font-bold text-purple-400">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {option}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-purple-400/60 font-medium">Question {currentStep + 1} of {quiz.questions.length}</span>
                    {isComplete && currentStep === quiz.questions.length - 1 && (
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)' }}
                            onClick={() => onSubmit(answers)}
                            className="px-8 py-3 bg-gradient-to-r from-purple-400 to-violet-500 text-white rounded-xl font-bold"
                        >
                            Submit Assessment
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
// Progress Ring Component
const ProgressRing = ({ progress }: { progress: number }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-28 h-28">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="56"
                    cy="56"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-teal-800/50"
                />
                <motion.circle
                    cx="56"
                    cy="56"
                    r="45"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }}
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
                    <div className="text-xs text-cyan-400/60">Complete</div>
                </div>
            </div>
        </div>
    );
};

// Main SkillBridge Page Component
export const SkillBridgePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, buildSkillPath, getQuiz, submitQuiz } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [skillData, setSkillData] = useState<SkillData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeQuiz, setActiveQuiz] = useState<any>(null);
    const [isQuizLoading, setIsQuizLoading] = useState(false);
    const [awardData, setAwardData] = useState<Certificate | null>(null);

    // Default milestones for demo
    const createDefaultMilestones = (skill: string): SkillMilestone[] => [
        {
            id: '1',
            title: `${skill} Fundamentals`,
            description: `Build a strong foundation in ${skill}. Understand the core concepts and terminology.`,
            estimatedTime: '2 hours',
            isCompleted: false,
            isExpanded: true,
            resources: [
                { id: 'r1', title: `Introduction to ${skill}`, type: 'video', duration: '15 min', url: '#', source: 'YouTube' },
                { id: 'r2', title: `${skill} Basics Tutorial`, type: 'course', duration: '45 min', url: '#', source: 'Coursera' },
                { id: 'r3', title: 'Quick Start Guide', type: 'article', duration: '10 min', url: '#' }
            ]
        },
        {
            id: '2',
            title: 'Core Concepts Deep Dive',
            description: 'Explore advanced concepts and build practical understanding through hands-on exercises.',
            estimatedTime: '4 hours',
            isCompleted: false,
            isExpanded: false,
            resources: [
                { id: 'r4', title: 'Advanced Techniques', type: 'video', duration: '30 min', url: '#', source: 'YouTube' },
                { id: 'r5', title: 'Practical Exercises', type: 'course', duration: '2 hours', url: '#', source: 'Udemy' }
            ]
        },
        {
            id: '3',
            title: 'Real-World Projects',
            description: 'Apply your knowledge to real-world scenarios and build portfolio-worthy projects.',
            estimatedTime: '6 hours',
            isCompleted: false,
            isExpanded: false,
            resources: [
                { id: 'r6', title: 'Project Walkthrough', type: 'video', duration: '1 hour', url: '#', source: 'YouTube' },
                { id: 'r7', title: 'Capstone Project', type: 'course', duration: '4 hours', url: '#' }
            ]
        },
        {
            id: '4',
            title: 'Mastery Assessment',
            description: 'Test your knowledge and receive certification for your new skill.',
            estimatedTime: '1 hour',
            isCompleted: false,
            isExpanded: false,
            resources: [
                { id: 'r8', title: 'Final Assessment Quiz', type: 'quiz', duration: '30 min', url: '#' },
                { id: 'r9', title: 'Skill Certification', type: 'course', duration: '30 min', url: '#' }
            ]
        }
    ];

    const fetchSkillPath = async (skill: string) => {
        if (!skill.trim()) return;

        setLoading(true);
        setError(null);

        const result = await buildSkillPath(skill);

        if (result.success && result.data) {
            // Map API response to our SkillData structure
            const milestones = result.data.milestones || createDefaultMilestones(skill);

            setSkillData({
                skill: result.data.skill || skill,
                description: result.data.description || `Master ${skill} with our AI-curated learning path designed for optimal skill acquisition.`,
                difficulty: result.data.difficulty || 'intermediate',
                estimated_total_time: result.data.estimated_total_time || '13 hours',
                milestones: milestones.map((m: any, i: number) => ({
                    ...m,
                    isExpanded: i === 0,
                    isCompleted: m.isCompleted || false
                })),
                prerequisites: result.data.prerequisites || ['Basic computer literacy', 'Willingness to learn'],
                outcomes: result.data.outcomes || [
                    `Understand core ${skill} concepts`,
                    'Build real-world projects',
                    'Earn skill certification'
                ]
            });
        } else {
            setError(result.error || 'Failed to build skill path');
        }

        setLoading(false);
    };

    const handleTakeQuiz = async (milestone: SkillMilestone) => {
        setIsQuizLoading(true);
        const result = await getQuiz(milestone.id);
        if (result.success && result.data) {
            setActiveQuiz(result.data);
        } else {
            setError(result.error || 'Failed to fetch assessment');
        }
        setIsQuizLoading(false);
    };

    const handleQuizSubmit = async (answers: Record<string, number>) => {
        if (!activeQuiz || !skillData) return;

        const result = await submitQuiz(activeQuiz.milestone_id, answers);
        if (result.success && result.data) {
            if (result.data.passed) {
                // Update milestone status
                setSkillData({
                    ...skillData,
                    milestones: skillData.milestones.map(m =>
                        m.id === activeQuiz.milestone_id ? { ...m, isCompleted: true } : m
                    )
                });
                if (result.data.certificate) {
                    setAwardData(result.data.certificate);
                }
                setActiveQuiz(null);
            } else {
                setError('Assessment failed. Please review the materials and try again.');
                setActiveQuiz(null);
            }
        } else {
            setError(result.error || 'Failed to submit assessment');
        }
    };

    const toggleMilestone = (id: string) => {
        if (!skillData) return;

        setSkillData({
            ...skillData,
            milestones: skillData.milestones.map(m =>
                m.id === id ? { ...m, isExpanded: !m.isExpanded } : m
            )
        });
    };

    const calculateProgress = () => {
        if (!skillData) return 0;
        const completed = skillData.milestones.filter(m => m.isCompleted).length;
        return (completed / skillData.milestones.length) * 100;
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

    // Suggested skills
    const suggestedSkills = [
        'Python Programming',
        'Machine Learning',
        'React Development',
        'Data Analysis',
        'Cloud Computing',
        'UI/UX Design'
    ];

    return (
        <div className="min-h-screen relative">
            <AnimatedBackground />
            <Sidebar activeTab="skills" />

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
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/40"
                            >
                                <BookOpen className="w-7 h-7 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                    SkillBridge
                                    <Sparkles className="w-6 h-6 text-purple-400" />
                                </h1>
                                <p className="text-cyan-300 opacity-80">
                                    AI-Powered Personalized Learning Path Generator
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
                                fetchSkillPath(searchQuery);
                            }}
                            className="flex gap-4"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                    type="text"
                                    placeholder="Enter a skill you want to learn..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-purple-400/30 bg-teal-900/40 backdrop-blur-xl text-white placeholder-purple-400/50 focus:outline-none focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/30 transition-all text-lg"
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={loading || !searchQuery.trim()}
                                whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 bg-gradient-to-r from-purple-400 to-violet-500 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Zap className="w-5 h-5" />
                                )}
                                Build Path
                            </motion.button>
                        </motion.form>

                        {/* Suggested Skills */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex gap-2 mt-4 flex-wrap"
                        >
                            <span className="text-purple-400/60 text-sm">Popular:</span>
                            {suggestedSkills.map((skill, i) => (
                                <motion.button
                                    key={skill}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSearchQuery(skill);
                                        fetchSkillPath(skill);
                                    }}
                                    className="px-3 py-1 rounded-lg text-sm bg-purple-800/30 text-purple-300 border border-purple-400/20 hover:border-purple-400/40 transition-all"
                                >
                                    {skill}
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
                        <div className="space-y-4">
                            <SkeletonMilestone />
                            <SkeletonMilestone />
                            <SkeletonMilestone />
                        </div>
                    )}

                    {/* Results */}
                    {!loading && skillData && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Milestones Column */}
                            <div className="lg:col-span-2 space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between mb-6"
                                >
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            <Target className="w-6 h-6 text-purple-400" />
                                            Learning Path: {skillData.skill}
                                        </h2>
                                        <p className="text-cyan-300/70 mt-1">
                                            {skillData.description}
                                        </p>
                                    </div>
                                    <DifficultyBadge difficulty={skillData.difficulty} />
                                </motion.div>

                                {skillData.milestones.map((milestone, index) => (
                                    <MilestoneCard
                                        key={milestone.id}
                                        milestone={milestone}
                                        index={index}
                                        onToggle={() => toggleMilestone(milestone.id)}
                                        onTakeQuiz={() => handleTakeQuiz(milestone)}
                                    />
                                ))}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Progress Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
                                >
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-400" />
                                        Your Progress
                                    </h3>
                                    <div className="flex justify-center mb-4">
                                        <ProgressRing progress={calculateProgress()} />
                                    </div>
                                    <div className="text-center text-cyan-300/60 text-sm">
                                        {skillData.milestones.filter(m => m.isCompleted).length} of {skillData.milestones.length} milestones completed
                                    </div>
                                </motion.div>

                                {/* Time Estimate Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
                                >
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-cyan-400" />
                                        Time Estimate
                                    </h3>
                                    <div className="text-3xl font-bold text-white mb-2">
                                        {skillData.estimated_total_time}
                                    </div>
                                    <div className="text-cyan-300/60 text-sm">
                                        to complete all milestones
                                    </div>
                                </motion.div>

                                {/* Outcomes Card */}
                                {skillData.outcomes && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
                                    >
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Star className="w-5 h-5 text-amber-400" />
                                            What You'll Learn
                                        </h3>
                                        <ul className="space-y-2">
                                            {skillData.outcomes.map((outcome, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.3 + i * 0.1 }}
                                                    className="flex items-start gap-2 text-sm text-cyan-100/80"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                                    {outcome}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}

                                {/* Prerequisites Card */}
                                {skillData.prerequisites && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-teal-900/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-400/20"
                                    >
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Circle className="w-5 h-5 text-cyan-400" />
                                            Prerequisites
                                        </h3>
                                        <ul className="space-y-2">
                                            {skillData.prerequisites.map((prereq, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-center gap-2 text-sm text-cyan-100/70"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                    {prereq}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !skillData && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-6xl mb-6"
                            >
                                📚
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Ready to Build Your Learning Path
                            </h3>
                            <p className="text-cyan-400 opacity-60 max-w-md mx-auto">
                                Enter any skill above to generate a personalized learning roadmap
                                with curated resources, milestones, and assessments.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Quiz Loading Overlay */}
            {isQuizLoading && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-teal-950/80 backdrop-blur-sm">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="p-4 rounded-full bg-purple-400/20 border border-purple-400/30"
                    >
                        <RefreshCw className="w-10 h-10 text-purple-400" />
                    </motion.div>
                </div>
            )}

            {/* Quiz Modal */}
            <AnimatePresence>
                {activeQuiz && (
                    <QuizModal
                        quiz={activeQuiz}
                        onClose={() => setActiveQuiz(null)}
                        onSubmit={handleQuizSubmit}
                    />
                )}
            </AnimatePresence>

            {/* Certificate Award Modal */}
            <AnimatePresence>
                {awardData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-teal-950/95 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="relative w-full max-w-lg bg-teal-900 border-2 border-amber-400/50 rounded-3xl p-10 shadow-[0_0_50px_rgba(251,191,36,0.2)] text-center"
                        >
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/30"
                            >
                                <Award className="w-12 h-12 text-teal-950" />
                            </motion.div>

                            <h2 className="text-3xl font-black text-white mb-2">CERTIFICATE EARNED!</h2>
                            <p className="text-cyan-300/80 mb-8">You have officially mastered <span className="text-amber-400 font-bold">{awardData.skill_name}</span></p>

                            <div className="bg-teal-950/50 rounded-2xl p-6 border border-white/10 mb-8 text-left">
                                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Cryptographic Fingerprint</div>
                                <div className="text-[10px] font-mono text-white/40 break-all">{awardData.verification_hash}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => navigate('/credentials')}
                                    className="py-4 bg-white/5 border border-white/20 rounded-xl text-white font-bold hover:bg-white/10 transition-all"
                                >
                                    VIEW BADGES
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}
                                    className="py-4 bg-blue-600 rounded-xl text-white font-bold flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    SHARE
                                </motion.button>
                            </div>

                            <button
                                onClick={() => setAwardData(null)}
                                className="mt-8 text-cyan-400/40 text-sm hover:text-cyan-400 transition-colors"
                            >
                                Continue Learning
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillBridgePage;
