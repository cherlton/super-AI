import React from 'react';
import { Container } from '../../layout/Container';
import { Card } from '../../Card';

const useCases = [
    {
        title: 'Content Creators',
        description: 'Discover trending topics, analyze audience sentiment, and create content that resonates.',
        image: '👨‍💻',
        features: ['Trend discovery', 'Audience analysis', 'Content optimization'],
    },
    {
        title: 'Marketers',
        description: 'Track brand sentiment, identify market opportunities, and measure campaign impact.',
        image: '📊',
        features: ['Sentiment tracking', 'Competitor insights', 'ROI metrics'],
    },
    {
        title: 'Self-Learners',
        description: 'Get personalized learning paths, adaptive quizzes, and track your skill development.',
        image: '🎓',
        features: ['Custom learning paths', 'Progress tracking', 'Skill certification'],
    },
    {
        title: 'Educators',
        description: 'Create engaging curriculum, assess student progress, and adapt to learning patterns.',
        image: '👩‍🏫',
        features: ['Curriculum design', 'Student analytics', 'Adaptive content'],
    },
];

export const UseCases: React.FC = () => {
    return (
        <section id="use-cases" className="py-24 bg-white">
            <Container>
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-accent-pink/30 text-neutral-charcoal text-sm font-semibold rounded-full mb-4">
                        Who It's For
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-charcoal mb-6">
                        Built for creators,
                        <br />
                        <span className="gradient-text">learners, and leaders</span>
                    </h2>
                    <p className="text-lg text-neutral-dark-gray">
                        Whether you're building an audience, marketing a brand, or mastering new skills —
                        Insight-Sphere adapts to your needs.
                    </p>
                </div>

                {/* Use Case Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {useCases.map((useCase, index) => (
                        <Card
                            key={useCase.title}
                            variant="glass"
                            padding="lg"
                            animate
                            hoverEffect
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start gap-6">
                                <div className="text-5xl">{useCase.image}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-charcoal mb-2">{useCase.title}</h3>
                                    <p className="text-neutral-dark-gray mb-4">{useCase.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {useCase.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="px-3 py-1 bg-neutral-light-gray text-neutral-dark-gray text-sm rounded-full"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default UseCases;