import React from 'react';

export default function StatusBadge({ status, className = "" }) {
  const getBadgeDetails = () => {
    switch (status) {
      case 'Started':
        return {
          styles: 'bg-red-50 dark:bg-red-950/20 text-red-750 dark:text-red-300 border-red-200 dark:border-red-900/60 font-bold uppercase text-[10px] tracking-wider',
          label: (
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
              </span>
              <span>LIVE</span>
            </span>
          )
        };
      case 'Ended':
        return {
          styles: 'bg-zinc-100 dark:bg-zinc-900/40 text-zinc-450 dark:text-zinc-500 border-zinc-200/80 dark:border-zinc-800/80 font-normal uppercase text-[10px] tracking-wider',
          label: 'Concluded'
        };
      case 'Upcoming':
      default:
        return {
          styles: 'bg-zinc-50 dark:bg-zinc-900/20 text-zinc-650 dark:text-zinc-350 border-zinc-200/80 dark:border-zinc-800/80 font-medium uppercase text-[10px] tracking-wider',
          label: 'Upcoming'
        };
    }
  };

  const { styles, label } = getBadgeDetails();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded border ${styles} ${className}`}>
      {label}
    </span>
  );
}
