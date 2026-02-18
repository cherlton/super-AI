import React from 'react';
import { cn } from '../../../utils';
import type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';

/**
 * Button Component - OOP Pattern with variant-based styling
 * Uses composition for flexible button configurations
 */
export class ButtonStyles {
  private static readonly baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold rounded-lg
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-primary-blue/50
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:-translate-y-0.5 active:translate-y-0
  `;

  private static readonly variants: Record<ButtonVariant, string> = {
    primary: `
      bg-gradient-to-r from-primary-blue to-primary-purple
      text-white shadow-lg shadow-primary-blue/25
      hover:shadow-xl hover:shadow-primary-blue/30
    `,
    secondary: `
      bg-white text-primary-blue
      border-2 border-primary-blue
      hover:bg-primary-blue/5
    `,
    outline: `
      bg-transparent text-neutral-charcoal
      border border-neutral-gray
      hover:border-primary-blue hover:text-primary-blue
    `,
    ghost: `
      bg-transparent text-neutral-charcoal
      hover:bg-neutral-light-gray
    `,
  };

  private static readonly sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  static getStyles(variant: ButtonVariant, size: ButtonSize, fullWidth: boolean): string {
    return cn(
      this.baseStyles,
      this.variants[variant],
      this.sizes[size],
      fullWidth && 'w-full'
    );
  }
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const styles = ButtonStyles.getStyles(variant, size, fullWidth);

  return (
    <button
      className={cn(styles, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

export default Button;