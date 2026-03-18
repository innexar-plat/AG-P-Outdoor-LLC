import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Video local em public/ - Roteiro 5 */
const HERO_VIDEO_URL = '/Roteiro%205.mp4';

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
 * Usa sempre o vídeo local (Roteiro 5.mp4).
 */
export function HeroHome({ site }) {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background: vídeo */}
      <div className="absolute inset-0">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={HERO_VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden
        />
        {/* Overlay em gradiente */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30"
          aria-hidden
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
            <ShieldCheck className="h-4 w-4 text-[#7cb342]" />
            <span className="text-sm font-medium text-white/95">Licensed & Insured</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight"
          >
            Premium Turf Installation
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed"
          >
            Professional Base Preparation, Drainage & Clean Finishes
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to={site.ctaUrl}>
              <Button
                size="lg"
                className="bg-[#2d5016] hover:bg-[#1f3810] text-white font-semibold px-8 py-6 text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                Get Free Estimate
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href={`tel:${site.phone}`}>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white hover:text-[#2c3e50] font-semibold px-8 py-6 text-base rounded-lg transition-all duration-300"
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
