import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ThankYou from './pages/ThankYou';
import GridBinaryOverlay from './components/GridBinaryOverlay';
import ContactFloater from './components/ContactFloater';
import { EventProvider } from './context/EventContext';

export default function App() {
  return (
    <EventProvider>
      <Router>
        <div className="min-h-screen bg-grid-pattern text-[#18181B] dark:text-[#F4F4F5] flex flex-col justify-between selection:bg-accent-light selection:text-accent-dark transition-colors duration-200 relative">
          
          {/* Ambient background glow blurs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[45%] h-[40%] rounded-full bg-accent/5 dark:bg-accent/4 blur-[100px] md:blur-[130px]" />
            <div className="absolute bottom-[5%] right-[-10%] w-[70%] md:w-[50%] h-[45%] rounded-full bg-accent-dark/5 dark:bg-accent-dark/3 blur-[120px] md:blur-[150px]" />
          </div>

          {/* Tech Craftwork Decorative Background Overlay (Static & Elegant) */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-45 dark:opacity-30">
            {/* Faint static code symbols in corners */}
            <div className="absolute top-12 left-4 font-mono text-[75px] md:text-[110px] font-bold text-accent/5 dark:text-accent/3 select-none">
              {"{"}
            </div>
            <div className="absolute top-1/4 right-8 font-mono text-[10px] font-semibold text-zinc-400/10 dark:text-zinc-500/10 select-none hidden md:block">
              <pre>{`const symposium = {
  name: 'Hello World',
  year: 2026,
  status: 'active'
};`}</pre>
            </div>
            <div className="absolute bottom-1/3 left-8 font-mono text-sm font-bold text-accent/10 dark:text-accent/4 select-none">
              {"</>"}
            </div>
            <div className="absolute bottom-12 right-4 font-mono text-[90px] md:text-[130px] font-bold text-accent/5 dark:text-accent/3 select-none">
              {"}"}
            </div>

            {/* Faint tech crosshair indicators */}
            <div className="absolute top-6 right-10 font-mono text-[9px] text-zinc-400/20 dark:text-zinc-500/20 select-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/20 animate-pulse" />
              <span>SYS.ACTIVE // 101.9</span>
            </div>
            
            <div className="absolute bottom-8 left-10 font-mono text-[8px] text-zinc-400/20 dark:text-zinc-500/20 select-none">
              <span>LOC_MCA: 13.08.2026</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col relative z-10">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/thank-you" element={<ThankYou />} />
            </Routes>
          </div>
          <GridBinaryOverlay />
          <ContactFloater />
        </div>
      </Router>
    </EventProvider>
  );
}
