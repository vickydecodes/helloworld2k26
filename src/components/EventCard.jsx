import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PhaseBadge from './PhaseBadge';

export default function EventCard({ event, status, index, showMobileMeta = true }) {
  // Format times nicely (e.g., "09:00 AM")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  const isEnded = status === 'Ended';

  return (
    <Link 
      to={`/event/${event.id}`}
      className={`block editorial-card p-5 md:p-6 ${
        isEnded ? 'opacity-65 bg-zinc-50/50' : ''
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Top Bar: Mobile schedule tags & Status Pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {showMobileMeta && (
            <div className="flex flex-wrap items-center gap-3 text-zinc-400 text-xs md:hidden">
              <span className="flex items-center gap-1 font-medium">
                <Clock size={12} />
                <span>{formatTime(event.startTime)} &mdash; {formatTime(event.endTime)}</span>
              </span>
              {event.venue && (
                <span className="flex items-center gap-1 text-zinc-500 font-semibold bg-zinc-100 px-2 py-0.5 rounded text-[10px]">
                  <MapPin size={10} />
                  <span>{event.venue.split('(')[0].trim()}</span>
                </span>
              )}
            </div>
          )}
          
          {/* Badges */}
          <div className="ml-auto flex items-center gap-1.5 flex-wrap justify-end">
            {event.phase && <PhaseBadge phase={event.phase} />}
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Middle Area: Title & Description */}
        <div>
          <h3 className="font-heading text-base md:text-lg font-bold text-zinc-900 group-hover:text-accent transition-colors duration-300">
            {event.name}
          </h3>
          
          {event.description && (
            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed mt-1.5 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>

        {/* Bottom Bar: Desktop Venue & Explore Indicator */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3 mt-1.5">
          <div className="hidden md:flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
            {event.venue && (
              <>
                <MapPin size={12} className="text-zinc-400" />
                <span className="text-zinc-500 font-medium">{event.venue}</span>
              </>
            )}
          </div>
          <div className="md:hidden"></div> {/* Spacer */}

          {/* Navigation link text */}
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400 group-hover:text-zinc-900 transition-colors duration-300">
            <span>Explore Rules</span>
            <ArrowRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
