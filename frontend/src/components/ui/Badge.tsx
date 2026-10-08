import React from 'react';

export type BadgeVariant = 'cyan' | 'emerald' | 'amber' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'cyan', size = 'md', dot = false, className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`.trim()}
        {...props}
      >
        {dot && <span className="ui-badge__dot" aria-hidden="true" />}
        <span className="ui-badge__label">{children}</span>
      </span>
    );
  }
);

Badge.displayName = 'Badge';
