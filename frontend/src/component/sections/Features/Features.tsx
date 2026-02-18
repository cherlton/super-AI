import React from 'react';
import { Container } from '../../layout/Container';
import { FeatureCard } from './FeatureCard';

// Feature Icons
const TrendIcon = () => (
    <svg className="w-7 h-7 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const SentimentIcon = () => (
    <svg className="w-7 h-7 text-primary-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const LearnIcon = () => (
    <svg className="w-7 h-7 text-accent-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const features = [
    {
        icon: <TrendIcon />,
        title: 'TrendSleuth',
        description: 'Discover viral content gaps and emerging trends before they peak. Our AI analyzes millions of data points to find your next big opportunity.',
        badge: 'Trend Discovery',
        badgeColor: 'blue' as const,
    },
    {
        icon: <SentimentIcon />,
        title: 'OpinionForge',
        description: 'Analyze public sentiment and debates with precision. Understand emotions, arguments, and audience reactions in real-time.',
        badge: 'Sentiment Analysis',
        badgeColor: 'pink' as const,
    },
    {
        icon: <LearnIcon />,
        title: 'SkillBridge',
        description: 'Build personalized learning paths powered by AI. Get adaptive quizzes, progress tracking, and certification-ready content.',
        badge: 'Learning Paths',
        badgeColor: 'coral' as const,
    },
];

export const Features: React.FC = () => {
    return (
        <section id="features" className="py-24 bg-neutral-light-gray">
            <Container>
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-primary-blue/10 text-primary-blue text-sm font-semibold rounded-full mb-4">
                        Core Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-charcoal mb-6">
                        Three powerful modules,
                        <br />
                        <span className="gradient-text">one intelligent platform</span>
                    </h2>
                    <p className="text-lg text-neutral-dark-gray">
                        From trend discovery to sentiment analysis and personalized learning —
                        everything you need to stay ahead in the content game.
                    </p>
                </div>

                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            {...feature}
                            delay={index * 150}
                        />
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default Features;