import React from 'react';
import { Container } from '../../layout/Container';
import { Button } from '../../common/Button';

export const CTA: React.FC = () => {
    return (
        <section className="py-24 hero-gradient overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-purple/20 rounded-full blur-3xl" />
            </div>

            <Container className="relative z-10">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Ready to unlock
                        <br />
                        intelligent insights?
                    </h2>
                    <p className="text-lg text-white/80 mb-10">
                        Join thousands of content creators, marketers, and learners who are already
                        using Insight-Sphere to stay ahead.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="primary"
                            size="lg"
                            className="bg-white text-primary-blue hover:bg-neutral-light-gray shadow-xl"
                        >
                            Get Started Free
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-white border-white/30 hover:bg-white/10"
                        >
                            Schedule Demo
                        </Button>
                    </div>

                    {/* Trust indicators */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/60">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>14-day free trial</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default CTA;