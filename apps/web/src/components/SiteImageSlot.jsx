import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Parses carouselItems from API (string or array).
 * @returns {Array<{url: string, altText?: string, sortOrder: number}>}
 */
function parseCarouselItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try {
    const parsed = typeof items === 'string' ? JSON.parse(items) : items;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Renders a site image slot: single image, gallery grid, or carousel.
 * Uses a simple CSS-based carousel (no embla-carousel dependency).
 * @param {Object} slot - { slotKey, url, altText, displayType, carouselItems, carouselInterval, carouselEffect }
 * @param {Object} options - { className, imgClassName, fallbackUrl, autoPlay, priority }
 */
export function SiteImageSlot({ slot, options = {} }) {
  const {
    className = '',
    imgClassName = 'w-full h-full object-cover',
    fallbackUrl = null,
    autoPlay = true,
    priority = false,
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);

  const items = parseCarouselItems(slot?.carouselItems);
  const hasCarouselItems = items.length > 0;
  const displayType = slot?.displayType || 'single';
  const interval = Math.max(3, slot?.carouselInterval ?? 5) * 1000;

  const isCarousel = displayType === 'carousel' && hasCarouselItems;
  const isGallery = displayType === 'gallery' && hasCarouselItems;

  const mainUrl = slot?.url || fallbackUrl || null;

  const images = isCarousel || isGallery
    ? items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [{ url: mainUrl, altText: slot?.altText }];

  const advanceSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoPlay || !isCarousel || images.length <= 1) return;
    const t = setInterval(advanceSlide, interval);
    return () => clearInterval(t);
  }, [autoPlay, isCarousel, images.length, interval, advanceSlide]);

  if (!mainUrl && !isGallery && !isCarousel) return null;

  const mainAlt = slot?.altText || '';

  if (isGallery) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt={img.altText || `Image ${i + 1}`}
            className={imgClassName}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ))}
      </div>
    );
  }

  if (isCarousel) {
    return (
      <div className={`relative overflow-hidden w-full h-full ${className}`}>
        <div className="relative w-full h-full">
          {images.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-500 ${i === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img
                src={img.url}
                alt={img.altText || `Slide ${i + 1}`}
                className={imgClassName}
                loading={i === 0 && priority ? 'eager' : 'lazy'}
                fetchPriority={i === 0 && priority ? 'high' : undefined}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={advanceSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white border-0 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    );
  }

  const imgProps = priority
    ? { loading: 'eager', fetchPriority: 'high' }
    : {};

  return (
    <img
      src={mainUrl}
      alt={mainAlt}
      className={`${imgClassName} ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
      {...imgProps}
    />
  );
}

/**
 * Fetches site images for a section and returns the slot by key.
 * @param {string} section - e.g. 'home', 'residential-turf'
 * @param {string} slotKey - e.g. 'hero', 'gallery'
 * @returns {Promise<Object|null>} slot or null
 */
export async function getSlot(section, slotKey) {
  try {
    const API_BASE_RAW = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    // Prevent double slashes when env has trailing `/` (e.g. `.../admin/`).
    const API_BASE = API_BASE_RAW.replace(/\/+$/, '');
    const res = await fetch(`${API_BASE}/api/site/images/${section}`);
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data ?? [];
    const slot = Array.isArray(data) ? data.find((s) => s.slotKey === slotKey) : null;
    return slot ?? null;
  } catch {
    return null;
  }
}

export default SiteImageSlot;
