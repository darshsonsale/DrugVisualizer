import React from 'react';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'floating';
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      title,
      subtitle,
      headerAction,
      footer,
      variant = 'default',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`ui-panel ui-panel--${variant} ${className}`.trim()}
        {...props}
      >
        {(title || headerAction) && (
          <div className="ui-panel__header">
            <div className="ui-panel__title-box">
              {title && <h2 className="ui-panel__title">{title}</h2>}
              {subtitle && <p className="ui-panel__subtitle">{subtitle}</p>}
            </div>
            {headerAction && <div className="ui-panel__action">{headerAction}</div>}
          </div>
        )}

        <div className="ui-panel__body">{children}</div>

        {footer && <div className="ui-panel__footer">{footer}</div>}
      </div>
    );
  }
);

Panel.displayName = 'Panel';
