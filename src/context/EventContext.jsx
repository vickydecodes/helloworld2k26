import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getCurrentTime, computeEventStatus } from '../lib/sheetStatus';
import { events as rawEvents } from '../../events';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [systemTime, setSystemTime] = useState(getCurrentTime());
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Compute the merged events list on-the-fly statically (no network downloads, no caching)
  const events = useMemo(() => {
    return rawEvents.map(e => {
      // 1. Calculate default status based on system clock (startTime & endTime)
      const status = computeEventStatus(e, []);
      
      // 2. Resolve status based on isLive or explicit overrides defined in events.jsx
      let finalStatus = status;
      if (e.status) {
        finalStatus = e.status;
      } else if (e.isLive === true) {
        finalStatus = 'Started';
      }

      // 3. Resolve phase based on explicit overrides or calculate automatically
      let finalPhase = e.phase;
      if (!finalPhase) {
        finalPhase = e.type === 'program' ? '' : (finalStatus === 'Started' ? 'Ongoing' : finalStatus === 'Ended' ? 'Registrations Closed' : 'Registrations Open');
      }

      return {
        ...e,
        status: finalStatus,
        phase: finalPhase,
        winners: e.winners || []
      };
    }).sort((a, b) => (a.index - b.index) || a.startTime.localeCompare(b.startTime));
  }, [systemTime]);

  useEffect(() => {
    // Central clock ticker (ticks every second, handles mock timeline travel)
    const clockInterval = setInterval(() => {
      setSystemTime(getCurrentTime());
    }, 1000);

    // Sync on popstate for mock time travel parameters
    const handlePopState = () => {
      setSystemTime(getCurrentTime());
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      clearInterval(clockInterval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const refresh = () => {
    console.log("Static events refreshed");
  };

  return (
    <EventContext.Provider value={{ 
      events, 
      loading: false, 
      syncing: false, 
      error: null, 
      systemTime, 
      refresh, 
      theme, 
      toggleTheme 
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}
