import React from 'react';
import { Container } from '../../layout/Container';
import { AgentCard } from './AgentCard';

const agents = [
    {
        name: 'Trend Agent',
        role: 'Content Discovery Specialist',
        description: 'Identifies viral content gaps and emerging trends before they peak, giving you first-mover advantage.',
        capabilities: [
            'Viral content gap detection',
            'Emerging trend forecasting',
            'Competitor content analysis',
            'Niche opportunity mapping',
        ],
        color: 'blue' as const,
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
    },
    {
        name: 'Opinion Agent',
        role: 'Sentiment Analysis Expert',
        description: 'Extracts emotions, arguments, and public sentiment from comments and discussions at scale.',
        capabilities: [
            'Real-time sentiment tracking',
            'Emotion pattern recognition',
            'Debate point extraction',
            'Audience mood analysis',
        ],
        color: 'purple' as const,
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
    },
    {
        name: 'Skill Agent',
        role: 'Learning Path Architect',
        description: 'Builds personalized learning paths and adaptive quizzes based on your goals and progress.',
        capabilities: [
            'Custom learning path generation',
            'Adaptive quiz creation',
            'Progress tracking & analytics',
            'Skill gap identification',
        ],
        color: 'coral' as const,
        icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
];

export const Agents: React.FC = () => {
    return (
        <section id="agents" className="py-24 bg-neutral-light-gray">
            <Container>
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-primary-purple/10 text-primary-purple text-sm font-semibold rounded-full mb-4">
                        Multi-Agent AI
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-charcoal mb-6">
                        Meet your AI team
                    </h2>
                    <p className="text-lg text-neutral-dark-gray">
                        Our Supervisor Agent orchestrates specialized agents that work together
                        to deliver comprehensive insights across trends, sentiment, and learning.
                    </p>
                </div>

                {/* Supervisor Agent */}
                <div className="mb-12">
                    <div className="bg-gradient-to-r from-primary-blue via-primary-purple to-accent-coral p-[2px] rounded-2xl">
                        <div className="bg-white rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-blue to-primary-purple flex items-center justify-center text-white flex-shrink-0">
                                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-2xl font-bold text-neutral-charcoal mb-2">Supervisor Agent</h3>
                                <p className="text-neutral-dark-gray">
                                    The orchestrator that receives your requests and intelligently delegates tasks to specialized agents,
                                    ensuring optimal results through coordinated multi-agent processing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agent Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {agents.map((agent) => (
                        <AgentCard key={agent.name} {...agent} />
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default Agents;