import Papa from 'papaparse';
import { festInfo } from '../data';

// Swappable Google Sheet URL (configure with editor URL for instant CORS-safe live data, or pub URL)
export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSWacQP4BRUk2jHkSzc6FcrFZe3ZrSaDXmcbyGP2SXDoUbB6F3AWaZS2ptkIXEy-Hl2PNYzMtxqsI5h/pubhtml?gid=470805613";

/**
 * Helper to convert Google Sheets editable sharing links or published HTML links into clean export CSV URLs.
 */
export function getCleanFetchUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  
  let gid = '0';
  const gidMatch = clean.match(/[?&#]gid=([0-9]+)/);
  if (gidMatch && gidMatch[1]) {
    gid = gidMatch[1];
  }
  
  // Use Google Sheets Visualization Query API for CORS-friendly, un-cached, instant live CSV export
  const editMatch = clean.match(/\/spreadsheets\/d\/([^/]+)/);
  if (editMatch && editMatch[1] && !clean.includes('/e/')) {
    const spreadsheetId = editMatch[1];
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  }
  
  if (clean.includes('/spreadsheets/d/e/')) {
    const match = clean.match(/\/spreadsheets\/d\/e\/([^/]+)/);
    if (match && match[1]) {
      return `https://docs.google.com/spreadsheets/d/e/${match[1]}/pub?output=csv&gid=${gid}`;
    }
  }
  return clean;
}

// In-memory cache for the live status sheet overrides
let cachedSheetData = [];
let lastFetchTime = 0;
const CACHE_DURATION = 15000; // 15 seconds cache

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
    // Clean string and determine slash or dash delimiter
    const cleanStr = dateStr.trim();
    const delimiter = cleanStr.includes('/') ? '/' : '-';
    const parts = cleanStr.split(delimiter);

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // ISO format: yyyy-mm-dd or yyyy/mm/dd
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed
        const d = parseInt(parts[2], 10);

        if (!isNaN(y)) year = y < 105 ? 2000 + y : y;
        if (!isNaN(m)) month = m;
        if (!isNaN(d)) day = d;
      } else {
        // Regular format: dd-mm-yyyy, dd/mm/yy, dd-Aug-26, etc.
        const d = parseInt(parts[0], 10);
        const mStr = parts[1].toLowerCase().trim();
        const y = parseInt(parts[2], 10);

        const months = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
        };

        if (!isNaN(d)) day = d;

        // Determine month index
        if (months[mStr.slice(0, 3)] !== undefined) {
          month = months[mStr.slice(0, 3)];
        } else {
          const mNum = parseInt(parts[1], 10);
          if (!isNaN(mNum)) month = mNum - 1; // 0-indexed
        }

        // Handle 2-digit years (e.g. 26 -> 2026) to prevent 1st Century AD dates
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
    
    // Strip out AM/PM text to parse numbers
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
 * Fetch status and CMS content from published Google Sheet CSV
 */
export async function fetchLiveStatus(force = false) {
  const now = Date.now();
  if (!force && cachedSheetData.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSheetData;
  }

  if (GOOGLE_SHEET_CSV_URL.includes("2PACX-1vSbKzC9r88nU4d_b_WvO2C9o3lA6e2yZl-G8xN9aB1c2d3e4f5g6h7i8j9k0l1m")) {
    const mockData = [
      {
        index: "1",
        id: "inauguration",
        name: "Inaugural Ceremony & Prayer",
        startTime: "08:30",
        endTime: "09:00",
        type: "program",
        chiefGuest: "Dr. Jane Doe",
        chiefGuestTitle: "Director of AI Research at Google DeepMind",
        venue: "Seminar Hall A (1st Floor)",
        description: "Inaugural welcome address, prayer song, and formal lighting of the lamp by our Guest of Honor.",
        rules: "",
        status: ""
      },
      {
        index: "2",
        id: "web-development",
        name: "Web Development Showcase",
        startTime: "09:00",
        endTime: "10:30",
        type: "event",
        coordinator: "Sarah Connor",
        phone: "9876543210",
        venue: "Lab 3 (3rd Floor)",
        description: "Form a team and build a beautiful, responsive client-side web application in this rapid coding sprint.",
        rules: "Max 3 members per team; No pre-built templates permitted; Libraries like Tailwind CSS are allowed; Final submission must be hosted publicly.",
        status: ""
      },
      {
        index: "3",
        id: "competitive-programming",
        name: "Algorithmic Arena",
        startTime: "11:00",
        endTime: "13:00",
        type: "event",
        coordinator: "Alan Turing",
        phone: "9876543211",
        venue: "Main Computer Lab (2nd Floor)",
        description: "Solve complex computational, logic, and data structure puzzles in a high-intensity individual bracket.",
        rules: "Individual participation only; Platform access links provided at launch; C++, Java, Python, Go are allowed; Automatic plagiarism checks.",
        status: ""
      },
      {
        index: "4",
        id: "lunch-break",
        name: "Lunch Break & Networking",
        startTime: "13:00",
        endTime: "13:30",
        type: "program",
        venue: "Student Lounge (1st Floor)",
        description: "Take a break, grab lunch, and network with fellow participants and mentors.",
        rules: "",
        status: ""
      },
      {
        index: "5",
        id: "ui-ux-design",
        name: "UI/UX Showdown",
        startTime: "13:30",
        endTime: "19:00",
        type: "event",
        coordinator: "Don Norman",
        phone: "9876543212",
        venue: "Design Studio (Ground Floor)",
        description: "Craft an elegant user experience flow and clickable high-fidelity prototype for a modern mobile application.",
        rules: "Individual or teams of 2; Allowed tools: Figma or Adobe XD; Clickable interactive prototype link required; Judges mark visual consistency.",
        status: ""
      },
      {
        index: "6",
        id: "tech-quiz",
        name: "Grand Tech Quiz",
        startTime: "15:00",
        endTime: "16:00",
        type: "event",
        coordinator: "Ada Lovelace",
        phone: "9876543213",
        venue: "Seminar Hall A (1st Floor)",
        description: "Fast-paced trivia buzzer round covering computer architecture history, web developments, and modern AI models.",
        rules: "Teams of 2; 30 MCQ digital elimination round; Top 6 teams advance to live buzzers; Negative marks apply for wrong buzz answers.",
        status: ""
      }
    ];
    cachedSheetData = mockData;
    lastFetchTime = now;
    return mockData;
  }

  try {
    const fetchUrl = getCleanFetchUrl(GOOGLE_SHEET_CSV_URL);
    
    return new Promise((resolve, reject) => {
      Papa.parse(fetchUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            cachedSheetData = results.data;
            lastFetchTime = Date.now();
            resolve(results.data);
          } else {
            resolve(cachedSheetData);
          }
        },
        error: (error) => {
          console.error("Error parsing live status sheet:", error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.warn("Live status fetch failed, falling back to cached or static data:", error.message);
    return cachedSheetData;
  }
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

  // Explicit manual isLive control (either spreadsheet column or static fallback config)
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

  // If the clock passes the end time, the event is naturally Ended.
  // Otherwise (even if clock passed start time), it remains Upcoming until explicitly set isLive=true.
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
    // If standard properties are truthy (non-empty strings), overwrite them.
    // If they are blank/empty in the sheet, let them fall back to local defaults.
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
    
    // Strict undefined check ONLY for optional properties like chiefGuest / chiefGuestTitle
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

  // Enforce blank phase registrations for programs
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
  // If spreadsheet overrides are empty, return the static fallback events list
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
    
    // Find matching static event defaults, if any
    const staticEvent = staticEvents.find(e => e.id === row.id);
    
    if (staticEvent) {
      // Merge spreadsheet overrides with static default values
      mergedList.push(getMergedEventData(staticEvent, sheetOverrides));
    } else {
      // Build a completely new event from the spreadsheet row
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

  // Sort ascending by index, and use startTime as a fallback tie-breaker
  const sortedList = mergedList.sort((a, b) => (a.index - b.index) || a.startTime.localeCompare(b.startTime));

  // Map events to use visually formatted 12-hour time strings
  return sortedList.map(e => ({
    ...e,
    startTime: formatTime12Hour(e.startTime),
    endTime: formatTime12Hour(e.endTime)
  }));
}

/**
 * Formats a 24-hour time string (e.g., "14:00" or "9:30") into a 12-hour format string (e.g., "02:00 PM" or "09:30 AM")
 */
export function formatTime12Hour(timeStr) {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  
  // Return immediately if already formatted
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
  hours = hours ? hours : 12; // 0 should be 12
  
  const formattedHours = hours < 10 ? `0${hours}` : hours;
  return `${formattedHours}:${minutes} ${ampm}`;
}
