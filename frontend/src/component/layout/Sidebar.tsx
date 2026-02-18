import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MessageSquare, BookOpen, Home, BarChart3, Users, Layers, Settings, Bell, Calendar, Award, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    activeTab: string;
    setActiveTab?: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = React.useState(false);

    const navItems = [
        { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
        { id: 'competitors', icon: TrendingUp, label: 'Competitor Pulse', path: '/competitors' },
        { id: 'sentiment', icon: MessageSquare, label: 'Sentiment Navigator', path: '/opinion' },
        { id: 'skills', icon: BookOpen, label: 'Skill Path Builder', path: '/skills' },
        { id: 'credentials', icon: Award, label: 'Achievements', path: '/credentials' },
        { id: 'alerts', icon: Bell, label: 'Trend Alerts', path: '/alerts' },
        { id: 'calendar', icon: Calendar, label: 'Content Calendar', path: '/calendar' },
        { id: 'analytics', icon: BarChart3, label: 'Performance ROI', path: '/analytics' },
        { id: 'niche', icon: Target, label: 'Niche Radar', path: '/niche-finder' },
        { id: 'collab', icon: Users, label: 'Collab Matchmaker', path: '/collab' },
    ];

    const bottomItems = [
        { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleNavigation = (id: string, path: string) => {
        if (setActiveTab) setActiveTab(id);
        if (path !== '#') navigate(path);
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{
                x: 0,
                opacity: 1,
                width: isExpanded ? 240 : 80
            }}
            transition={{ type: "spring", bounce: 0.2 }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="fixed left-0 top-20 h-[calc(100vh-5rem)] bg-teal-900/40 backdrop-blur-xl border-r border-cyan-400/20 flex flex-col py-6 z-40"
            style={{ width: isExpanded ? 240 : 80 }}
        >
            {/* Logo */}
            <motion.div
                className="mb-8 px-5"
                whileHover={{ scale: 1.1, rotate: 5 }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50 flex-shrink-0">
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{
                            opacity: isExpanded ? 1 : 0,
                            width: isExpanded ? 'auto' : 0
                        }}
                        className="text-white font-bold text-lg whitespace-nowrap overflow-hidden"
                    >
                        Insight-Sphere
                    </motion.span>
                </div>
            </motion.div>

            {/* Main Navigation */}
            <div className="flex-1 flex flex-col gap-2 px-4 overflow-hidden">
                {navItems.map((item, index) => (
                    <motion.button
                        key={item.id}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleNavigation(item.id, item.path)}
                        className={`h-12 rounded-xl flex items-center transition-all relative ${activeTab === item.id
                            ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                            : 'text-cyan-300 hover:bg-teal-800/60 hover:text-cyan-200'
                            }`}
                        style={{
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                            paddingLeft: isExpanded ? '16px' : '0'
                        }}
                        title={item.label}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{
                                opacity: isExpanded ? 1 : 0,
                                width: isExpanded ? 'auto' : 0,
                                marginLeft: isExpanded ? '12px' : '0'
                            }}
                            className="whitespace-nowrap overflow-hidden font-medium"
                        >
                            {item.label}
                        </motion.span>
                    </motion.button>
                ))}
            </div>

            {/* Bottom Navigation */}
            <div className="flex flex-col gap-2 px-4">
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-12 rounded-xl flex items-center text-cyan-300 hover:bg-teal-800/60 hover:text-cyan-200 transition-all relative"
                    style={{
                        justifyContent: isExpanded ? 'flex-start' : 'center',
                        paddingLeft: isExpanded ? '16px' : '0'
                    }}
                >
                    <Bell className="w-5 h-5 flex-shrink-0" />
                    <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{
                            opacity: isExpanded ? 1 : 0,
                            width: isExpanded ? 'auto' : 0,
                            marginLeft: isExpanded ? '12px' : '0'
                        }}
                        className="whitespace-nowrap overflow-hidden font-medium"
                    >
                        Notifications
                    </motion.span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                </motion.button>
                {bottomItems.map((item) => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleNavigation(item.id, item.path)}
                        className={`h-12 rounded-xl flex items-center transition-all ${activeTab === item.id
                            ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                            : 'text-cyan-300 hover:bg-teal-800/60 hover:text-cyan-200'
                            }`}
                        style={{
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                            paddingLeft: isExpanded ? '16px' : '0'
                        }}
                        title={item.label}
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{
                                opacity: isExpanded ? 1 : 0,
                                width: isExpanded ? 'auto' : 0,
                                marginLeft: isExpanded ? '12px' : '0'
                            }}
                            className="whitespace-nowrap overflow-hidden font-medium"
                        >
                            {item.label}
                        </motion.span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};
