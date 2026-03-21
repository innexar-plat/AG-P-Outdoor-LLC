import { useState, useEffect } from 'react';
import { fetchSiteImages } from '@/lib/api';
import { SiteImageSlot } from '@/components/SiteImageSlot.jsx';

function isVideoUrl(url) {
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url || '');
}

function isLikelyVideo(url, slot) {
  if (!url || typeof url !== 'string') return false;
  if (isVideoUrl(url)) return true;

  const mimeType = String(slot?.mimeType ?? slot?.contentType ?? '').toLowerCase();
  const mediaType = String(slot?.mediaType ?? slot?.type ?? '').toLowerCase();
  if (mimeType.startsWith('video/')) return true;
  if (mediaType === 'video') return true;

  return /\/(video|videos?)\//i.test(url) || /[?&](format|fm)=mp4(\b|&|$)/i.test(url);
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
  const [posterUrl, setPosterUrl] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [allowAutoVideo, setAllowAutoVideo] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const objectPos = slot ? `${slot.focalX ?? 50}% ${slot.focalY ?? 50}%` : '50% 50%';

  useEffect(() => {
    const connection = navigator.connection;
    const saveData = Boolean(connection?.saveData);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveType = String(connection?.effectiveType ?? '').toLowerCase();
    const downlink = Number(connection?.downlink ?? 10);
    const deviceMemory = Number(navigator.deviceMemory ?? 8);
    const isSlowNetwork = effectiveType.includes('2g') || downlink < 1.5;
    const isLowMemoryDevice = deviceMemory > 0 && deviceMemory <= 4;

    if (saveData || prefersReducedMotion || isSlowNetwork || isLowMemoryDevice) return;

    setAllowAutoVideo(true);
  }, []);

  useEffect(() => {
    if (!allowAutoVideo) {
      setShouldLoadVideo(false);
      return;
    }

    let activated = false;
    const activate = () => {
      if (activated) return;
      activated = true;
      setShouldLoadVideo(true);
      window.removeEventListener('pointerdown', activate);
      window.removeEventListener('keydown', activate);
      window.removeEventListener('touchstart', activate);
      window.removeEventListener('scroll', activate);
    };

    window.addEventListener('pointerdown', activate, { passive: true });
    window.addEventListener('keydown', activate);
    window.addEventListener('touchstart', activate, { passive: true });
    window.addEventListener('scroll', activate, { passive: true });

    const timeoutId = window.setTimeout(activate, 8000);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('pointerdown', activate);
      window.removeEventListener('keydown', activate);
      window.removeEventListener('touchstart', activate);
      window.removeEventListener('scroll', activate);
    };
  }, [allowAutoVideo]);

  useEffect(() => {
    fetchSiteImages(section).then((data) => {
      if (Array.isArray(data)) {
        const heroKey = `${section.replace(/-/g, '_')}_hero`;
        const posterKey = `${section.replace(/-/g, '_')}_hero_poster`;
        const hero = data.find((s) => s.slotKey === heroKey || s.slotKey === 'hero');
        const poster = data.find((s) => s.slotKey === posterKey || s.slotKey === 'hero_poster');
        if (hero) setSlot(hero);
        if (poster?.url) setPosterUrl(poster.url);
      }
    });
  }, [section]);

  useEffect(() => {
    setVideoError(false);
    setVideoReady(false);
  }, [slot?.url]);

  const slotHasVideo = Boolean(slot?.url && isLikelyVideo(slot.url, slot));
  const canRenderVideo = slotHasVideo && allowAutoVideo && shouldLoadVideo && !videoError;
  const videoPoster = posterUrl || fallbackUrl;

  return (
    <section className={sectionClassName}>
      <div className="absolute inset-0 bg-[#e6f1ef]">
        {slotHasVideo ? (
          <>
            <img
              src={videoPoster || fallbackUrl}
              alt="Page hero"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
              style={{
                objectPosition: objectPos,
                opacity: canRenderVideo && videoReady ? 0 : 1,
              }}
              loading="eager"
              decoding="async"
            />
            {canRenderVideo ? (
              <video
                className="absolute inset-0 w-full h-full object-contain"
                src={slot.url}
                autoPlay
                loop
                muted
                playsInline
                aria-hidden
                preload="metadata"
                poster={videoPoster}
                onLoadedData={() => setVideoReady(true)}
                onCanPlay={() => setVideoReady(true)}
                onError={() => setVideoError(true)}
              />
            ) : null}
          </>
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
