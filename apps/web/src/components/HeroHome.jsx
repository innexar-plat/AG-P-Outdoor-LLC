import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { fetchSiteImages } from '@/lib/api';

/** Fallback estático quando não há mídia no painel */
const HERO_VIDEO_FALLBACK = import.meta.env.VITE_HERO_VIDEO_URL || '/Roteiro%205.mp4';
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

  useEffect(() => {
    // On mobile, skip video for performance
    if (window.innerWidth < 768) {
      setVideoError(true);
    }

    // Load hero media from admin panel site_images (home / home_hero slot)
    fetchSiteImages('home').then((data) => {
      if (!Array.isArray(data)) return;
      const heroSlot = data.find(
        (s) => s.slotKey === 'home_hero' || s.slotKey === 'hero'
      );
      if (heroSlot?.url) {
        setHeroMedia(heroSlot.url);
      }
    }).catch(() => {});
  }, []);
  return (
    <section className="relative min-h-[56vh] md:min-h-[62vh] flex items-center justify-center overflow-hidden">
      {/* Background: vídeo ou imagem fallback */}
      <div className="absolute inset-0 bg-black">
        {!videoError && heroMedia && isVideoUrl(heroMedia) ? (
          <video
            className="absolute inset-0 w-full h-full object-contain"
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
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}
        {/* Overlay em gradiente mais sofisticado */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40 mix-blend-multiply"
          aria-hidden
        />
        {/* Subtle animated overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"
          aria-hidden
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
          >
            <ShieldCheck className="h-4 w-4 text-[#c7a766]" />
            <span className="text-sm font-medium text-white/95">Licensed & Insured</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight drop-shadow-lg"
          >
            Premium Turf{' '}
            <motion.span
              className="text-[#c7a766]"
              animate={{ opacity: [1, 0.8, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Installation
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-100 mb-8 max-w-2xl leading-relaxed drop-shadow-md"
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
                className="w-full bg-[#2f6f46] hover:bg-[#245739] text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-95 group"
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
                className="w-full bg-white/10 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white hover:text-[#1f3a2e] font-semibold px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base rounded-lg transition-all duration-300 hover:shadow-xl"
              >
                Call {site.phone}
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <a
          href="#why-choose"
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
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
