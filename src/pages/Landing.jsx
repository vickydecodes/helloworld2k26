import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { festInfo } from '../data';
import Timeline from '../components/Timeline';
import BottomSheet from '../components/BottomSheet';
import { Calendar, Clock, RefreshCw, Search, Timer, Sun, Moon, Wrench } from 'lucide-react';

export default function Landing() {
  const { events, loading, error, systemTime, refresh, theme, toggleTheme } = useEvents();
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeBottomSheetEvent, setActiveBottomSheetEvent] = useState(null);
  
  // Scrolled state for sticky header animation
  const [scrolled, setScrolled] = useState(false);
  
  // Countdown details
  const [countdownText, setCountdownText] = useState('');
  const [countdownTargetName, setCountdownTargetName] = useState('');

  // Sync title tag & scroll listener
  useEffect(() => {
    document.title = `${festInfo.title} — ${festInfo.edition} | College Tech Fest`;
    
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute countdown clock details
  useEffect(() => {
    if (events.length === 0) return;

    const upcoming = events.filter(e => e.status === 'Upcoming');
    const live = events.filter(e => e.status === 'Started'); // maps to Started state
    
    if (live.length > 0) {
      const active = live[0];
      const parts = active.endTime.split(':');
      const targetDate = new Date(systemTime);
      targetDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      
      const diff = targetDate.getTime() - systemTime;
      if (diff > 0) {
        setCountdownTargetName(`${active.name} ends`);
        setCountdownText(formatDiff(diff));
      } else {
        setCountdownText('');
      }
    } else if (upcoming.length > 0) {
      const next = upcoming[0];
      const parts = next.startTime.split(':');
      const targetDate = new Date(systemTime);
      targetDate.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      
      const diff = targetDate.getTime() - systemTime;
      if (diff > 0) {
        setCountdownTargetName(`${next.name} starts`);
        setCountdownText(formatDiff(diff));
      } else {
        setCountdownText('');
      }
    } else {
      setCountdownTargetName('Fest Concluded');
      setCountdownText('');
    }
  }, [systemTime, events]);

  const formatDiff = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Build announcements for static banner (no scroll)
  const getAnnouncementText = () => {
    if (events.length === 0) return '';
    const live = events.filter(e => e.status === 'Started');
    if (live.length > 0) {
      const active = live[0];
      return `${active.name} is active at ${active.venue.split('(')[0].trim()}.`;
    }
    const upcoming = events.filter(e => e.status === 'Upcoming');
    if (upcoming.length > 0) {
      const next = upcoming[0];
      return `Next event: ${next.name} starts at ${next.startTime} in ${next.venue.split('(')[0].trim()}.`;
    }
    return '';
  };

  // Filter events based on search query & selected status tab
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (event.venue && event.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' ? true : event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });  const formatDate = () => festInfo.formattedDate;
  
  // Show testing time travel ONLY if ?debug=true is present in the URL
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

  // Shimmer Skeleton Loader
  const renderSkeleton = () => (
    <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/60 border-t border-b border-zinc-200/70 dark:border-zinc-800/60 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="py-7 md:py-9 flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
          <div className="w-full md:w-[140px] flex-shrink-0 space-y-2">
            <div className="h-4.5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-3 w-10 bg-zinc-100/80 dark:bg-zinc-900/50 rounded"></div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4.5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                <div className="h-3.5 w-full bg-zinc-150 dark:bg-zinc-900/60 rounded"></div>
              </div>
              <div className="h-5 w-14 bg-zinc-200 dark:bg-zinc-800 rounded-md"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const announcement = getAnnouncementText();
  const mainLogoTopClass = announcement ? 'top-24 md:top-30' : 'top-12 md:top-18';

  return (
    <div className="flex-1 w-full flex flex-col justify-between relative">
      
      {/* Sticky Mini Logo (Rolls & Slides in from off-screen Left on Scroll) */}
      <div 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed top-3.5 z-50 cursor-pointer transition-all duration-500 ease-out flex items-center justify-center rounded-full bg-transparent hover:scale-105 active:scale-95 w-10 h-10 md:w-12 md:h-12 ${
          scrolled 
            ? 'left-4 translate-x-0 rotate-0 opacity-100 pointer-events-auto' 
            : 'left-0 -translate-x-20 -rotate-360 opacity-0 pointer-events-none'
        }`}
        title="Scroll to Top"
      >
        <img 
          src={`${festInfo.logo}?v=2`} 
          alt={`${festInfo.title} Sticky Logo`}
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {/* Desktop Theme Toggle (Absolute Corner) */}
      <div className="hidden md:flex absolute top-4 right-4 items-center gap-2 z-40">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white transition-all shadow-3xs cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
        </button>
      </div>

      {/* Static Announcement Banner (Muted & Clean) */}
      {announcement && (
        <div className="w-full bg-accent-light dark:bg-zinc-900/30 border-b border-accent/20 dark:border-zinc-800/40 text-accent-dark dark:text-accent py-2.5 px-4 text-center text-xs font-semibold tracking-wide leading-relaxed break-words">
          <span>{announcement}</span>
        </div>
      )}

      <div className="w-full max-w-3xl mx-auto px-6 py-8 md:py-16 flex-1 flex flex-col justify-between">
        
        {/* Mobile Theme Toggle Row (Inline Flow) */}
        <div className="w-full flex justify-end mb-4 md:hidden z-40">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white transition-all shadow-3xs cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>

        {/* Header */}
        <header className="flex flex-col items-center text-center mb-12 md:mb-16">
          {/* Main Header Logo (Enlarged, Border-free, Fades out on scroll) */}
          <div className={`relative w-24 h-24 md:w-36 md:h-36 mb-4 transition-opacity duration-300 ease-out ${
            scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            <img 
              src={`${festInfo.logo}?v=2`} 
              alt={`${festInfo.title} Logo`}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden absolute inset-0 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center font-heading text-base font-bold text-zinc-400">
              HW
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-955 dark:text-zinc-50 font-heading leading-tight mb-2">
            {festInfo.title}
            <span className="block text-xs sm:text-sm md:text-base font-medium text-zinc-500 dark:text-zinc-400 tracking-normal mt-1 font-sans">
              {festInfo.edition}
            </span>
          </h1>

          {/* Schedule Tags */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 text-xs sm:text-sm mt-3 text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold">
              <Calendar size={12} />
              <span>{formatDate()}</span>
            </span>
            <span className="hidden sm:inline text-zinc-250 dark:text-zinc-800">|</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <Clock size={12} />
              <span>{festInfo.timeSpan}</span>
            </span>
          </div>

          {/* Countdown Clock */}
          {!loading && countdownText && (
            <div className="mt-5 text-xs md:text-sm font-bold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
              <span>{countdownTargetName} in </span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100 font-extrabold">{countdownText}</span>
            </div>
          )}
        </header>



        {/* Filters & Timetable */}
        <main className="flex-1 w-full mb-16">
          
          {/* Tabs Filter Bar */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
              {['All', 'Live', 'Upcoming', 'Ended'].map((tabLabel) => {
                const statusVal = tabLabel === 'Live' ? 'Started' : tabLabel;
                const isActive = statusFilter === statusVal;
                const count = statusVal === 'All' 
                  ? events.length 
                  : events.filter(e => e.status === statusVal).length;
                return (
                  <button
                    key={tabLabel}
                    onClick={() => setStatusFilter(statusVal)}
                    className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive 
                        ? 'border-zinc-955 dark:border-zinc-50 text-zinc-955 dark:text-zinc-50' 
                        : 'border-transparent text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tabLabel === 'Live' && count > 0 && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-650"></span>
                      </span>
                    )}
                    <span>{tabLabel}</span>
                    <span className="text-xs font-normal opacity-70 ml-0.5">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Title */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">
              Schedule Timeline
            </h2>
            
            <button 
              onClick={() => refresh()}
              className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all shadow-3xs cursor-pointer"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>
          </div>

          {/* Timetable schedule content */}
          {loading ? (
            renderSkeleton()
          ) : error ? (
            <div className="border border-red-200 dark:border-red-955 bg-red-50/10 text-center rounded-xl p-8 flex flex-col items-center justify-center">
              <h3 className="font-heading font-bold text-red-800 dark:text-red-400 text-sm">Failed to Load Schedule</h3>
              <p className="text-red-655 dark:text-red-550 text-xs mt-1 max-w-sm">{error}</p>
              <button 
                onClick={() => refresh()}
                className="mt-4 px-3 py-1.5 bg-red-100 dark:bg-red-955/20 text-red-850 dark:text-red-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : filteredEvents.length > 0 ? (
            <Timeline events={filteredEvents} onEventClick={(event) => setActiveBottomSheetEvent(event)} />
          ) : (
            <div className="border border-zinc-200 dark:border-zinc-800 text-center rounded-xl p-8 flex flex-col items-center justify-center">
              <h3 className="font-heading font-bold text-zinc-800 dark:text-zinc-455 text-xs">No matching events</h3>
              <p className="text-zinc-400 dark:text-zinc-650 text-[10px] mt-0.5">Try resetting search filters.</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="w-full flex flex-col items-center gap-8 border-t border-zinc-200 dark:border-zinc-800 pt-8 mt-auto">
          
          {/* Global Support Contacts */}
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

          <div className="flex flex-col items-center gap-4">
            {events.length > 0 && events.every(e => e.status === 'Ended') && (
              <Link 
                to="/thank-you" 
                className="inline-flex items-center gap-1 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-2xs"
              >
                <span>Go to Wrap-up Page</span>
              </Link>
            )}
            
            <p className="text-[10px] text-zinc-450 dark:text-zinc-550 text-center font-medium">
              {festInfo.copyright}
            </p>
          </div>

          {/* Time Travel Testing Tool (ONLY rendered when debug=true or time is mocked) */}
          {showDebugPanel && (
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
                    className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                  >
                    8:00 AM
                  </button>
                  <button 
                    onClick={() => handleTimeTravel('09:30')}
                    className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                  >
                    9:30 AM
                  </button>
                  <button 
                    onClick={() => handleTimeTravel('12:00')}
                    className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
                  >
                    12:00 PM
                  </button>
                  <button 
                    onClick={() => handleTimeTravel('14:00')}
                    className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
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
                    className="px-2.5 py-1 text-xs bg-zinc-50 border border-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
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
          )}
        </footer>

        {/* Dynamic Bottom Sheet Details Overlay */}
        <BottomSheet 
          event={activeBottomSheetEvent} 
          onClose={() => setActiveBottomSheetEvent(null)} 
        />

      </div>
    </div>
  );
}
