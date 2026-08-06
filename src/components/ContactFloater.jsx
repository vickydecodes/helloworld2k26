import React, { useState } from 'react';
import { Phone, MessageCircle, Mail, MessageSquare, X } from 'lucide-react';
import { festInfo } from '../data';

export default function ContactFloater() {
  const [isOpen, setIsOpen] = useState(false);

  // Format support phone details for HTML links
  const rawPhone = festInfo.supportPhone.replace(/\s+/g, '');
  const waNumber = festInfo.supportPhone.replace(/[^0-9]/g, '');

  const options = [
    {
      id: 'whatsapp',
      icon: <MessageCircle size={16} />,
      href: `https://wa.me/${waNumber}`,
      color: 'text-emerald-650 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-450',
      label: 'WhatsApp'
    },
    {
      id: 'call',
      icon: <Phone size={14} />,
      href: `tel:${rawPhone}`,
      color: 'text-[#B89047] dark:text-[#B89047] hover:text-[#8E6E32] dark:hover:text-[#B89047]/80',
      label: 'Call'
    },
    {
      id: 'email',
      icon: <Mail size={14} />,
      href: `mailto:${festInfo.supportEmail}`,
      color: 'text-zinc-550 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200',
      label: 'Email'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
      {/* Connected Contact Options Toolbar Card */}
      <div className={`flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden divide-y divide-zinc-150 dark:divide-zinc-800/80 transition-all duration-300 transform origin-bottom ${
        isOpen 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 translate-y-8 scale-75 pointer-events-none'
      }`}>
        {options.map((opt) => (
          <a
            key={opt.id}
            href={opt.href}
            target={opt.id === 'call' ? undefined : '_blank'}
            rel="noopener noreferrer"
            className={`w-11 h-11 flex items-center justify-center transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 active:scale-95 ${opt.color}`}
            title={opt.label}
          >
            {opt.icon}
          </a>
        ))}
      </div>

      {/* Main floating action trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#B89047] dark:hover:text-[#B89047] ${
          isOpen ? 'rotate-90 text-[#B89047] dark:text-[#B89047]' : ''
        }`}
        aria-label="Direct Communication Support Hotlines"
      >
        {isOpen ? <X size={18} /> : <MessageSquare size={18} />}
      </button>
    </div>
  );
}
