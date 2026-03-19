import { useState, useEffect } from 'react';
import { fetchSiteImages } from '@/lib/api';
import { SiteImageSlot } from '@/components/SiteImageSlot.jsx';

function isVideoUrl(url) {
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url || '');
}

/**
 * Hero section that uses site_images for the given section (slotKey: hero).
 * Falls back to fallbackUrl when no slot is configured.
 * @param {string} section - e.g. 'residential-turf', 'putting-green'
 * @param {string} fallbackUrl - default image URL
 * @param {React.ReactNode} children - content overlay (title, etc.)
 * @param {string} sectionClassName - classes for the section (e.g. "relative h-[70vh] flex items-center...")
 */
export function PageHero({ section, fallbackUrl, children, sectionClassName = 'relative h-[45vh] min-h-[320px] flex items-center justify-center overflow-hidden' }) {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    fetchSiteImages(section).then((data) => {
      if (Array.isArray(data)) {
        const heroKey = `${section.replace(/-/g, '_')}_hero`;
        const hero = data.find((s) => s.slotKey === heroKey || s.slotKey === 'hero');
        if (hero) setSlot(hero);
      }
    });
  }, [section]);

  return (
    <section className={sectionClassName}>
      <div className="absolute inset-0 bg-black">
        {slot?.url && isVideoUrl(slot.url) ? (
          <video
            className="w-full h-full object-contain"
            src={slot.url}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
            poster={fallbackUrl}
          />
        ) : (
          <SiteImageSlot
            slot={slot}
            options={{
              imgClassName: 'w-full h-full object-cover',
              fallbackUrl,
              className: 'w-full h-full block',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
      </div>
      {children}
    </section>
  );
}

export default PageHero;
