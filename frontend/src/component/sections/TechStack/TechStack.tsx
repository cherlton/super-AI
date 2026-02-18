import React from 'react';
import { Container } from '../../layout/Container';

const technologies = [
    { name: 'React', category: 'Frontend', color: '#61DAFB' },
    { name: 'TypeScript', category: 'Frontend', color: '#3178C6' },
    { name: 'Tailwind CSS', category: 'Frontend', color: '#06B6D4' },
    { name: 'Python', category: 'Backend', color: '#3776AB' },
    { name: 'FastAPI', category: 'Backend', color: '#009688' },
    { name: 'OpenAI', category: 'AI', color: '#412991' },
    { name: 'Gemini', category: 'AI', color: '#4285F4' },
    { name: 'Claude', category: 'AI', color: '#D4A574' },
    { name: 'Pinecone', category: 'Database', color: '#000000' },
    { name: 'YouTube API', category: 'Integration', color: '#FF0000' },
];

export const TechStack: React.FC = () => {
    return (
        <section id="tech-stack" className="py-24 bg-gradient-to-br from-neutral-charcoal to-gray-900 text-white overflow-hidden">
            <Container>
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-full mb-4">
                        Technology Stack
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Powered by
                        <br />
                        <span className="text-primary-blue">cutting-edge technology</span>
                    </h2>
                    <p className="text-lg text-neutral-gray">
                        We use the best tools in modern development, AI, and data processing
                        to deliver exceptional performance and intelligence.
                    </p>
                </div>

                {/* Tech Cards - Marquee Effect */}
                <div className="relative">
                    <div className="flex flex-wrap justify-center gap-4">
                        {technologies.map((tech) => (
                            <div
                                key={tech.name}
                                className="group flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tech.color }}
                                />
                                <span className="font-medium">{tech.name}</span>
                                <span className="text-xs text-neutral-gray px-2 py-0.5 bg-white/5 rounded-full">
                                    {tech.category}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Architecture Diagram Preview */}
                <div className="mt-16 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                    <h3 className="text-xl font-bold mb-6 text-center">System Architecture</h3>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
                        {['Frontend', 'API Gateway', 'Supervisor AI', 'Worker Agents', 'AI APIs / Data'].map((item, i) => (
                            <React.Fragment key={item}>
                                <div className="px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-purple rounded-lg font-medium">
                                    {item}
                                </div>
                                {i < 4 && (
                                    <svg className="w-6 h-6 text-primary-blue hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default TechStack;