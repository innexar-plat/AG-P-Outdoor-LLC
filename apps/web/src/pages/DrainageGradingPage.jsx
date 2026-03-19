import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from '@/lib/motion-lite.jsx';
import { Droplets, Shield, Home, CheckCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtonsDeferred.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { fetchSeo } from '@/lib/api';
import { PageHero } from '@/components/PageHero.jsx';

const DrainageGradingPage = () => {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('drainage-grading').then((data) => data && setSeo(data));
  }, []);

  return (
    <>
      <Seo
        title={seo?.titleTag || "Drainage & Grading Services | AG&P Outdoor LLC"}
        description={seo?.metaDescription || "Professional drainage and grading services in Central Florida. Protect your property from water damage with expert solutions."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <PageHero
        section="drainage-grading"
        sectionClassName="relative h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Drainage & Grading Solutions</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">Protect your property from water damage with professional drainage systems</p>
          </motion.div>
        </div>
      </PageHero>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg text-gray-700 space-y-4">
            <h2 className="text-3xl font-bold text-[#1f3a2e]">Protect Your Property Investment</h2>
            <p>Poor drainage can cause serious damage to your property — from foundation issues to landscape erosion. In Florida's rainy climate, proper drainage and grading are essential for protecting your home and maintaining a healthy landscape.</p>
            <p>AG&P Outdoor LLC provides comprehensive drainage solutions including French drains, catch basins, channel drains, and precision grading. We assess your property's unique challenges and design custom drainage systems that effectively manage water flow and prevent pooling.</p>
            <p>Our grading services ensure water flows away from your foundation and structures, protecting your investment and creating a stable base for landscaping, turf, or hardscaping projects.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#2f6f46] to-[#245739]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <EstimateForm title="Request Your Free Drainage Consultation" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default DrainageGradingPage;