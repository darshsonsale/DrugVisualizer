import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      icon,
      iconPosition = 'left',
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClass = 'ui-btn';
    const variantClass = `ui-btn--${variant}`;
    const sizeClass = `ui-btn--${size}`;
    const widthClass = fullWidth ? 'ui-btn--full' : '';
    const loadingClass = isLoading ? 'ui-btn--loading' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`.trim()}
        {...props}
      >
        {isLoading && (
          <span className="ui-btn__spinner" aria-hidden="true" />
        )}
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="ui-btn__icon ui-btn__icon--left">{icon}</span>
        )}
        <span className="ui-btn__content">{children}</span>
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="ui-btn__icon ui-btn__icon--right">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
