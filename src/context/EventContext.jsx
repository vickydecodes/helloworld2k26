import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { GOOGLE_SHEET_CSV_URL, getCurrentTime, getMergedEvents, computeEventStatus, getCleanFetchUrl } from '../lib/sheetStatus';
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

  // Function to fetch and parse CMS data from Google Sheet using direct PapaParse download
  const loadCmsData = (isManual = false) => {
    if (isManual) setLoading(true);
    
    const baseFetchUrl = getCleanFetchUrl(GOOGLE_SHEET_CSV_URL);
    const fetchUrl = `${baseFetchUrl}${baseFetchUrl.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
    
    Papa.parse(fetchUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setRawOverrides(results.data);
          const merged = getMergedEvents(fallbackEvents, results.data);
          // setEvents(merged);
          setError(null);
        } else {
          setError("No event rows found in the spreadsheet CMS");
        }
        setLoading(false);
      },
      error: (err) => {
        console.warn("CMS Load Error, falling back to static config details:", err);
        setError(err.message || "Failed to download/parse CSV sheet");
        
        // Fall back to static config ONLY if no previous state exists
        
        setLoading(false);
      }
    });
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

  // Sync event statuses and CMS sheets data (using JSON comparison to avoid infinite loops and catch all column edits)
  useEffect(() => {
    const updated = getMergedEvents(fallbackEvents, rawOverrides);
    if (JSON.stringify(events) !== JSON.stringify(updated)) {
      setEvents(updated);
    }
  }, [systemTime, rawOverrides, events]);

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
