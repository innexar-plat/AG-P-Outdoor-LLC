import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSite } from '@/lib/SiteProvider.jsx';

const StickyMobileButtons = () => {
  const site = useSite();
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#2d5016] text-white shadow-2xl"
    >
      <div className="grid grid-cols-3 divide-x divide-white/20">
        <a
          href={`tel:${site.phone}`}
          className="flex flex-col items-center justify-center py-3 hover:bg-[#1f3810] transition-colors"
        >
          <Phone className="h-5 w-5 mb-1" />
          <span className="text-xs font-semibold">Call Now</span>
        </a>
        <a
          href={`sms:${site.phone}`}
          className="flex flex-col items-center justify-center py-3 hover:bg-[#1f3810] transition-colors"
        >
          <MessageCircle className="h-5 w-5 mb-1" />
          <span className="text-xs font-semibold">Text Us</span>
        </a>
        <a
          href={`https://wa.me/${site.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 hover:bg-[#1f3810] transition-colors"
        >
          <MessageCircle className="h-5 w-5 mb-1" />
          <span className="text-xs font-semibold">WhatsApp</span>
        </a>
      </div>
    </motion.div>
  );
};

export default StickyMobileButtons;