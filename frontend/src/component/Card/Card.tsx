import React, { useEffect, useState } from 'react';
import { cn } from '../../utils';
import type { CardProps, CardVariant } from './Card.types';

/**
 * Card Component - OOP Pattern with glass morphism support
 * Features: Bottom-up slide animation on mount with easing
 */
export class CardStyles {
  private static readonly baseStyles = `
    rounded-2xl transition-all duration-300
  `;

  private static readonly variants: Record<CardVariant, string> = {
    default: `
      bg-white border border-neutral-gray
      shadow-md
    `,
    glass: `
      bg-white/85 backdrop-blur-xl
      border border-white/30
      shadow-glass
    `,
    elevated: `
      bg-white
      shadow-glass-lg
    `,
    outlined: `
      bg-transparent
      border-2 border-neutral-gray
    `,
    transparent: `
      bg-transparent backdrop-blur-sm
      border border-white/20
    `,
  };

  private static readonly paddings: Record<string, string> = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  static getStyles(
    variant: CardVariant,
    padding: string,
    hoverEffect: boolean
  ): string {
    return cn(
      this.baseStyles,
      this.variants[variant],
      this.paddings[padding],
      hoverEffect && 'hover:shadow-glass-lg hover:-translate-y-1 cursor-pointer'
    );
  }
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  animate = false,
  hoverEffect = false,
  className,
  style,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (animate) {
      // Small delay to ensure DOM is ready, then trigger animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const baseStyles = CardStyles.getStyles(variant, padding, hoverEffect);

  // Animation styles for bottom-up slide with ease
  const animationStyles = animate
    ? {
      transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
      opacity: isVisible ? 1 : 0,
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      ...style,
    }
    : style;

  return (
    <div
      className={cn(baseStyles, className)}
      style={animationStyles}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;