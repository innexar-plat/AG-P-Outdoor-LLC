import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import { Home, Palette, Shield, TrendingUp } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { fetchSeo } from '@/lib/api';
import { PageHero } from '@/components/PageHero.jsx';

const PaversPage = () => {
  const [seo, setSeo] = useState(null);
  useEffect(() => {
    fetchSeo('pavers').then((data) => data && setSeo(data));
  }, []);

  return (
    <>
      <Seo
        title={seo?.titleTag || "Paver Installation | AG&P Outdoor LLC"}
        description={seo?.metaDescription || "Expert paver installation for patios, walkways, and driveways in Central Florida. Transform your outdoor living spaces with professional craftsmanship."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <PageHero
        section="pavers"
        fallbackUrl="https://images.unsplash.com/photo-1617123705211-63e0a4daec4f1"
        sectionClassName="relative h-[70vh] flex items-center justify-center overflow-hidden mt-20"
      >
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Professional Paver Installation</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">Transform your outdoor living spaces with beautiful, durable pavers</p>
          </motion.div>
        </div>
      </PageHero>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg text-gray-700 space-y-4">
            <h2 className="text-3xl font-bold text-[#2c3e50]">Elevate Your Outdoor Living</h2>
            <p>Pavers are the perfect solution for creating beautiful, functional outdoor spaces. Whether you're designing a patio for entertaining, a walkway to enhance curb appeal, or a driveway that makes a statement, professional paver installation adds value and beauty to your property.</p>
            <p>At AG&P Outdoor LLC, we specialize in paver installations that combine aesthetic appeal with structural integrity. Our process includes proper base preparation, precise grading for drainage, and expert installation techniques that ensure your pavers look great and last for decades.</p>
            <p>From traditional brick pavers to modern concrete designs, we work with a variety of materials and patterns to create custom outdoor spaces that reflect your style and enhance your home's value.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#2d5016] to-[#1f3810]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <EstimateForm title="Request Your Free Paver Installation Estimate" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default PaversPage;