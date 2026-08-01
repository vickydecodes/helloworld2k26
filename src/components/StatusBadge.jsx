import React from 'react';

export default function StatusBadge({ status, className = "" }) {
  const getStyles = () => {
    switch (status) {
      case 'Live':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-250/70 dark:border-amber-900/60 font-semibold uppercase text-[10px] tracking-wider';
      case 'Ended':
        return 'bg-zinc-100 dark:bg-zinc-900/40 text-zinc-450 dark:text-zinc-500 border-zinc-200/80 dark:border-zinc-800/80 font-normal uppercase text-[10px] tracking-wider';
      case 'Upcoming':
      default:
        return 'bg-zinc-50 dark:bg-zinc-900/20 text-zinc-600 dark:text-zinc-350 border-zinc-200/80 dark:border-zinc-800/80 font-medium uppercase text-[10px] tracking-wider';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded border ${getStyles()} ${className}`}>
      {status}
    </span>
  );
}
