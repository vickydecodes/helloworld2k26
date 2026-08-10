import React, { useEffect, useState } from 'react';
import { X, MapPin, Clock, Phone, Award, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PhaseBadge from './PhaseBadge';
import { getGoogleCalendarLink } from '../lib/sheetStatus';

export default function BottomSheet({ event, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (event) {
      // Trigger entry animation frame
      const timer = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [event]);

  // Escape key listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!event) return null;

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

  const isEnded = event.status === 'Ended';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 1. Blur Backdrop overlay */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 dark:bg-zinc-950/70 backdrop-blur-xs transition-opacity duration-300 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. Sheet Drawer panel */}
      <div 
        className={`relative w-full max-w-2xl mx-auto bg-white dark:bg-[#0A0A0C] rounded-t-2xl border-t border-zinc-200 dark:border-[#1F1F22] shadow-xl flex flex-col max-h-[82vh] transition-transform duration-300 transform ${
          mounted ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Grabber bar drag mockup */}
        <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-850 rounded-full mx-auto my-3 flex-shrink-0" />

        {/* Sticky Header block */}
        <div className="px-6 pb-4 border-b border-zinc-150 dark:border-zinc-850 flex justify-between items-start gap-4 flex-shrink-0">
          <div className="space-y-2 flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-heading">
              {event.name}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {!isEnded && (
                Array.isArray(event.phases) && event.phases.length > 0 ? (
                  event.phases.map((p, pIdx) => <PhaseBadge key={pIdx} phase={p} />)
                ) : (
                  event.phase ? <PhaseBadge phase={event.phase} /> : null
                )
              )}
              <StatusBadge status={event.status} />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-855 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350 transition-all cursor-pointer"
            aria-label="Close sheet"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable details container */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          
          {/* Times and Venue card elements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 space-y-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Timings</span>
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 text-sm font-semibold mt-1">
                  <Clock size={14} className="text-zinc-400 dark:text-zinc-650" />
                  <span>{formatTime(event.startTime)} &mdash; {formatTime(event.endTime)}</span>
                </div>
              </div>
              {!isEnded && (
                <a 
                  href={getGoogleCalendarLink(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 dark:bg-accent/20 hover:bg-accent/20 dark:hover:bg-accent/30 text-accent dark:text-[#F3C63F] border border-accent/20 dark:border-accent/40 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-3xs w-fit select-none"
                >
                  <Calendar size={11} />
                  <span>Add to Calendar</span>
                </a>
              )}
            </div>
            {event.venue && (
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 space-y-1.5">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Venue</span>
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 text-sm font-semibold">
                  <MapPin size={14} className="text-zinc-400 dark:text-zinc-650" />
                  <span>{event.venue}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-1.5">
              <h3 className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">About the Event</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Guest profile details if program chief guest exists */}
          {event.chiefGuest && (
            <div className="bg-amber-50/40 dark:bg-zinc-900/30 border border-accent/25 dark:border-zinc-800 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
                <Award size={18} />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold tracking-wider text-accent-dark dark:text-accent block">Guest of Honor</span>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{event.chiefGuest}</h4>
                {event.chiefGuestTitle && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{event.chiefGuestTitle}</p>
                )}
              </div>
            </div>
          )}

          {/* Event Rules checklist list */}
          {event.rules && event.rules.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Rules & Regulations</h3>
              <ul className="space-y-2">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="text-zinc-600 dark:text-zinc-450 text-sm leading-relaxed flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-2" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Event Winner leaderboards */}
          {isEnded && event.winners && event.winners.length > 0 && (
            <div className="space-y-3.5 pt-4 border-t border-zinc-100 dark:border-zinc-850">
              <h3 className="text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Podium Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {event.winners.map((winner, idx) => {
                  const isFirst = winner.rank.toLowerCase().includes('1st') || winner.rank.toLowerCase().includes('first');
                  const isSecond = winner.rank.toLowerCase().includes('2nd') || winner.rank.toLowerCase().includes('second');
                  const bgClass = isFirst 
                    ? 'bg-yellow-50/50 dark:bg-yellow-950/10 border-yellow-250/50 dark:border-yellow-900/40 text-yellow-800 dark:text-yellow-400' 
                    : isSecond 
                      ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300' 
                      : 'bg-amber-50/20 dark:bg-amber-950/5 border-amber-200/50 dark:border-amber-900/20 text-amber-800 dark:text-amber-400';
                  return (
                    <div key={idx} className={`border rounded-xl p-4 text-center space-y-1 ${bgClass}`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">{winner.rank}</span>
                      <span className="text-sm font-extrabold block break-words leading-tight">{winner.team}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact numbers helpline */}
          {event.coordinator && (
            <div className="pt-5 border-t border-zinc-100 dark:border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Event Coordinator</span>
                <span className="font-semibold text-zinc-850 dark:text-zinc-200 text-sm">{event.coordinator}</span>
              </div>
              {event.phone && (
                <a 
                  href={`tel:${event.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 dark:bg-[#F3C63F] hover:dark:bg-[#E5B82F] border border-accent/25 dark:border-transparent rounded-lg text-accent-dark dark:text-zinc-950 font-bold transition-all cursor-pointer w-fit"
                >
                  <Phone size={12} className="text-accent-dark dark:text-zinc-950" />
                  <span>{event.phone}</span>
                </a>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
