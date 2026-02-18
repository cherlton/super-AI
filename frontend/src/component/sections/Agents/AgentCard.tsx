import React from 'react';
import { Card } from '../../Card';

export interface AgentCardProps {
    name: string;
    role: string;
    description: string;
    capabilities: string[];
    color: 'blue' | 'purple' | 'coral';
    icon: React.ReactNode;
}

const colorClasses = {
    blue: {
        gradient: 'from-primary-blue to-blue-400',
        bg: 'bg-primary-blue/10',
        text: 'text-primary-blue',
        border: 'border-primary-blue/20',
    },
    purple: {
        gradient: 'from-primary-purple to-purple-400',
        bg: 'bg-primary-purple/10',
        text: 'text-primary-purple',
        border: 'border-primary-purple/20',
    },
    coral: {
        gradient: 'from-accent-coral to-orange-300',
        bg: 'bg-accent-coral/20',
        text: 'text-orange-600',
        border: 'border-accent-coral/30',
    },
};

export const AgentCard: React.FC<AgentCardProps> = ({
    name,
    role,
    description,
    capabilities,
    color,
    icon,
}) => {
    const colors = colorClasses[color];

    return (
        <Card variant="outlined" padding="lg" hoverEffect className={`border-2 ${colors.border}`}>
            {/* Agent Avatar */}
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center mb-6 text-white`}>
                {icon}
            </div>

            {/* Name & Role */}
            <div className="mb-4">
                <h3 className="text-xl font-bold text-neutral-charcoal">{name}</h3>
                <p className={`text-sm font-medium ${colors.text}`}>{role}</p>
            </div>

            {/* Description */}
            <p className="text-neutral-dark-gray mb-6">{description}</p>

            {/* Capabilities */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-dark-gray uppercase tracking-wider">Capabilities</p>
                <ul className="space-y-2">
                    {capabilities.map((cap) => (
                        <li key={cap} className="flex items-center gap-2 text-sm text-neutral-charcoal">
                            <svg className={`w-4 h-4 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {cap}
                        </li>
                    ))}
                </ul>
            </div>
        </Card>
    );
};

export default AgentCard;