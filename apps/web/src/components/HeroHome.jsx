import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { fetchSiteImages } from '@/lib/api';

/** Fallback estático quando não há mídia no painel */
const HERO_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1559824481-e384a5d50c1f?w=1200&h=600&fit=crop';

/** Detecta se uma URL é um vídeo pelo sufixo */
function isVideoUrl(url) {
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
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
  // heroMedia: URL from admin panel (video or image), null while loading
  const [heroMedia, setHeroMedia] = useState(null);
  const [heroSlot, setHeroSlot] = useState(null);

  useEffect(() => {
    // Load hero media from admin panel site_images (home / home_hero slot)
    fetchSiteImages('home').then((data) => {
      if (!Array.isArray(data)) return;
      const heroSlot = data.find(
        (s) => s.slotKey === 'home_hero' || s.slotKey === 'hero'
      );
      if (heroSlot?.url) {
        setHeroSlot(heroSlot);
        setHeroMedia(heroSlot.url);
      }
    }).catch(() => {});
  }, []);

  const objectPos = heroSlot
    ? `${heroSlot.focalX ?? 50}% ${heroSlot.focalY ?? 50}%`
    : '50% 50%';

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
              Premium Turf{' '}
              <motion.span
                className="text-[#b48d4d]"
                animate={{ opacity: [1, 0.85, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Installation
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-[#2f5c57] mb-8 max-w-xl leading-relaxed"
            >
              Professional Base Preparation, Drainage & Clean Finishes
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link to={site.ctaUrl} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-[#2f6f46] hover:bg-[#245739] text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                >
                  Get Free Estimate
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                </Button>
              </Link>
              <a href={`tel:${site.phone}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-white border-[#cde2de] text-[#1f4b46] hover:bg-[#f2faf8] font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-lg transition-all duration-300"
                >
                  Call {site.phone}
                </Button>
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative"
          >
            <div className="rounded-2xl border border-[#cfe4e0] bg-[#0f1716] shadow-[0_18px_50px_rgba(20,73,67,0.20)] overflow-hidden">
              <div className="aspect-[16/10] w-full">
                {!videoError && heroMedia && isVideoUrl(heroMedia) ? (
                  <video
                    className="w-full h-full object-contain"
                    src={heroMedia}
                    autoPlay
                    loop
                    muted
                    playsInline
                    aria-hidden
                    onError={() => setVideoError(true)}
                    poster={HERO_IMAGE_FALLBACK}
                  />
                ) : (
                  <motion.img
                    src={heroMedia && !isVideoUrl(heroMedia) ? heroMedia : HERO_IMAGE_FALLBACK}
                    alt="Premium turf installation"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: objectPos }}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                )}
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
