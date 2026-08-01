# App Features & Architecture Documentation
*Hello World — Tech Fest Schedule Web Application*

This document provides a comprehensive overview of the design aesthetics, technical features, and data-merging schemas implemented in the **Hello World Tech Fest** web application.

---

## 🎨 1. Design & Typography Systems

* **Space Grotesk Heading Typography**: Applied the tech-themed geometric sans-serif *Space Grotesk* from Google Fonts to headings to establish a technical, premium, and structured visual hierarchy.
* **Inter UI Body Typography**: Implemented *Inter* as the body typeface to guarantee readability and neat alignments.
* **CSS Custom Scrollbar**: Replaced standard browser scrollbars with a minimalist, narrow (`6px`) scrollbar. The thumb tracks transition colors dynamically in response to light and dark theme toggling.
* **Editorial Dark & Light Mode Toggling**: 
  - Added a manual theme toggler in the header of all pages (Moon and Sun icons).
  - Patched Tailwind CSS v4 using a custom class variant `@variant dark (&:where(.dark, .dark *))` to support instant toggling, with theme states persisted in `localStorage`.
* **Zero Layout Flickering**: Implemented state transition filters that prevent the app from re-rendering and resetting animations on every second tick of the system clock.

---

## ⚙️ 2. Google Sheets CMS & Realtime Sync

* **Dynamic Spreadsheet Syncing**: The app reads its entire timetable from a published Google Sheet CSV URL.
* **10-Second Auto-Polling**: The schedule syncs in the background every 10 seconds to fetch changes dynamically.
* **Manual Sync Trigger**: A **Sync** button is present on all main pages to let coordinators force-reload updates on demand.
* **Strict HTTP Cache-Busting**: All fetches append a dynamic timestamp parameter (`t=new Date().getTime()`) and specify `cache: 'no-store'` along with `Cache-Control` request headers, forcing Google's CDN to bypass its 5-minute cache and return live edits instantly.
* **Robust Date & Y2K Parser**: Built a bulletproof date parser that resolves slashes and dashes, text/numeric months, and automatically expands 2-digit years (e.g. `26` -> `2026`) to prevent calendar items from reverting to 26 AD in JavaScript.

---

## 🗓️ 3. Program vs. Event Classifications

The timetable supports two distinct scheduler row types:

### A. Competitive Events (`type: "event"`)
* Consist of standard competitions (e.g. Web Development Showcase, Algorithmic Arena).
* Display **registration phase badges** (e.g. *Registrations Open*, *Ongoing*, *Registrations Closed*).
* Display **rules and regulations** lists.
* Display **coordinators and phone contact numbers** directly.
* Display **winners leaderboards** once concluded.

### B. Ceremonial Programs (`type: "program"`)
* Consist of schedule blocks (e.g. Inaugural Ceremony & Prayer, Lunch Break).
* Hide all registration phase badges (registrations are not applicable).
* Hide rules lists and coordinator phone contact cards.
* Support a **Guest of Honor / Chief Guest** profile block that dynamically renders their name and title.

---

## 🔒 4. Data Security & Validation Gates

* **Winner Visibility Gate**: Even if coordinators input or draft the winners lists in the Google Sheet early, the podium grid will remain completely hidden in the UI. The winners will only be displayed to participants after the event has officially reached its end time and transitioned to `'Ended'`.
* **Spreadsheet Source-of-Truth Rules**: Distinguishes between missing columns (which fall back to static defaults) and explicitly empty spreadsheet cells (which clear the values on the site). For example, leaving a Chief Guest cell blank in the sheet successfully hides the profile box from the page.

---

## ⏱️ 5. Clock Statuses & Time-Travel Debugging

* **Status Transitions**:
  - **Upcoming**: Scheduled in the future.
  - **Started**: The clock has crossed the event start time.
  - **Ended**: The clock has crossed the event end time.
* **Ascending Index Sorting**: Sorts events ascending based on an `index` integer column first. If the index is empty, it falls back to chronological start time.
* **Time-Travel Testing Tool**: Append `?debug=true` or `?now=10:00` to the URL to simulate different times. A testing console will appear at the bottom footer, letting you jump to different times to verify status transitions, banners, and badge states.

---

## 🗺️ 6. Core Pages & Routes

1. **Homepage Timeline (`/`)**: Displays the header logo, calendar tags, active countdown banner, search bar, status tabs, and the main schedule timeline.
2. **Event Details Page (`/event/:id`)**: Shows description, venue, timing cards, coordinator phone contacts, Chief Guest profile cards, rules lists, and winner podiums.
3. **Wrap-up Page (`/thank-you`)**: Displays a closing thank-you emblem, a dynamic overall fest status badge (`Upcoming`, `Ongoing`, or `Concluded`), and an event wrap-up summary list.
4. **Global Helpline Footers**: Renders a helpline phone number, helpdesk lobby location, and support email in the footer of all three pages.
