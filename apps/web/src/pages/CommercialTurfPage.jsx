import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import { Building2, TrendingUp, Clock, Shield } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { fetchSeo } from '@/lib/api';
import { PageHero } from '@/components/PageHero.jsx';

const CommercialTurfPage = () => {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('commercial-turf').then((data) => data && setSeo(data));
  }, []);
  const benefits = [
    { icon: <TrendingUp className="h-8 w-8" />, title: "Reduce Maintenance Costs", description: "Eliminate mowing, watering, and landscaping expenses." },
    { icon: <Building2 className="h-8 w-8" />, title: "Professional Appearance", description: "Maintain a pristine, green landscape year-round." },
    { icon: <Clock className="h-8 w-8" />, title: "Minimal Downtime", description: "Efficient installation with minimal disruption to your business." },
    { icon: <Shield className="h-8 w-8" />, title: "Long-Term Durability", description: "Built to withstand heavy foot traffic and commercial use." }
  ];

  return (
    <>
      <Seo
        title={seo?.titleTag || "Commercial Turf Installation | AG&P Outdoor LLC"}
        description={seo?.metaDescription || "Professional commercial artificial turf installation in Central Florida. Reduce maintenance costs and maintain a professional appearance year-round."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <PageHero
        section="commercial-turf"
        sectionClassName="relative h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Commercial Artificial Turf</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">Professional landscaping solutions for businesses, HOAs, and commercial properties</p>
          </motion.div>
        </div>
      </PageHero>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg text-gray-700 space-y-4">
            <h2 className="text-3xl font-bold text-[#1f3a2e]">Smart Investment for Commercial Properties</h2>
            <p>For commercial properties, HOAs, and businesses, maintaining natural grass is expensive and time-consuming. Artificial turf offers a cost-effective solution that delivers a professional appearance year-round with minimal maintenance.</p>
            <p>AG&P Outdoor LLC specializes in commercial turf installations for office complexes, retail centers, apartment communities, HOAs, and municipal properties. Our installations are designed for heavy foot traffic and built to last.</p>
            <p>The ROI is clear: eliminate weekly mowing costs, reduce water bills by thousands of dollars annually, and maintain a pristine landscape that enhances your property's curb appeal and value.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-gradient-to-br from-[#2f6f46] to-[#245739] text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-[#1f3a2e] mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#2f6f46] to-[#245739]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <EstimateForm title="Request Your Free Commercial Turf Estimate" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default CommercialTurfPage;