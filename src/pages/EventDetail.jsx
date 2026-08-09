import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { festInfo } from '../data';
import { ArrowLeft, Clock, Phone, AlertCircle, RefreshCw, MapPin, CalendarPlus, Sun, Moon, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getEventById } from '../lib/markdownParser';
import StatusBadge from '../components/StatusBadge';
import PhaseBadge from '../components/PhaseBadge';

export default function EventDetail() {
  const { id } = useParams();
  const { events, loading, error, refresh, theme, toggleTheme } = useEvents();

  const event = events.find(e => e.id === id);
  const eventMd = getEventById(id);

  useEffect(() => {
    if (event) {
      document.title = `${event.name} | Hello World 26-27`;
    } else {
      document.title = "Event Not Found | Hello World";
    }
  }, [event]);

  if (!loading && !event) {
    return (
      <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center relative z-10">
        <AlertCircle size={28} className="text-zinc-400 dark:text-zinc-650 mb-3" />
        <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-100 font-heading mb-1">Event Not Found</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-5">We couldn't find the event you are looking for.</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-955 rounded text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Format times nicely (e.g., "09:00 AM")
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
  };

  const getGoogleCalendarUrl = () => {
    if (!event) return '#';
    const startHourMin = event.startTime.replace(':', '');
    const endHourMin = event.endTime.replace(':', '');
    const start = `20260813T${startHourMin}00`;
    const end = `20260813T${endHourMin}00`;
    const title = `${event.name} - Hello World Fest`;
    const desc = event.description || '';
    const loc = event.venue || '';
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(loc)}&ctz=Asia/Kolkata`;
  };

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

  // Detail Page Shimmer Loader
  const renderDetailSkeleton = () => (
    <div className="animate-pulse space-y-6 pt-4">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
      <div className="h-8 w-2/3 bg-zinc-250 dark:bg-zinc-800 rounded"></div>
      <div className="h-10 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-150 dark:border-zinc-800"></div>
    </div>
  );

  return (
    <div className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 md:py-16 flex flex-col justify-between relative">
      
      {/* Absolute settings toggle */}
      <div className="absolute top-4 right-6 flex items-center gap-2 z-40">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white transition-all shadow-3xs cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>

      <div>
        <nav className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-955 dark:text-zinc-400 dark:hover:text-zinc-50 font-bold transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Timeline</span>
          </Link>
        </nav>

        {loading ? (
          renderDetailSkeleton()
        ) : error ? (
          <div className="border border-red-200 dark:border-red-955 bg-red-50/10 text-center rounded-xl p-8 flex flex-col items-center justify-center">
            <h3 className="font-heading font-bold text-red-800 dark:text-red-400 text-sm">Connection Error</h3>
            <p className="text-red-655 dark:text-red-555 text-xs mt-1">{error}</p>
            <button 
              onClick={() => refresh()}
              className="mt-4 px-3 py-1.5 bg-red-155 text-red-800 dark:text-red-300 rounded text-xs font-bold transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Header info */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                {event.phase && <PhaseBadge phase={event.phase} />}
                <StatusBadge status={event.status} />
              </div>
              
              <button 
                onClick={() => refresh()}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-955 dark:hover:text-white font-semibold px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer"
              >
                <RefreshCw size={9} className={loading ? 'animate-spin' : ''} />
                <span>Sync</span>
              </button>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-zinc-955 dark:text-zinc-50 font-heading leading-tight mb-2">
                {event.name}
              </h1>
              {event.venue && (
                <div className="flex items-center gap-1.5 text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-semibold mt-1">
                  <MapPin size={13} className="text-zinc-400 dark:text-zinc-550" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>

            {/* Timetable / Details grid row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`flex items-center justify-between p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 transition-colors ${
                event.type === 'program' ? 'sm:col-span-2' : ''
              }`}>
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-zinc-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-zinc-450 dark:text-zinc-500 font-bold">Event Time</span>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {formatTime(event.startTime)} &mdash; {formatTime(event.endTime)}
                    </span>
                  </div>
                </div>
                
                <a 
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Add to Google Calendar"
                  className="w-8 h-8 rounded bg-zinc-50 hover:bg-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-955 text-zinc-455 hover:text-white flex items-center justify-center border border-zinc-200 dark:border-zinc-800 transition-all shadow-3xs"
                >
                  <CalendarPlus size={14} />
                </a>
              </div>

              {event.type !== 'program' && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 transition-colors">
                  <Phone size={16} className="text-zinc-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-zinc-450 dark:text-zinc-500 font-bold">Contact Coordinator</span>
                    <div className="flex flex-col mt-0.5">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {event.coordinator || 'Coordinator'}
                      </span>
                      {event.phone && (
                        <a 
                          href={`tel:${event.phone}`} 
                          className="text-xs font-semibold text-zinc-600 dark:text-zinc-450 hover:text-accent dark:hover:text-accent hover:underline transition-colors mt-0.5"
                        >
                          {event.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chief Guest Card (Only for programs) */}
            {event.type === 'program' && event.chiefGuest && (
              <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 mb-8">
                <h2 className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-2">
                  Guest of Honor
                </h2>
                <div className="space-y-1">
                  <div className="text-base font-extrabold text-zinc-950 dark:text-zinc-50 font-heading">
                    {event.chiefGuest}
                  </div>
                  {event.chiefGuestTitle && (
                    <div className="text-xs md:text-sm text-zinc-505 dark:text-zinc-400 font-medium">
                      {event.chiefGuestTitle}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Winners Leaderboard */}
            {event.type !== 'program' && event.status === 'Ended' && event.winners && event.winners.length > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 mb-3.5">
                  Event Winners
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {event.winners.map((w, idx) => {
                    let badgeColor = 'bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-350 dark:border-zinc-700';
                    if (w.rank.toLowerCase().includes('1st')) badgeColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40 font-semibold';
                    if (w.rank.toLowerCase().includes('2nd')) badgeColor = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 font-semibold';
                    if (w.rank.toLowerCase().includes('3rd')) badgeColor = 'bg-accent-light dark:bg-accent/10 text-accent-dark dark:text-accent border-accent/20 dark:border-accent/10 font-semibold';
                    
                    return (
                      <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-800 rounded p-3.5 flex flex-col items-center text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[8px] md:text-[9px] uppercase tracking-wider mb-2 border ${badgeColor}`}>
                          {w.rank}
                        </span>
                        <span className="text-xs md:text-sm font-bold text-zinc-955 dark:text-zinc-100 font-heading">
                          {w.team}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2.5">
              <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-550">
                Description
              </h2>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Rules */}
            {event.type !== 'program' && (
              <div className="space-y-3.5">
                <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-550">
                  Rules & Regulations
                </h2>
                
                {event.rules && event.rules.length > 0 ? (
                  <ul className="space-y-3">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-zinc-600 dark:text-zinc-300 text-sm md:text-base leading-relaxed">
                        <span className="mt-2.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : eventMd ? (
                  <div className="prose prose-zinc dark:prose-invert max-w-none text-sm md:text-base">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="hidden" {...props} />,
                        h2: ({node, ...props}) => <h2 className="hidden" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xs md:text-sm font-bold text-zinc-950 dark:text-zinc-100 mt-4 mb-2 uppercase tracking-wide" {...props} />,
                        p: ({node, ...props}) => <p className="text-zinc-600 dark:text-zinc-305 leading-relaxed mb-3" {...props} />,
                        ul: ({node, ...props}) => <ul className="my-2 space-y-2.5" {...props} />,
                        li: ({node, ...props}) => (
                          <li className="flex items-start gap-2.5 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            <span className="mt-2.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                            <span>{props.children}</span>
                          </li>
                        ),
                      }}
                    >
                      {eventMd.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-zinc-400 dark:text-zinc-600 text-xs italic pl-0.5">Rules not found.</p>
                )}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Global Support Contacts Footer */}
      <footer className="w-full flex flex-col items-center gap-8 border-t border-zinc-200 dark:border-zinc-850 pt-8 mt-16">
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left text-xs text-zinc-555 dark:text-zinc-400">
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
          Copyright &copy; @helloworld2k26
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
                <strong className="text-zinc-855 dark:text-zinc-150">{new Date(systemTime).toLocaleTimeString()} ({isTimeTraveling ? 'MOCKED' : 'REALTIME'})</strong>
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button 
                  onClick={() => handleTimeTravel('08:00')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  8:00 AM
                </button>
                <button 
                  onClick={() => handleTimeTravel('09:30')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  9:30 AM
                </button>
                <button 
                  onClick={() => handleTimeTravel('12:00')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                >
                  12:00 PM
                </button>
                <button 
                  onClick={() => handleTimeTravel('14:00')}
                  className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-855 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
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
                    className="px-2.5 py-1 text-xs bg-red-50 dark:bg-red-955/20 text-red-650 dark:text-red-400 border border-red-200 dark:border-red-900 rounded font-bold hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
