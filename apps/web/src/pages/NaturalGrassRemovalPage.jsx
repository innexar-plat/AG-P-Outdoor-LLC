import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import { Leaf, CheckCircle, Shield, Droplets } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { fetchSeo } from '@/lib/api';
import { PageHero } from '@/components/PageHero.jsx';

const NaturalGrassRemovalPage = () => {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('grass-removal').then((data) => data && setSeo(data));
  }, []);

  return (
    <>
      <Seo
        title={seo?.titleTag || "Natural Grass Removal | AG&P Outdoor LLC"}
        description={seo?.metaDescription || "Professional natural grass removal in Central Florida. Proper foundation preparation for artificial turf, pavers, and landscaping projects."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <PageHero
        section="grass-removal"
        sectionClassName="relative h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Natural Grass Removal</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">Professional grass removal and site preparation for your next project</p>
          </motion.div>
        </div>
      </PageHero>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg text-gray-700 space-y-4">
            <h2 className="text-3xl font-bold text-[#1f3a2e]">The Foundation of Every Great Installation</h2>
            <p>Whether you're installing artificial turf, pavers, or redesigning your landscape, proper grass removal is the critical first step. Cutting corners on this phase leads to settling, drainage issues, and premature failure of your new installation.</p>
            <p>AG&P Outdoor LLC provides professional natural grass removal services that go beyond simply scraping the surface. We completely remove grass, roots, and organic material, then prepare the base according to your project's specific requirements.</p>
            <p>Our process includes excavation to the proper depth, removal of all vegetation and debris, grading for drainage, and compaction of the base layer. This creates a stable, long-lasting foundation that ensures your new installation performs beautifully for years to come.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#2f6f46] to-[#245739]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <EstimateForm title="Request Your Free Grass Removal Estimate" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default NaturalGrassRemovalPage;