import React from 'react';

export type StatVariant = 'cyan' | 'emerald' | 'amber' | 'neutral';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: string;
  variant?: StatVariant;
  highlight?: boolean;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      label,
      value,
      unit,
      description,
      icon,
      variant = 'cyan',
      highlight = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`ui-stat ui-stat--${variant} ${highlight ? 'ui-stat--highlight' : ''} ${className}`.trim()}
        {...props}
      >
        <div className="ui-stat__header">
          <span className="ui-stat__label">{label}</span>
          {icon && (
            <span className="material-symbols-outlined ui-stat__icon" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        <div className="ui-stat__body">
          <span className="ui-stat__value">{value}</span>
          {unit && <span className="ui-stat__unit">{unit}</span>}
        </div>

        {description && <p className="ui-stat__desc">{description}</p>}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
