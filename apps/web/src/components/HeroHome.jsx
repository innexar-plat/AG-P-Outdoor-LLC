import { Link } from 'react-router-dom';
import { motion } from '@/lib/motion-lite.jsx';
import { ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { fetchSiteImages } from '@/lib/api';

/** Fallbacks estáticos quando não há mídia no painel */
const HERO_IMAGE_FALLBACKS = [
  '/thumbnail-960.webp',
  'https://images.unsplash.com/photo-1559824481-e384a5d50c1f?w=960&h=540&fit=crop&q=70&auto=format',
];
const HERO_VIDEO_LOADING_POSTER = '/thumbnail-960.webp';

/** Detecta se uma URL é um vídeo pelo sufixo */
function isVideoUrl(url) {
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
}

function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image/')) return true;
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?|$)/i.test(url);
}

function isLikelyVideo(url, slot) {
  if (!url || typeof url !== 'string') return false;
  if (isVideoUrl(url)) return true;

  const mimeType = String(slot?.mimeType ?? slot?.contentType ?? '').toLowerCase();
  const mediaType = String(slot?.mediaType ?? slot?.type ?? '').toLowerCase();
  if (mimeType.startsWith('video/')) return true;
  if (mediaType === 'video') return true;

  // Handles CDN-style video paths without a direct extension in the filename.
  return /\/(video|videos?)\//i.test(url) || /[?&](format|fm)=mp4(\b|&|$)/i.test(url);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Hero profissional com vídeo de fundo, animações e CTAs.
 * Usa vídeo com fallback para imagem em caso de dispositivos sem suporte.
 */
export function HeroHome({ site }) {
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [allowAutoVideo, setAllowAutoVideo] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  // heroMedia: URL from admin panel (video or image), null while loading
  const [heroMedia, setHeroMedia] = useState(null);
  const [heroSlot, setHeroSlot] = useState(null);
  const [heroPoster, setHeroPoster] = useState('');
  const [fallbackImageIndex, setFallbackImageIndex] = useState(0);

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
    // Load hero media from admin panel site_images (home / home_hero slot)
    fetchSiteImages('home').then((data) => {
      if (!Array.isArray(data)) return;
      const heroSlot = data.find(
        (s) => s.slotKey === 'home_hero' || s.slotKey === 'hero'
      );
      const posterSlot = data.find(
        (s) => s.slotKey === 'home_hero_poster' || s.slotKey === 'hero_poster'
      );
      const gallerySlot = data.find(
        (s) => s.slotKey === 'home_gallery' || s.slotKey === 'gallery'
      );
      if (heroSlot?.url) {
        setHeroSlot(heroSlot);
        setHeroMedia(heroSlot.url);
      }
      if (posterSlot?.url) {
        setHeroPoster(posterSlot.url);
      } else if (gallerySlot?.url) {
        // Reuse gallery image as hero/video cover when no explicit poster exists.
        setHeroPoster(gallerySlot.url);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setVideoError(false);
    setVideoReady(false);
    setFallbackImageIndex(0);
  }, [heroMedia]);

  const staticFallbackImage =
    HERO_IMAGE_FALLBACKS[Math.min(fallbackImageIndex, HERO_IMAGE_FALLBACKS.length - 1)] ||
    HERO_IMAGE_FALLBACKS[0];

  const objectPos = heroSlot
    ? `${heroSlot.focalX ?? 50}% ${heroSlot.focalY ?? 50}%`
    : '50% 50%';
  const slotHasVideo = Boolean(heroMedia && isLikelyVideo(heroMedia, heroSlot));
  const slotHasImage = Boolean(heroMedia && isImageUrl(heroMedia));
  const canRenderVideo = allowAutoVideo && shouldLoadVideo && !videoError && slotHasVideo;
  const fallbackImageSrc = slotHasVideo
    ? HERO_VIDEO_LOADING_POSTER
    : (slotHasImage ? heroMedia : staticFallbackImage);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#eff8f6] via-[#f7fcfb] to-[#edf7f5]">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[#6fb6ad]/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#87c8bf]/18 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#d6ebe7] mb-6 shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 text-[#b48d4d]" />
              <span className="text-sm font-medium text-[#1b4d47]">Licensed & Insured</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#163d39] mb-5 leading-[1.05] tracking-tight"
            >
              Professional Artificial Turf Installation in Orlando & Central Florida
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-[#2f5c57] mb-8 max-w-xl leading-relaxed"
            >
              High-quality, low-maintenance outdoor solutions for residential and commercial properties.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto min-h-12 bg-[#2f6f46] hover:bg-[#1f5b38] text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
              >
                <Link to={site.ctaUrl}>
                  Get a Free Estimate Today
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto min-h-12 bg-white border-[#9bbeb8] text-[#153a36] hover:bg-[#edf7f4] hover:text-[#0f2d2a] font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-lg transition-all duration-300"
              >
                <a href={`tel:${site.phone}`}>Call {site.phone}</a>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            <div className="rounded-2xl border border-[#cfe4e0] bg-[#e6f1ef] shadow-[0_18px_50px_rgba(20,73,67,0.20)] overflow-hidden">
              <div className="relative aspect-[16/10] w-full">
                {slotHasVideo ? (
                  <img
                    src={fallbackImageSrc}
                    srcSet="/thumbnail-640.webp 640w, /thumbnail-960.webp 960w"
                    sizes="(max-width: 1024px) 92vw, 48vw"
                    alt="Premium turf installation"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
                    style={{
                      objectPosition: objectPos,
                      opacity: canRenderVideo && videoReady ? 0 : 1,
                    }}
                    width="1600"
                    height="1000"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.src.endsWith('/thumbnail-960.webp')) {
                        img.src = HERO_VIDEO_LOADING_POSTER;
                        return;
                      }
                      setFallbackImageIndex((idx) =>
                        Math.min(idx + 1, HERO_IMAGE_FALLBACKS.length - 1)
                      );
                    }}
                  />
                ) : (
                  <motion.img
                    src={fallbackImageSrc}
                    alt="Premium turf installation"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ objectPosition: objectPos }}
                    width="1600"
                    height="1000"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onError={(e) => {
                      const img = e.currentTarget;
                      // Avoid showing broken-image icon; immediately fallback to thumbnail.
                      if (!img.src.endsWith('/thumbnail-960.webp')) {
                        img.src = HERO_VIDEO_LOADING_POSTER;
                        return;
                      }
                      setFallbackImageIndex((idx) =>
                        Math.min(idx + 1, HERO_IMAGE_FALLBACKS.length - 1)
                      );
                    }}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  />
                )}

                {canRenderVideo ? (
                  <video
                    className="absolute inset-0 w-full h-full object-contain"
                    src={heroMedia}
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden
                    preload="metadata"
                    onLoadedData={() => setVideoReady(true)}
                    onCanPlay={() => setVideoReady(true)}
                    onError={() => setVideoError(true)}
                    poster={fallbackImageSrc}
                  />
                ) : null}
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-5 -right-4 h-24 w-24 rounded-full bg-[#2f9e95]/25 blur-2xl" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <a
          href="#why-choose"
          className="flex flex-col items-center gap-1 text-[#2e645d]/80 hover:text-[#1f4f49] transition-colors"
          aria-label="Scroll to content"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}

export default HeroHome;
