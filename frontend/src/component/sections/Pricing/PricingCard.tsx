import React from 'react';
import { cn } from '../../../utils';
import { Card } from '../../Card';
import { Button } from '../../common/Button';

export interface PricingCardProps {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted?: boolean;
    buttonText?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
    name,
    price,
    period,
    description,
    features,
    highlighted = false,
    buttonText = 'Get Started',
}) => {
    return (
        <div className={cn('relative', highlighted && 'lg:-mt-4 lg:mb-4')}>
            {highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-blue to-primary-purple text-white text-sm font-semibold rounded-full">
                    Most Popular
                </div>
            )}
            <Card
                variant={highlighted ? 'elevated' : 'outlined'}
                padding="lg"
                className={cn(
                    'h-full',
                    highlighted && 'border-2 border-primary-blue shadow-glow'
                )}
            >
                {/* Plan Name */}
                <h3 className="text-xl font-bold text-neutral-charcoal mb-2">{name}</h3>
                <p className="text-neutral-dark-gray text-sm mb-6">{description}</p>

                {/* Price */}
                <div className="mb-6">
                    <span className="text-4xl font-bold text-neutral-charcoal">{price}</span>
                    <span className="text-neutral-dark-gray">/{period}</span>
                </div>

                {/* CTA Button */}
                <Button
                    variant={highlighted ? 'primary' : 'secondary'}
                    fullWidth
                    className="mb-8"
                >
                    {buttonText}
                </Button>

                {/* Features */}
                <ul className="space-y-3">
                    {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm text-neutral-charcoal">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default PricingCard;