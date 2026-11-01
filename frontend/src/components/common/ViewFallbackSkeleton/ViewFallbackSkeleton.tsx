import React from 'react';
import { SkeletonShimmer } from '../SkeletonShimmer/SkeletonShimmer';
import styles from './ViewFallbackSkeleton.module.css';

export interface ViewFallbackSkeletonProps {
  tab?: string;
}

export const ViewFallbackSkeleton: React.FC<ViewFallbackSkeletonProps> = ({ tab = 'default' }) => {
  return (
    <div className={styles.fallbackContainer} role="status" aria-busy="true">
      {/* Header bar skeleton */}
      <div className={styles.headerSkeleton}>
        <div className={styles.headerTexts}>
          <SkeletonShimmer variant="text" width={220} height={24} />
          <SkeletonShimmer variant="text" width={340} height={14} />
        </div>
        <SkeletonShimmer variant="rect" width={140} height={36} borderRadius="var(--radius-sm)" />
      </div>

      {tab === 'dashboard' && (
        <>
          <div className={styles.gridKpis}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.cardSkeleton}>
                <SkeletonShimmer variant="text" width="50%" height={14} />
                <SkeletonShimmer variant="text" width="80%" height={28} />
                <SkeletonShimmer variant="text" width="40%" height={12} />
              </div>
            ))}
          </div>
          <div className={styles.tableSkeletonCard}>
            <SkeletonShimmer variant="rect" width="100%" height={260} borderRadius="var(--radius-md)" />
          </div>
        </>
      )}

      {tab === 'pos' && (
        <div className={styles.posGridSkeleton}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.cardSkeleton}>
              <SkeletonShimmer variant="text" width="40%" height={12} />
              <SkeletonShimmer variant="text" width="90%" height={16} />
              <SkeletonShimmer variant="text" width="60%" height={20} />
            </div>
          ))}
        </div>
      )}

      {tab !== 'dashboard' && tab !== 'pos' && (
        <div className={styles.tableSkeletonCard}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <SkeletonShimmer variant="rect" width={240} height={34} />
            <SkeletonShimmer variant="rect" width={160} height={34} />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonShimmer key={i} variant="rect" width="100%" height={38} />
          ))}
        </div>
      )}
    </div>
  );
};

