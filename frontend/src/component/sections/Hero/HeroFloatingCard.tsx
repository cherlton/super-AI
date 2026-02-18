import React from 'react';
import { cn } from '../../../utils';
import { Card } from '../../Card';

export interface FloatingCardData {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
    position: 'left' | 'right';
    animationDelay?: string;
}

interface HeroFloatingCardProps {
    data: FloatingCardData;
}

export const HeroFloatingCard: React.FC<HeroFloatingCardProps> = ({ data }) => {
    const positionStyles = {
        left: 'left-4 lg:left-12',
        right: 'right-4 lg:right-12',
    };

    return (
        <Card
            variant="glass"
            padding="sm"
            className={cn(
                'absolute w-64 md:w-72',
                'animate-float',
                positionStyles[data.position],
                data.animationDelay
            )}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-blue/10 to-primary-purple/10 flex items-center justify-center">
                    {data.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-neutral-charcoal text-sm truncate">
                            {data.title}
                        </h4>
                        {data.badge && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-accent-pink/50 text-neutral-charcoal rounded-full">
                                {data.badge}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-neutral-dark-gray line-clamp-2">
                        {data.description}
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default HeroFloatingCard;