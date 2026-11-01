import React from 'react';
import styles from './SkeletonShimmer.module.css';

export interface SkeletonShimmerProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: 'rect' | 'circle' | 'text';
  className?: string;
  animate?: boolean;
}

export const SkeletonShimmer: React.FC<SkeletonShimmerProps> = ({
  width = '100%',
  height = '20px',
  borderRadius,
  variant = 'rect',
  className = '',
  animate = true,
}) => {
  const formattedWidth = typeof width === 'number' ? `${width}px` : width;
  const formattedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        ${styles.shimmer}
        ${animate ? styles.animated : ''}
        ${styles[variant] || ''}
        ${className}
      `.trim()}
      style={{
        width: formattedWidth,
        height: formattedHeight,
        ...(borderRadius ? { borderRadius } : {}),
      }}
      aria-hidden="true"
    />
  );
};
