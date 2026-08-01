import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import EventDetail from './pages/EventDetail';
import ThankYou from './pages/ThankYou';
import { EventProvider } from './context/EventContext';

export default function App() {
  return (
    <EventProvider>
      <Router>
        <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090B] text-[#18181B] dark:text-[#F4F4F5] flex flex-col justify-between selection:bg-accent-light selection:text-accent-dark transition-colors duration-200">
          <div className="flex-1 flex flex-col relative">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/thank-you" element={<ThankYou />} />
            </Routes>
          </div>
        </div>
      </Router>
    </EventProvider>
  );
}
