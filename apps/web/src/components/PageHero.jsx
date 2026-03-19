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
  const [allowAutoVideo, setAllowAutoVideo] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const objectPos = slot ? `${slot.focalX ?? 50}% ${slot.focalY ?? 50}%` : '50% 50%';

  useEffect(() => {
    const connection = navigator.connection;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    const saveData = Boolean(connection?.saveData);
    const effectiveType = String(connection?.effectiveType ?? '').toLowerCase();
    const downlink = Number(connection?.downlink ?? 10);
    const deviceMemory = Number(navigator.deviceMemory ?? 8);
    const isSlowNetwork = effectiveType.includes('2g') || effectiveType.includes('3g') || downlink < 5;
    const isLowMemoryDevice = deviceMemory > 0 && deviceMemory <= 4;

    if (isMobile || saveData || isSlowNetwork || isLowMemoryDevice) return;

    setAllowAutoVideo(true);
    const loadVideoId = window.setTimeout(() => setShouldLoadVideo(true), 900);
    return () => window.clearTimeout(loadVideoId);
  }, []);

  useEffect(() => {
    fetchSiteImages(section).then((data) => {
      if (Array.isArray(data)) {
        const heroKey = `${section.replace(/-/g, '_')}_hero`;
        const hero = data.find((s) => s.slotKey === heroKey || s.slotKey === 'hero');
        if (hero) setSlot(hero);
      }
    });
  }, [section]);

  const slotHasVideo = Boolean(slot?.url && isVideoUrl(slot.url));
  const canRenderVideo = slotHasVideo && allowAutoVideo && shouldLoadVideo;

  return (
    <section className={sectionClassName}>
      <div className="absolute inset-0 bg-black">
        {canRenderVideo ? (
          <video
            className="w-full h-full object-contain"
            src={slot.url}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden
            preload="metadata"
            poster={fallbackUrl}
          />
        ) : slotHasVideo ? (
          <img
            src={fallbackUrl}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        ) : (
          <SiteImageSlot
            slot={slot}
            options={{
              imgClassName: 'w-full h-full object-cover',
              imgStyle: { objectPosition: objectPos },
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
