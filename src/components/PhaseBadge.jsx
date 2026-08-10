import React from 'react';

export default function PhaseBadge({ phase, className = "" }) {
  const getStyles = () => {
    const cleanPhase = phase ? phase.trim().toLowerCase() : '';

    if (cleanPhase.includes('winner')) {
      return {
        container: 'bg-amber-50 dark:bg-amber-950/20 text-accent-dark dark:text-amber-300 border-accent/30 dark:border-accent/40 font-bold',
        text: phase
      };
    } else if (cleanPhase.includes('ongoing') || cleanPhase.includes('starting') || cleanPhase.includes('going') || cleanPhase.includes('live')) {
      return {
        container: 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-semibold',
        text: phase
      };
    } else if (cleanPhase.includes('closed') || cleanPhase.includes('ended')) {
      return {
        container: 'bg-zinc-100 dark:bg-zinc-900/30 text-zinc-400 dark:text-zinc-500 border-zinc-200/80 dark:border-zinc-800/80 font-normal',
        text: phase
      };
    } else {
      // Default / Open / Custom
      return {
        container: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-250/70 dark:border-emerald-900/60 font-semibold',
        text: phase
      };
    }
  };

  const styles = getStyles();
  if (!styles.text) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider ${styles.container} ${className}`}>
      {styles.text}
    </span>
  );
}
