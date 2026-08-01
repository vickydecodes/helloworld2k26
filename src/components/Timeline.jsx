import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PhaseBadge from './PhaseBadge';

export default function Timeline({ events }) {
  // Sort events chronologically by index, fallback to start time
  const sortedEvents = [...events].sort((a, b) => (a.index - b.index) || a.startTime.localeCompare(b.startTime));

  // Format times nicely (e.g., "09:00 AM")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  return (
    <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60 border-t border-b border-zinc-200/70 dark:border-zinc-800/60">
      {sortedEvents.map((event) => {
        const status = event.status;
        const isLive = status === 'Started';
        const isEnded = status === 'Ended';

        return (
          <div 
            key={event.id}
            className={`py-7 md:py-9 flex flex-col md:flex-row md:items-start gap-4 md:gap-8 transition-all duration-300 ${
              isEnded ? 'opacity-50' : ''
            }`}
          >
            {/* 1. Left Time Frame */}
            <div className="w-full md:w-[140px] flex-shrink-0">
              <div className="text-base font-bold text-zinc-955 dark:text-zinc-55">
                {formatTime(event.startTime)}
              </div>
              <div className="text-[10px] md:text-xs text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">
                to {formatTime(event.endTime)}
              </div>
            </div>

            {/* 2. Stepper Dot Indicator & Mobile Badges */}
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isLive 
                  ? 'bg-accent shadow-[0_0_8px_rgba(184,144,71,0.5)]' 
                  : isEnded 
                    ? 'bg-zinc-305 dark:bg-zinc-700' 
                    : 'bg-zinc-200 dark:bg-zinc-800'
              }`}></span>
              
              <div className="md:hidden flex items-center gap-1.5 flex-wrap">
                {event.phase && <PhaseBadge phase={event.phase} />}
                <StatusBadge status={status} />
              </div>
            </div>

            {/* 3. Right Content Column */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 max-w-xl flex-1 min-w-0">
                  <Link 
                    to={`/event/${event.id}`}
                    className="group inline-flex items-center gap-1 text-lg font-bold text-zinc-955 dark:text-zinc-55 hover:text-accent dark:hover:text-accent transition-colors duration-200"
                  >
                    <span>{event.name}</span>
                    <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-650 group-hover:text-accent transform group-hover:translate-x-1 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100" />
                  </Link>
                  
                  {event.description && (
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Desktop Badges & Venue Column */}
                <div className="hidden md:flex flex-col items-end gap-1.5 md:max-w-[200px] text-right flex-shrink">
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {event.phase && <PhaseBadge phase={event.phase} />}
                    <StatusBadge status={status} />
                  </div>
                  {event.venue && (
                    <span className="text-[10px] md:text-xs text-zinc-450 dark:text-zinc-500 font-semibold uppercase tracking-wider flex items-start gap-1 justify-end text-right break-words leading-tight">
                      <MapPin size={10} className="flex-shrink-0 mt-0.5" />
                      <span className="break-words max-w-[180px]">{event.venue}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile Venue Line */}
              {event.venue && (
                <div className="md:hidden text-[10px] md:text-xs text-zinc-455 dark:text-zinc-500 font-semibold uppercase tracking-wider mt-2.5 flex items-center gap-1">
                  <MapPin size={10} className="flex-shrink-0" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
