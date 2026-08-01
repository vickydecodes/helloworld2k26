import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { GOOGLE_SHEET_CSV_URL, getCurrentTime, getMergedEvents, computeEventStatus } from '../lib/sheetStatus';
import { festInfo, events as fallbackEvents } from '../data';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [rawOverrides, setRawOverrides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Function to fetch and parse CMS data from Google Sheet
  const loadCmsData = async (isManual = false) => {
    if (isManual) setLoading(true);
    
    try {
      const fetchUrl = `${GOOGLE_SHEET_CSV_URL}${GOOGLE_SHEET_CSV_URL.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
      
      const response = await fetch(fetchUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error("Could not connect to the Google Sheet CMS");
      
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setRawOverrides(results.data);
            const merged = getMergedEvents(fallbackEvents, results.data);
            setEvents(merged);
            setError(null);
          } else {
            throw new Error("No event rows found in the spreadsheet CMS");
          }
          setLoading(false);
        },
        error: (err) => {
          throw new Error("CSV parsing failed: " + err.message);
        }
      });
    } catch (err) {
      console.warn("CMS Load Error, falling back to static config details:", err.message);
      setError(err.message);
      
      // Fall back to static config ONLY if the network is completely down and no previous state exists
      setEvents((prev) => {
        if (prev.length > 0) return prev;
        
        const staticList = fallbackEvents.map(e => {
          const status = computeEventStatus(e, []);
          const phase = e.type === 'program' ? '' : (status === 'Started' ? 'Ongoing' : status === 'Ended' ? 'Registrations Closed' : 'Registrations Open');
          return {
            ...e,
            status,
            phase,
            winners: []
          };
        });
        return staticList.sort((a, b) => (a.index - b.index) || a.startTime.localeCompare(b.startTime));
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsData();

    // Central 10-second Google Sheet polling
    const pollInterval = setInterval(() => {
      loadCmsData();
    }, 10000);

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
      clearInterval(pollInterval);
      clearInterval(clockInterval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Sync event statuses ONLY when an event's active status transitions (prevents 1-second animation flickering)
  useEffect(() => {
    if (events.length > 0) {
      const updated = getMergedEvents(fallbackEvents, rawOverrides);
      
      // Check if any status, phase, or metadata changed before committing a state change
      const hasChanged = updated.some((evt, idx) => {
        const current = events[idx];
        return (
          !current ||
          current.status !== evt.status ||
          current.phase !== evt.phase ||
          current.name !== evt.name ||
          current.venue !== evt.venue ||
          current.description !== evt.description
        );
      });

      if (hasChanged) {
        setEvents(updated);
      }
    } else {
      // Set initial values if empty
      const initial = getMergedEvents(fallbackEvents, rawOverrides);
      if (initial.length > 0) {
        setEvents(initial);
      }
    }
  }, [systemTime, rawOverrides]);

  const refresh = () => loadCmsData(true);

  return (
    <EventContext.Provider value={{ events, loading, error, systemTime, refresh, theme, toggleTheme }}>
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
