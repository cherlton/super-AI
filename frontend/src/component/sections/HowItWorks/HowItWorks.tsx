import React from 'react';
import { Container } from '../../layout/Container';

const steps = [
    {
        number: '01',
        title: 'Connect Your Data',
        description: 'Link your YouTube channel, social accounts, or paste any content URL to analyze.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        ),
    },
    {
        number: '02',
        title: 'AI Agents Analyze',
        description: 'Our multi-agent system processes trends, sentiments, and learning patterns simultaneously.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        number: '03',
        title: 'Get Actionable Insights',
        description: 'Receive personalized recommendations, trend alerts, and learning paths tailored to you.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        number: '04',
        title: 'Grow & Learn',
        description: 'Apply insights to your content strategy and track your learning progress over time.',
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
    },
];

export const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="py-24 bg-neutral-charcoal text-white overflow-hidden">
            <Container>
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-full mb-4">
                        How It Works
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        From data to insights
                        <br />
                        <span className="text-primary-blue">in four simple steps</span>
                    </h2>
                    <p className="text-lg text-neutral-gray">
                        Our intelligent pipeline processes your content and delivers
                        actionable intelligence in real-time.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-blue/30 to-transparent -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div
                                key={step.number}
                                className="relative group"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                {/* Step Card */}
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2">
                                    {/* Step Number */}
                                    <div className="text-5xl font-bold text-primary-blue/20 mb-4">
                                        {step.number}
                                    </div>

                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300">
                                        {step.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>

                                    {/* Description */}
                                    <p className="text-neutral-gray text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Arrow (hidden on last item) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                                        <svg className="w-8 h-8 text-primary-blue/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default HowItWorks;