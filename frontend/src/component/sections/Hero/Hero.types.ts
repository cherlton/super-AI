export interface HeroProps {
    title?: string;
    subtitle?: string;
    description?: string;
    primaryCTA?: {
        label: string;
        onClick?: () => void;
    };
    secondaryCTA?: {
        label: string;
        onClick?: () => void;
    };
}