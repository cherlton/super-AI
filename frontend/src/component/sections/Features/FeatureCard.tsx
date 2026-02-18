import React from 'react';
import { cn } from '../../../utils';
import { Card } from '../../Card';

export interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    badge?: string;
    badgeColor?: 'pink' | 'blue' | 'coral';
    delay?: number;
}

const badgeColors = {
    pink: 'bg-accent-pink text-neutral-charcoal',
    blue: 'bg-accent-light-blue text-neutral-charcoal',
    coral: 'bg-accent-coral text-neutral-charcoal',
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    title,
    description,
    badge,
    badgeColor = 'pink',
    delay = 0,
}) => {
    return (
        <Card
            variant="elevated"
            padding="lg"
            animate
            hoverEffect
            className="group"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>

            {/* Badge */}
            {badge && (
                <span className={cn('inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4', badgeColors[badgeColor])}>
                    {badge}
                </span>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold text-neutral-charcoal mb-3">
                {title}
            </h3>

            {/* Description */}
            <p className="text-neutral-dark-gray leading-relaxed">
                {description}
            </p>

            {/* Learn More Link */}
            <a
                href="#"
                className="inline-flex items-center gap-2 mt-6 text-primary-blue font-medium hover:gap-3 transition-all duration-300"
            >
                Learn more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </a>
        </Card>
    );
};

export default FeatureCard;