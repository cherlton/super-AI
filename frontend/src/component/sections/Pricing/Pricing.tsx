import React from 'react';
import { Container } from '../../layout/Container';
import { PricingCard } from './PricingCard';

const plans = [
    {
        name: 'Starter',
        price: '$0',
        period: 'month',
        description: 'Perfect for exploring the platform',
        features: [
            '100 AI queries/month',
            'Basic trend analysis',
            'Single learning path',
            'Community support',
            '7-day data retention',
        ],
        buttonText: 'Start Free',
    },
    {
        name: 'Pro',
        price: '$29',
        period: 'month',
        description: 'For content creators and marketers',
        features: [
            'Unlimited AI queries',
            'Advanced sentiment analysis',
            'Multiple learning paths',
            'Priority support',
            'API access',
            'Custom reports',
            '30-day data retention',
        ],
        highlighted: true,
        buttonText: 'Start Pro Trial',
    },
    {
        name: 'Enterprise',
        price: '$99',
        period: 'month',
        description: 'For teams and organizations',
        features: [
            'Everything in Pro',
            'Team collaboration',
            'Custom AI training',
            'Dedicated support',
            'SSO & advanced security',
            'Custom integrations',
            'Unlimited data retention',
        ],
        buttonText: 'Contact Sales',
    },
];

export const Pricing: React.FC = () => {
    return (
        <section id="pricing" className="py-24 bg-neutral-light-gray">
            <Container>
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 bg-primary-blue/10 text-primary-blue text-sm font-semibold rounded-full mb-4">
                        Pricing
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-neutral-charcoal mb-6">
                        Simple, transparent pricing
                    </h2>
                    <p className="text-lg text-neutral-dark-gray">
                        Start for free, upgrade when you're ready. No hidden fees, cancel anytime.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                    {plans.map((plan) => (
                        <PricingCard key={plan.name} {...plan} />
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default Pricing;