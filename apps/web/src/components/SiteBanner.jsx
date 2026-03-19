import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite.jsx';
import { X } from 'lucide-react';

/**
 * Renders banners from the admin panel in the site.
 * Supports carousel groups, layouts, and animations.
 */
const SiteBanner = ({ banners, position = 'header' }) => {
  if (!banners || banners.length === 0) return null;

  const groups = {};
  const solo = [];
  for (const b of banners) {
    if (b.carouselGroup) {
      if (!groups[b.carouselGroup]) groups[b.carouselGroup] = [];
      groups[b.carouselGroup].push(b);
    } else {
      solo.push(b);
    }
  }

  const wrapperClass = position === 'header'
    ? 'bg-[#dff3ed] border-b border-[#bfded6]'
    : position === 'footer'
    ? 'bg-gradient-to-r from-slate-800 to-slate-900'
    : '';

  return (
    <div className={wrapperClass}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap gap-3 py-3 justify-center">
          {Object.entries(groups).map(([groupName, groupBanners]) => (
            <BannerCarousel key={groupName} banners={groupBanners} />
          ))}
          {solo.map((b) => (
            <SingleBanner key={b.id} banner={b} />
          ))}
        </div>
      </div>
    </div>
  );
};

function BannerCarousel({ banners }) {
  const [current, setCurrent] = useState(0);
  const intervalMs = (banners[0]?.carouselInterval || 5) * 1000;

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, intervalMs);
    return () => clearInterval(timer);
  }, [next, intervalMs, banners.length]);

  const banner = banners[current];
  if (!banner) return null;

  return (
    <AnimatePresence mode="wait">
      <SingleBanner key={banner.id} banner={banner} animated />
    </AnimatePresence>
  );
}

function SingleBanner({ banner, animated = false }) {
  const style = {
    backgroundColor: banner.bgColor || '#0f172a',
    color: banner.textColor || '#fff',
    borderRadius: banner.borderRadius || 8,
    opacity: (banner.opacity || 100) / 100,
  };

  const Wrapper = animated ? motion.div : 'div';
  const animProps = animated ? {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <Wrapper
      {...animProps}
      className="flex items-center gap-3 px-4 py-2.5 overflow-hidden max-w-md"
      style={style}
    >
      {banner.imageUrl && (
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-10 h-10 rounded object-cover shrink-0"
          width="40"
          height="40"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{banner.title}</p>
        {banner.subtitle && (
          <p className="text-xs opacity-80 truncate">{banner.subtitle}</p>
        )}
      </div>
      {banner.linkUrl && (
        <a
          href={banner.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors whitespace-nowrap"
        >
          {banner.linkText || 'Learn more'} →
        </a>
      )}
    </Wrapper>
  );
}

export default SiteBanner;

/**
 * Popup banner component — shows once per session.
 */
export function SitePopupBanner({ banners }) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;
    const shown = sessionStorage.getItem('popup_banner_shown');
    if (!shown) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [banners]);

  if (!visible || !banners || banners.length === 0) return null;

  const banner = banners[current];

  function close() {
    setVisible(false);
    sessionStorage.setItem('popup_banner_shown', '1');
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-md w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: banner.bgColor || '#0f172a', color: banner.textColor || '#fff' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center hover:bg-black/50 transition-colors"
              aria-label="Close popup banner"
            >
              <X className="h-4 w-4 text-white" />
            </button>
            {banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-48 object-cover"
                width="640"
                height="192"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-bold">{banner.title}</h3>
              {banner.subtitle && <p className="opacity-80">{banner.subtitle}</p>}
              {banner.linkUrl && (
                <a
                  href={banner.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-semibold px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {banner.linkText || 'Learn more'} →
                </a>
              )}
            </div>
            {banners.length > 1 && (
              <div className="flex justify-center gap-1.5 pb-4">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === current ? 'bg-white w-4' : 'bg-white/40'
                    }`}
                    aria-label={`Show banner ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
