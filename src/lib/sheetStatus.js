import { festInfo } from '../data';

/**
 * Parses a date string and time string into a valid JavaScript Date object.
 * Supports: dd-mm-yyyy, dd/mm/yy, dd-Aug-2026, yyyy-mm-dd, yyyy/mm/dd.
 */
export function parseDateTime(dateStr, timeStr) {
  const defaultYear = 2026;
  const defaultMonth = 7; // August (0-indexed)
  const defaultDay = 13;

  let year = defaultYear;
  let month = defaultMonth;
  let day = defaultDay;

  if (dateStr) {
    const cleanStr = dateStr.trim();
    const delimiter = cleanStr.includes('/') ? '/' : '-';
    const parts = cleanStr.split(delimiter);

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // ISO format: yyyy-mm-dd or yyyy/mm/dd
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);

        if (!isNaN(y)) year = y < 105 ? 2000 + y : y;
        if (!isNaN(m)) month = m;
        if (!isNaN(d)) day = d;
      } else {
        // Regular format: dd-mm-yyyy, dd/mm/yy, etc.
        const d = parseInt(parts[0], 10);
        const mStr = parts[1].toLowerCase().trim();
        const y = parseInt(parts[2], 10);

        const months = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };

        if (!isNaN(d)) day = d;

        if (months[mStr.slice(0, 3)] !== undefined) {
          month = months[mStr.slice(0, 3)];
        } else {
          const mNum = parseInt(parts[1], 10);
          if (!isNaN(mNum)) month = mNum - 1;
        }

        if (!isNaN(y)) {
          year = y < 105 ? 2000 + y : y;
        }
      }
    }
  }

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const cleanTime = timeStr.trim().toLowerCase();
    const isPM = cleanTime.includes('pm');
    const isAM = cleanTime.includes('am');
    
    const numericPart = cleanTime.replace(/[ap]m/, '').trim();
    const timeParts = numericPart.split(':');
    
    if (timeParts.length >= 2) {
      let h = parseInt(timeParts[0], 10);
      const m = parseInt(timeParts[1], 10);
      
      if (!isNaN(h)) {
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        hours = h;
      }
      if (!isNaN(m)) {
        minutes = m;
      }
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

/**
 * Helper to get the current mock time from URL overrides (?now=...)
 */
export function getCurrentTime() {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const nowOverride = urlParams.get('now');
    if (nowOverride) {
      const parsed = Date.parse(nowOverride);
      if (!isNaN(parsed)) return parsed;
      if (nowOverride.includes(':')) {
        return parseDateTime(festInfo.date, nowOverride).getTime();
      }
    }
  }
  return Date.now();
}

/**
 * Computes the status of a specific event (Started, Ended, Upcoming)
 */
export function computeEventStatus(staticEvent, sheetOverrides = []) {
  if (!staticEvent) return 'Upcoming';

  const override = sheetOverrides.find(row => row.id === staticEvent.id);
  
  if (override && override.status) {
    const statusClean = override.status.trim().toLowerCase();
    if (statusClean === 'upcoming') return 'Upcoming';
    if (statusClean === 'live' || statusClean === 'started') return 'Started';
    if (statusClean === 'ended') return 'Ended';
  }

  // Explicit manual isLive control
  if (override && override.isLive !== undefined) {
    if (override.isLive.trim().toLowerCase() === 'true') {
      return 'Started';
    }
  } else if (!override && staticEvent.isLive === true) {
    return 'Started';
  }

  const dateStr = (override && override.date) ? override.date : staticEvent.date;
  const endStr = (override && override.endTime) ? override.endTime : staticEvent.endTime;

  const endDate = parseDateTime(dateStr, endStr);
  const now = getCurrentTime();

  if (now >= endDate.getTime()) {
    return 'Ended';
  } else {
    return 'Upcoming';
  }
}

/**
 * Merges static data with overrides for a single event
 */
export function getMergedEventData(staticEvent, sheetOverrides = []) {
  if (!staticEvent) return null;
  const row = sheetOverrides.find(r => r.id === staticEvent.id);
  
  const merged = { ...staticEvent };
  merged.status = computeEventStatus(merged, sheetOverrides);
  
  if (row) {
    if (row.index !== undefined && row.index !== "") merged.index = parseInt(row.index, 10);
    if (row.name) merged.name = row.name;
    if (row.startTime) merged.startTime = row.startTime;
    if (row.endTime) merged.endTime = row.endTime;
    if (row.date) merged.date = row.date;
    if (row.type) merged.type = row.type;
    if (row.coordinator) merged.coordinator = row.coordinator;
    if (row.phone) merged.phone = row.phone;
    if (row.venue) merged.venue = row.venue;
    if (row.description) merged.description = row.description;
    
    if (row.chiefGuest !== undefined) merged.chiefGuest = row.chiefGuest;
    if (row.chiefGuestTitle !== undefined) merged.chiefGuestTitle = row.chiefGuestTitle;
    
    if (row.rules) {
      const delimiter = row.rules.includes(';') ? ';' : '\n';
      merged.rules = row.rules
        .split(delimiter)
        .map(rule => rule.trim())
        .filter(rule => rule.length > 0);
    }
    
    if (row.phase) merged.phase = row.phase;
    
    if (row.winners) {
      merged.winners = row.winners
        .split(';')
        .map(w => {
          const parts = w.split(':');
          if (parts.length >= 2) {
            return {
              rank: parts[0].trim(),
              team: parts[1].trim()
            };
          }
          return { rank: 'Winner', team: w.trim() };
        })
        .filter(w => w.team.length > 0);
    }
  } else {
    merged.phase = staticEvent.type === 'program' ? '' : (merged.status === 'Started' ? 'Ongoing' : merged.status === 'Ended' ? 'Registrations Closed' : 'Registrations Open');
    merged.winners = [];
  }

  if (merged.type === 'program') {
    merged.phase = '';
  }

  return merged;
}

/**
 * Combines static configuration and dynamic sheet data to build the final list of events.
 */
export function getMergedEvents(staticEvents, sheetOverrides = []) {
  if (!sheetOverrides || sheetOverrides.length === 0) {
    return staticEvents.map(e => {
      const status = computeEventStatus(e, []);
      const phase = e.type === 'program' ? '' : (status === 'Started' ? 'Ongoing' : status === 'Ended' ? 'Registrations Closed' : 'Registrations Open');
      return {
        ...e,
        status,
        phase,
        winners: []
      };
    }).sort((a, b) => (a.index - b.index) || a.startTime.localeCompare(b.startTime));
  }

  const mergedList = [];

  for (const row of sheetOverrides) {
    if (!row.id) continue;
    
    const staticEvent = staticEvents.find(e => e.id === row.id);
    if (staticEvent) {
      mergedList.push(getMergedEventData(staticEvent, sheetOverrides));
    } else {
      const newEvent = {
        index: row.index !== undefined && row.index !== "" ? parseInt(row.index, 10) : 999,
        id: row.id,
        name: row.name || row.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        startTime: row.startTime || "09:00",
        endTime: row.endTime || "10:00",
        type: row.type || "event",
        chiefGuest: row.chiefGuest || "",
        chiefGuestTitle: row.chiefGuestTitle || "",
        coordinator: row.coordinator || "Coordinator Name",
        phone: row.phone || "",
        venue: row.venue || "TBD",
        description: row.description || "Description added via spreadsheet.",
        rules: row.rules 
          ? row.rules.split(row.rules.includes(';') ? ';' : '\n').map(r => r.trim()).filter(Boolean)
          : [],
        date: row.date || festInfo.date
      };
      
      newEvent.status = computeEventStatus(newEvent, sheetOverrides);
      newEvent.phase = newEvent.type === 'program' ? '' : (row.phase || (newEvent.status === 'Started' ? 'Ongoing' : newEvent.status === 'Ended' ? 'Registrations Closed' : 'Registrations Open'));
      
      if (row.winners) {
        newEvent.winners = row.winners
          .split(';')
          .map(w => {
            const parts = w.split(':');
            if (parts.length >= 2) {
              return {
                rank: parts[0].trim(),
                team: parts[1].trim()
              };
            }
            return { rank: 'Winner', team: w.trim() };
          })
          .filter(w => w.team.length > 0);
      } else {
        newEvent.winners = [];
      }
      
      mergedList.push(newEvent);
    }
  }

  return mergedList.sort((a, b) => (a.index - b.index) || a.startTime.localeCompare(b.startTime));
}

/**
 * Generates a dynamic Google Calendar template link for an event.
 */
export function getGoogleCalendarLink(evt) {
  if (!evt) return '';
  try {
    const parseToCalString = (timeStr) => {
      const dateObj = parseDateTime(evt.date, timeStr);
      const pad = (num) => String(num).padStart(2, '0');
      const y = dateObj.getFullYear();
      const m = pad(dateObj.getMonth() + 1);
      const d = pad(dateObj.getDate());
      const hh = pad(dateObj.getHours());
      const mm = pad(dateObj.getMinutes());
      return `${y}${m}${d}T${hh}${mm}00`;
    };
    
    const start = parseToCalString(evt.startTime);
    const end = parseToCalString(evt.endTime);
    
    const title = encodeURIComponent(evt.name);
    const details = encodeURIComponent(evt.description || '');
    const location = encodeURIComponent(evt.venue || '');
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  } catch (err) {
    return '#';
  }
}
