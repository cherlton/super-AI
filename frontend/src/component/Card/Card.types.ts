import type { ReactNode, HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'glass' | 'elevated' | 'outlined' | 'transparent';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animate?: boolean;
  hoverEffect?: boolean;
}