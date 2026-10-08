import React from 'react';

export type ProgressVariant = 'cyan' | 'emerald' | 'amber';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  label?: string;
  subLabel?: string;
  showPercent?: boolean;
  variant?: ProgressVariant;
  animated?: boolean;
  size?: 'sm' | 'md';
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      label,
      subLabel,
      showPercent = true,
      variant = 'cyan',
      animated = true,
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
      <div ref={ref} className={`ui-progress ${className}`.trim()} {...props}>
        {(label || showPercent || subLabel) && (
          <div className="ui-progress__meta">
            <div className="ui-progress__labels">
              {label && <span className="ui-progress__label">{label}</span>}
              {subLabel && <span className="ui-progress__sublabel">{subLabel}</span>}
            </div>
            {showPercent && (
              <span className="ui-progress__percent">{Math.round(clamped)}%</span>
            )}
          </div>
        )}

        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || 'Progress'}
          className={`ui-progress__track ui-progress__track--${size}`}
        >
          <div
            className={`ui-progress__fill ui-progress__fill--${variant} ${animated ? 'ui-progress__fill--animated' : ''}`.trim()}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
