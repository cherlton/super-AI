import React from 'react';
import { Container } from '../../layout/Container';
import { Button } from '../../common/Button';
import { HeroFloatingCard, type FloatingCardData } from './HeroFloatingCard';
import type { HeroProps } from './Hero.types';

// Icons as SVG components
const TrendIcon = () => (
    <svg className="w-5 h-5 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const SentimentIcon = () => (
    <svg className="w-5 h-5 text-primary-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const LearnIcon = () => (
    <svg className="w-5 h-5 text-accent-coral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const AIIcon = () => (
    <svg className="w-5 h-5 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

// Floating cards data
const floatingCards: FloatingCardData[] = [
    {
        id: 'trend',
        title: 'TrendSleuth',
        description: 'Discovered 24 viral content gaps in your niche this week',
        icon: <TrendIcon />,
        badge: 'Live',
        position: 'left',
        animationDelay: '',
    },
    {
        id: 'sentiment',
        title: 'OpinionForge',
        description: 'Analyzing 12.4K comments with 78% positive sentiment',
        icon: <SentimentIcon />,
        position: 'right',
        animationDelay: 'animation-delay-200',
    },
    {
        id: 'learn',
        title: 'SkillBridge',
        description: 'Your personalized AI learning path is ready',
        icon: <LearnIcon />,
        badge: 'New',
        position: 'left',
        animationDelay: 'animation-delay-400',
    },
    {
        id: 'ai',
        title: 'Multi-Agent AI',
        description: 'Supervisor delegating tasks to specialized agents',
        icon: <AIIcon />,
        position: 'right',
        animationDelay: 'animation-delay-600',
    },
];

export const Hero: React.FC<HeroProps> = ({
    title = 'AI Intelligence,',
    subtitle = 'everywhere you learn',
    description = 'Trends, Sentiment, and Personalized Learning — powered by multi-agent AI that works across every platform',
    primaryCTA = { label: 'Get Started Free' },
    secondaryCTA = { label: 'Watch Demo' },
}) => {
    return (
        <section className="relative min-h-screen hero-gradient overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-purple/20 rounded-full blur-3xl" />
            </div>

            {/* Main content */}
            <Container className="relative z-10 pt-32 pb-20">
                <div className="flex flex-col items-center text-center">
                    {/* Badge */}
                    <div className="animate-slide-up mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Powered by OpenAI, Gemini & Claude
                        </span>
                    </div>

                    {/* Headline */}
                    <h1 className="animate-slide-up animation-delay-200 text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl">
                        {title}
                        <br />
                        <span className="text-white/90">{subtitle}</span>
                    </h1>

                    {/* Description */}
                    <p className="animate-slide-up animation-delay-400 text-lg md:text-xl text-white/80 max-w-2xl mb-10">
                        {description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="animate-slide-up animation-delay-600 flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="primary"
                            size="lg"
                            className="bg-neutral-charcoal hover:bg-black text-white shadow-xl"
                            onClick={primaryCTA.onClick}
                        >
                            {primaryCTA.label}
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-white border-white/30 hover:bg-white/10"
                            onClick={secondaryCTA.onClick}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            {secondaryCTA.label}
                        </Button>
                    </div>

                    {/* Trusted by section */}
                    <div className="animate-fade-in animation-delay-600 mt-16 text-center">
                        <p className="text-white/60 text-sm mb-4">Trusted by leading organizations</p>
                        <div className="flex items-center justify-center gap-8 opacity-70">
                            {['Google', 'Meta', 'OpenAI', 'Microsoft', 'Amazon'].map((company) => (
                                <span key={company} className="text-white/80 font-semibold text-lg">
                                    {company}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>

            {/* Floating Cards - positioned absolutely */}
            <div className="hidden lg:block">
                {/* Top Left Card */}
                <div className="absolute top-40 left-8 xl:left-16">
                    <HeroFloatingCard data={floatingCards[0]} />
                </div>

                {/* Top Right Card */}
                <div className="absolute top-52 right-8 xl:right-16">
                    <HeroFloatingCard data={floatingCards[1]} />
                </div>

                {/* Bottom Left Card */}
                <div className="absolute bottom-40 left-12 xl:left-24">
                    <HeroFloatingCard data={floatingCards[2]} />
                </div>

                {/* Bottom Right Card */}
                <div className="absolute bottom-32 right-12 xl:right-24">
                    <HeroFloatingCard data={floatingCards[3]} />
                </div>
            </div>

            {/* Central Image/Illustration Area */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 md:h-80">
                <div className="absolute inset-0 bg-gradient-to-t from-primary-purple/50 to-transparent rounded-t-3xl" />
                {/* You can add an image here */}
                {/* <img src="/hero-image.png" alt="AI Intelligence" className="w-full h-full object-cover object-top rounded-t-3xl" /> */}
            </div>
        </section>
    );
};

export default Hero;