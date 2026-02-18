import React, { type ReactNode } from 'react';
import { cn } from '../../../utils';

interface ContainerProps {
    children: ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const containerSizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
    children,
    className,
    size = 'xl',
}) => {
    return (
        <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', containerSizes[size], className)}>
            {children}
        </div>
    );
};

export default Container;