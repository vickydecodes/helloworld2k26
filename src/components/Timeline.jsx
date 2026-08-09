import React, { useEffect, useRef } from 'react';
import { MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PhaseBadge from './PhaseBadge';

export default function Timeline({ events, onEventClick }) {
  const hasScrolledRef = useRef(false);

  // Sort events chronologically by index, fallback to start time
  const sortedEvents = [...events].sort((a, b) => (a.index - b.index) || a.startTime.localeCompare(b.startTime));

  // Auto-scroll to the first live event ONCE on initial load
  useEffect(() => {
    if (!sortedEvents || sortedEvents.length === 0 || hasScrolledRef.current) return;
    const firstLive = sortedEvents.find(e => e.status === 'Started');
    if (firstLive) {
      const el = document.getElementById(`event-row-${firstLive.id}`);
      if (el) {
        hasScrolledRef.current = true; // Mark as scrolled so we never force scroll again
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [events]);

  // Format times nicely (e.g., "09:00 AM")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const clean = timeStr.trim();
    if (clean.toLowerCase().includes('am') || clean.toLowerCase().includes('pm')) {
      return clean;
    }
    const [hours, minutes] = clean.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    const formattedHours = displayH < 10 ? `0${displayH}` : displayH;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  return (
    <div className="relative">
      {sortedEvents.map((event, index) => {
        const status = event.status;
        const isLive = status === 'Started';
        const isEnded = status === 'Ended';

        return (
          <div 
            id={`event-row-${event.id}`}
            key={event.id}
            className="flex gap-4 md:gap-6"
          >
            {/* 1. Left Time Frame (Desktop Only) */}
            <div className="hidden md:block w-[110px] text-right flex-shrink-0 pt-2">
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {formatTime(event.startTime)}
              </div>
              <div className="text-[10px] text-zinc-405 dark:text-zinc-550 font-semibold tracking-wider uppercase mt-0.5">
                to {formatTime(event.endTime)}
              </div>
            </div>

            {/* 2. Middle Stepper Track & Progress Dots */}
            <div className="relative flex flex-col items-center flex-shrink-0 w-6">
              {/* Dynamic filled line segment connecting down to the next dot */}
              {index < sortedEvents.length - 1 && (
                <div className={`absolute top-6 bottom-0 w-[2px] transition-colors duration-300 ${
                  isEnded ? 'bg-accent' : 'bg-zinc-300/80 dark:bg-zinc-750'
                }`} />
              )}
              
              {/* Timeline Dot (outside the card container) */}
              <div className="z-10 flex items-center justify-center pt-2">
                {isLive ? (
                  /* Elevated Live Dot: Pulsing gold dot with active ring ping */
                  <div className="relative w-3.5 h-3.5 rounded-full bg-accent border border-accent flex items-center justify-center shadow-[0_0_12px_rgba(184,144,71,0.6)]">
                    <div className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full z-10" />
                  </div>
                ) : isEnded ? (
                  /* Completed Dot: Premium dark brown resolved dot */
                  <div className="w-3.5 h-3.5 rounded-full border border-accent bg-accent/15 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  </div>
                ) : (
                  /* Upcoming Dot: Clean empty border */
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" />
                )}
              </div>
            </div>

            {/* 3. Right Content Column (Clickable Card) */}
            <div className="flex-1 min-w-0 pb-8 last:pb-4">
              {/* Mobile Time Frame */}
              <div className="md:hidden text-[10px] sm:text-xs font-bold text-zinc-450 dark:text-zinc-550 mb-1.5">
                {formatTime(event.startTime)} &mdash; {formatTime(event.endTime)}
              </div>

              {/* Entire Rectangular Card is Clickable */}
              <div 
                onClick={() => onEventClick(event)}
                className={`editorial-card p-5 md:p-6 transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                  !isEnded 
                    ? '!bg-[#F5EFEB]/90 dark:!bg-[#5D4416]/20 border-[#8E6E32]/35 dark:border-[#8E6E32]/25' 
                    : ''
                } ${
                  isLive 
                    ? '!bg-[#F5EFEB] dark:!bg-[#5D4416]/40 border-accent/80 dark:border-accent/80 animate-live-glow' 
                    : ''
                } ${
                  isEnded 
                    ? 'z-[-10] bg-zinc-50/50 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/40 shadow-none hover:shadow-none hover:border-zinc-200/60' 
                    : 'hover:border-zinc-350 dark:hover:border-zinc-700 hover:shadow-2xs'
                }`}
              >
                <div className="space-y-3.5">
                  
                  {/* Title & Desktop Badges */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className={`inline-flex items-center gap-1.5 text-base sm:text-lg font-bold transition-colors duration-250 ${
                        isEnded 
                          ? 'text-zinc-400 dark:text-zinc-500' 
                          : 'text-zinc-900 dark:text-zinc-100 group-hover:text-accent dark:group-hover:text-accent'
                      }`}>
                        {isEnded && <CheckCircle2 size={15} className="text-zinc-400 dark:text-zinc-650 flex-shrink-0" />}
                        <span>{event.name}</span>
                        {!isEnded && <ArrowRight size={15} className="text-zinc-300 dark:text-zinc-600 group-hover:text-accent transform group-hover:translate-x-1 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100" />}
                      </div>
                    </div>
                    
                    {/* Desktop Status Badges */}
                    <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                      {!isEnded && event.phase && <PhaseBadge phase={event.phase} />}
                      <StatusBadge status={status} />
                    </div>
                  </div>
 
                  {/* Description */}
                  {event.description && (
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      isEnded ? 'text-zinc-400/80 dark:text-zinc-550' : 'text-zinc-500 dark:text-zinc-400'
                    }`}>
                      {event.description}
                    </p>
                  )}
 
                  {/* Card Footer: Mobile Badges & Venue info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/40 text-xs">
                    {event.venue && (
                      <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                        isEnded ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-455 dark:text-zinc-500'
                      }`}>
                        <MapPin size={11} className={isEnded ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400 dark:text-zinc-650'} />
                        <span>{event.venue}</span>
                      </span>
                    )}
                    
                    {/* Mobile Status Badges */}
                    <div className="sm:hidden flex items-center gap-1.5">
                      {!isEnded && event.phase && <PhaseBadge phase={event.phase} />}
                      <StatusBadge status={status} />
                    </div>
                  </div>
 
                  {/* Concluded Red Corner Ribbon */}
                  {isEnded && (
                    <div className="absolute bottom-0 right-0 bg-red-600 dark:bg-red-700 text-white text-[9px] font-extrabold px-3 py-1 uppercase tracking-widest rounded-tl-xl shadow-sm select-none z-20">
                      Ended
                    </div>
                  )}
 
                </div>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}
