import Papa from 'papaparse';
import { festInfo } from '../data';

// Google Sheet "Publish to web" CSV URL
export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSWacQP4BRUk2jHkSzc6FcrFZe3ZrSaDXmcbyGP2SXDoUbB6F3AWaZS2ptkIXEy-Hl2PNYzMtxqsI5h/pubhtml?gid=470805613";

/**
 * Helper to convert Google Sheets published HTML link into a clean pub CSV export URL.
 */
export function getCleanFetchUrl(url) {
  if (!url) return '';
  let clean = url.trim();

  let gid = '0';
  const gidMatch = clean.match(/[?&#]gid=([0-9]+)/);
  if (gidMatch && gidMatch[1]) {
    gid = gidMatch[1];
  }

  if (clean.includes('/spreadsheets/d/e/')) {
    const match = clean.match(/\/spreadsheets\/d\/e\/([^/]+)/);
    if (match && match[1]) {
      return `https://docs.google.com/spreadsheets/d/e/${match[1]}/pub?output=csv&gid=${gid}`;
    }
  }

  return clean;
}

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
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);

        if (!isNaN(y)) year = y < 105 ? 2000 + y : y;
        if (!isNaN(m)) month = m;
        if (!isNaN(d)) day = d;
      } else {
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
 * Fetch status and CMS content from published Google Sheet CSV.
 * No caching — every call hits the sheet fresh. A cache-busting
 * timestamp param is appended so Google/browser/CDN layers can't
 * serve a stale copy either.
 */
export async function fetchLiveStatus() {
  const baseUrl = getCleanFetchUrl(GOOGLE_SHEET_CSV_URL);
  const fetchUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + '_=' + Date.now();

  return new Promise((resolve, reject) => {
    Papa.parse(fetchUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data || []);
      },
      error: (error) => {
        console.error("Error parsing live status sheet:", error);
        reject(error);
      }
    });
  });
}

/**
 * Helper to get the current mock time
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
 * Computes the status of a specific event
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
 * Merges static data with overrides
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
    merged.phase = staticEvent.type === 'program' ? '' : getDefaultPhase(merged.status);
    merged.winners = [];
  }

  if (merged.type === 'program') {
    merged.phase = '';
  }

  return merged;
}

function getDefaultPhase(status) {
  if (status === 'Started') return 'Ongoing';
  if (status === 'Ended') return 'Registrations Closed';
  return 'Registrations Open';
}

/**
 * Combines static configuration and dynamic sheet data to build the final list.
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
      newEvent.phase = newEvent.type === 'program' ? '' : (row.phase || getDefaultPhase(newEvent.status));

      if (row.winners) {
        newEvent.winners = row.winners
          .split(';')
          .map(w => {
            const parts = w.split(':');
            if (parts.length >= 2) {
              return { rank: parts[0].trim(), team: parts[1].trim() };
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

  const sortedList = mergedList.sort((a, b) => (a.index - b.index) || a.startTime.localeCompare(b.startTime));

  return sortedList.map(e => ({
    ...e,
    startTime: formatTime12Hour(e.startTime),
    endTime: formatTime12Hour(e.endTime)
  }));
}

/**
 * Formats a 24-hour time string into a 12-hour format string
 */
export function formatTime12Hour(timeStr) {
  if (!timeStr) return '';
  const clean = timeStr.trim();

  if (clean.toLowerCase().includes('am') || clean.toLowerCase().includes('pm')) {
    return clean;
  }

  const parts = clean.split(':');
  if (parts.length < 2) return clean;

  let hours = parseInt(parts[0], 10);
  let minutes = parts[1].slice(0, 2);

  if (isNaN(hours)) return clean;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedHours = hours < 10 ? `0${hours}` : hours;
  return `${formattedHours}:${minutes} ${ampm}`;
}