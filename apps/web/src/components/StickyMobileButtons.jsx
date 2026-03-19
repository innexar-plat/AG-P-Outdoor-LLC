import React from 'react';
import { useSite } from '@/lib/SiteProvider.jsx';

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 mb-1" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.22a2 2 0 0 1 2.11-.45c.84.31 1.72.53 2.62.65A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 mb-1" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

const StickyMobileButtons = () => {
  const site = useSite();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#2f6f46] text-white shadow-2xl">
      <div className="grid grid-cols-3 divide-x divide-white/20">
        <a
          href={`tel:${site.phone}`}
          className="flex flex-col items-center justify-center py-3 hover:bg-[#245739] transition-colors"
        >
          <PhoneIcon />
          <span className="text-xs font-semibold">Call Now</span>
        </a>
        <a
          href={`sms:${site.phone}`}
          className="flex flex-col items-center justify-center py-3 hover:bg-[#245739] transition-colors"
        >
          <MessageIcon />
          <span className="text-xs font-semibold">Text Us</span>
        </a>
        <a
          href={`https://wa.me/${site.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 hover:bg-[#245739] transition-colors"
        >
          <MessageIcon />
          <span className="text-xs font-semibold">WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default StickyMobileButtons;