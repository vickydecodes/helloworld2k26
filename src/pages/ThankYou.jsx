import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { festInfo } from '../data';
import { ArrowLeft, Award, ChevronRight, MapPin, RefreshCw, Sun, Moon, Wrench } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PhaseBadge from '../components/PhaseBadge';
import BottomSheet from '../components/BottomSheet';

export default function ThankYou() {
  const { events, loading, error, refresh, theme, toggleTheme } = useEvents();
  const [activeBottomSheetEvent, setActiveBottomSheetEvent] = useState(null);

  useEffect(() => {
    document.title = `Thank You | ${festInfo.title} ${festInfo.edition}`;
  }, []);

  // Debug Panel Helpers
  const urlParams = new URLSearchParams(window.location.search);
  const showDebugPanel = urlParams.has('debug') || urlParams.has('now');
  const isTimeTraveling = urlParams.has('now');

  const handleTimeTravel = (timeString) => {
    const searchParams = new URLSearchParams(window.location.search);
    if (timeString) {
      searchParams.set('now', timeString);
    } else {
      searchParams.delete('now');
    }
    window.history.pushState(null, '', window.location.pathname + '?' + searchParams.toString());
    window.dispatchEvent(new Event('popstate'));
  };

  // Leaderboard Row Skeleton Loader
  const renderLeaderboardSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="py-4 flex items-center justify-between gap-4 border-b border-zinc-150 dark:border-zinc-800 last:border-0">
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="flex gap-2 items-center">
              <div className="h-3 w-16 bg-zinc-150 dark:bg-zinc-900 rounded"></div>
            </div>
          </div>
          <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 md:py-12 flex flex-col justify-between relative">
      
      {/* Absolute settings toggle */}
      <div className="absolute top-4 right-6 flex items-center gap-2 z-40">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all shadow-3xs cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>

      <div>
        {/* Back Button */}
        <nav className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 font-bold transition-colors group"
          >
            <ArrowLeft size={13} className="transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Timeline</span>
          </Link>
        </nav>

        {/* Closing Thank You card - premium styled */}
        <div className="text-center py-12 md:py-18 border-b border-zinc-200 dark:border-zinc-800">
          {/* Emblem */}
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mx-auto mb-4">
            <Award size={22} />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-100 font-heading mb-3">
            Thank You
          </h1>
          
          <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-6">
            We extend our heartfelt gratitude to all organizers, volunteers, mentors, and participants who made {festInfo.title} {festInfo.edition} a success.
          </p>

          {events.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] uppercase font-bold tracking-wider rounded">
              {events.every(e => e.status === 'Ended')
                ? 'Concluded'
                : events.every(e => e.status === 'Upcoming')
                  ? 'Upcoming'
                  : 'Ongoing'}
            </span>
          )}
        </div>

        {/* Event wrap-up summary list */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Event Status Wrap-up
            </h2>
            <button 
              onClick={() => refresh()}
              className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold cursor-pointer"
            >
              <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
          </div>

          {loading ? (
            renderLeaderboardSkeleton()
          ) : error ? (
            <div className="py-8 border border-zinc-200 dark:border-zinc-800 text-center rounded-xl flex flex-col items-center justify-center">
              <h3 className="font-bold text-red-800 dark:text-red-400 text-xs">Failed to Sync</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] mt-0.5">{error}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60 border-t border-b border-zinc-200/70 dark:border-zinc-800/60">
              {events.map((event) => {
                return (
                  <div key={event.id} className="py-4.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-6 group">
                    <div className="flex flex-col flex-1 min-w-0">
                      <button 
                        onClick={() => setActiveBottomSheetEvent(event)}
                        className="font-bold text-left text-zinc-950 dark:text-zinc-100 text-sm md:text-base hover:text-accent dark:hover:text-accent transition-colors duration-250 flex items-center gap-1 cursor-pointer group"
                      >
                        <span className="truncate sm:whitespace-normal">{event.name}</span>
                        <ChevronRight size={13} className="text-zinc-400 dark:text-zinc-650 group-hover:text-accent transform group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0" />
                      </button>
                      <div className="flex items-center gap-2.5 text-xs text-zinc-450 dark:text-zinc-500 mt-1 font-semibold flex-wrap">
                        <span>
                          Time: {event.startTime} &mdash; {event.endTime}
                        </span>
                        {event.venue && (
                          <span className="flex items-center gap-0.5 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200/40 dark:border-zinc-800/60">
                            <MapPin size={8} />
                            <span>{event.venue.split('(')[0].trim()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap sm:justify-end flex-shrink-0 mt-1 sm:mt-0">
                      {event.status !== 'Ended' && event.phase && <PhaseBadge phase={event.phase} />}
                      <StatusBadge status={event.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Global Support Contacts Footer */}
      <footer className="w-full flex flex-col items-center gap-8 border-t border-zinc-200 dark:border-zinc-800 pt-8 mt-16">
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left text-xs text-zinc-500 dark:text-zinc-400">
          <div className="space-y-1">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 block uppercase tracking-wider text-[9px] md:text-[10px]">Support Helpline</span>
            <span className="font-medium">{festInfo.supportPhone}</span>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 block uppercase tracking-wider text-[9px] md:text-[10px]">Support Email</span>
            <a href={`mailto:${festInfo.supportEmail}`} className="font-medium hover:underline">{festInfo.supportEmail}</a>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 block uppercase tracking-wider text-[9px] md:text-[10px]">Help Desk Lobby</span>
            <span className="font-medium">{festInfo.helpDesk}</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-450 dark:text-zinc-550 text-center font-medium">
          {festInfo.copyright}
        </p>
      </footer>

      {/* Debug Panel */}
      {showDebugPanel && (
        <footer className="w-full flex flex-col items-center gap-6 mt-8">
          <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center shadow-3xs">
            <div className="flex flex-col gap-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-1.5">
                <Wrench size={12} className="text-zinc-400 dark:text-zinc-500" />
                <span>Testing Time-Travel: </span>
                <strong className="text-zinc-850 dark:text-zinc-150">{new Date(systemTime).toLocaleTimeString()} ({isTimeTraveling ? 'MOCKED' : 'REALTIME'})</strong>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button 
                  onClick={() => handleTimeTravel('08:00')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  8:00 AM
                </button>
                <button 
                  onClick={() => handleTimeTravel('09:30')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  9:30 AM
                </button>
                <button 
                  onClick={() => handleTimeTravel('12:00')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  12:00 PM
                </button>
                <button 
                  onClick={() => handleTimeTravel('14:00')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  2:00 PM
                </button>
                <button 
                  onClick={() => handleTimeTravel('15:30')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  3:30 PM
                </button>
                <button 
                  onClick={() => handleTimeTravel('17:00')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  5:00 PM
                </button>
                {isTimeTraveling && (
                  <button 
                    onClick={() => handleTimeTravel(null)}
                    className="px-2.5 py-1 text-xs bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900 rounded font-bold hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Dynamic Bottom Sheet Details Overlay */}
      <BottomSheet 
        event={activeBottomSheetEvent} 
        onClose={() => setActiveBottomSheetEvent(null)} 
      />

    </div>
  );
}
