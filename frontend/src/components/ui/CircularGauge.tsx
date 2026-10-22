import React from 'react';

export interface CircularGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  trackColor?: string;
  className?: string;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  percentage,
  size = 72,
  strokeWidth = 4,
  label,
  sublabel,
  color = 'var(--color-primary-container, #00e5ff)',
  trackColor = 'var(--color-surface-container-highest, #2e353f)',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={`circular-gauge-wrapper ${className}`.trim()}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      role="progressbar"
      aria-label={label || 'Progress percentage'}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      {/* Center percentage label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: size > 70 ? '1rem' : '0.8rem',
            fontWeight: 800,
            color: 'var(--color-on-surface, #1E293B)',
            lineHeight: 1.1,
          }}
        >
          {label !== undefined ? label : `${Math.round(clamped)}%`}
        </span>
        {sublabel && (
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--color-on-surface-variant, #475569)',
            }}
          >
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default CircularGauge;
