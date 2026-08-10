import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ArrowRight, CheckCircle2, Eye, EyeOff, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PhaseBadge from './PhaseBadge';
import { getGoogleCalendarLink } from '../lib/sheetStatus';

export default function Timeline({ events, onEventClick }) {
  const hasScrolledRef = useRef(false);
  const [unblurredCardIds, setUnblurredCardIds] = useState([]);

  const toggleCardBlur = (eventId, e) => {
    e.stopPropagation(); // Avoid triggering bottom sheet details
    setUnblurredCardIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId) 
        : [...prev, eventId]
    );
  };

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
        const isManualUnblurred = unblurredCardIds.includes(event.id);

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

                  <div 
                    onClick={() => onEventClick(event)}
                    className={`editorial-card p-5 md:p-6 transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                      isEnded 
                        ? 'z-10 bg-zinc-50/30 dark:bg-zinc-900/15 border-zinc-200/40 dark:border-zinc-800/30 backdrop-blur-xs shadow-none hover:shadow-none' 
                        : isLive
                          ? 'bg-white/75 dark:bg-zinc-900/60 backdrop-blur-md border-accent dark:border-accent shadow-sm shadow-accent/5 dark:shadow-none animate-live-glow hover:shadow-xs'
                          : 'bg-white/60 dark:bg-zinc-900/30 backdrop-blur-md border-zinc-200/60 dark:border-zinc-800/40 hover:bg-white/75 dark:hover:bg-zinc-900/45 hover:border-accent/45 dark:hover:border-accent/45 hover:shadow-2xs'
                    }`}
                  >
                    {/* Concluded Red 3D Diagonal Ribbon (Direct child of card container to ignore padding!) */}
                    {isEnded && (
                      <div className={`absolute w-[130px] text-white text-[9px] font-black py-0.5 uppercase tracking-widest text-center shadow-[0_2.5px_6px_rgba(0,0,0,0.32)] select-none z-20 transition-all duration-500 ease-in-out -rotate-45 before:content-[""] before:absolute before:inset-y-0 before:-left-[300px] before:-right-[300px] before:bg-gradient-to-r before:from-red-700 before:via-red-500 before:to-red-800 dark:before:from-red-800 dark:before:via-red-600 dark:before:to-red-900 before:border-t before:border-b before:border-white/20 before:z-[-1] ${
                        isManualUnblurred 
                          ? 'top-[calc(100%-42px)] left-[calc(100%-98px)]' 
                          : 'top-[16px] left-[-32px]'
                      }`}>
                        Ended
                      </div>
                    )}

                    <div className="space-y-3.5 relative">
                      
                      {/* Blurred details wrapper (Only details are blurred, buttons and ribbons stay 100% sharp) */}
                      <div className={`space-y-3.5 transition-all duration-300 ${
                        isEnded && !isManualUnblurred ? 'filter blur-[1.3px] opacity-70' : 'blur-0 opacity-100'
                      }`}>
                        
                        {/* Title & Desktop Badges */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1.5 text-base sm:text-lg font-bold transition-colors duration-250 ${
                              isEnded 
                                ? 'text-zinc-450 dark:text-zinc-500' 
                                : 'text-zinc-900 dark:text-zinc-100 group-hover:text-accent dark:group-hover:text-accent'
                            }`}>
                              {isEnded && <CheckCircle2 size={15} className="text-zinc-400 dark:text-zinc-650 flex-shrink-0" />}
                              <span>{event.name}</span>
                              {!isEnded && <ArrowRight size={15} className="text-zinc-300 dark:text-zinc-600 group-hover:text-accent transform group-hover:translate-x-1 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100" />}
                            </div>
                          </div>
                          
                          {/* Desktop Status Badges */}
                          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                            {!isEnded && (
                              Array.isArray(event.phases) && event.phases.length > 0 ? (
                                event.phases.map((p, pIdx) => <PhaseBadge key={pIdx} phase={p} />)
                              ) : (
                                event.phase ? <PhaseBadge phase={event.phase} /> : null
                              )
                            )}
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
                              isEnded ? 'text-zinc-400 dark:text-zinc-650' : 'text-zinc-455 dark:text-zinc-500'
                            }`}>
                              <MapPin size={11} className={isEnded ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-400 dark:text-zinc-650'} />
                              <span>{event.venue}</span>
                            </span>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {!isEnded && (
                              <a
                                href={getGoogleCalendarLink(event)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded border border-[#8E6E32]/25 dark:border-zinc-800 bg-amber-500/5 dark:bg-yellow-500/5 hover:bg-[#8E6E32]/10 transition-all cursor-pointer text-[#B38F3E] dark:text-[#F3C63F] shadow-3xs"
                                title="Add to Google Calendar"
                              >
                                <Calendar size={10} />
                                <span>Add to Calendar</span>
                              </a>
                            )}
                            {/* Mobile Status Badges */}
                            <div className="sm:hidden flex flex-wrap items-center gap-1.5">
                              {!isEnded && (
                                Array.isArray(event.phases) && event.phases.length > 0 ? (
                                  event.phases.map((p, pIdx) => <PhaseBadge key={pIdx} phase={p} />)
                                ) : (
                                  event.phase ? <PhaseBadge phase={event.phase} /> : null
                                )
                              )}
                              <StatusBadge status={status} />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Unblurred Action Toggle Button (Positioned outside the blurred div) */}
                      {isEnded && (
                        <div className="flex justify-start pt-1 z-30 relative">
                          <button 
                            onClick={(e) => toggleCardBlur(event.id, e)}
                            className="flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-2.5 py-1 rounded border border-zinc-200/80 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-900/95 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all cursor-pointer select-none text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            title={isManualUnblurred ? "Blur details" : "Unblur details"}
                          >
                            {isManualUnblurred ? <EyeOff size={10} /> : <Eye size={10} />}
                            <span>{isManualUnblurred ? "Hide details" : "Show details"}</span>
                          </button>
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
