import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import { Heart, Droplets, Shield, Sparkles } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { fetchSeo } from '@/lib/api';
import { PageHero } from '@/components/PageHero.jsx';

const PetTurfPage = () => {
  const [seo, setSeo] = useState(null);
  useEffect(() => {
    fetchSeo('pet-turf').then((data) => data && setSeo(data));
  }, []);
  const benefits = [
    { icon: <Heart className="h-8 w-8" />, title: "Safe for Pets", description: "Non-toxic, lead-free turf that's gentle on paws and safe for all pets." },
    { icon: <Droplets className="h-8 w-8" />, title: "Superior Drainage", description: "Enhanced drainage systems designed specifically for pet urine and waste." },
    { icon: <Shield className="h-8 w-8" />, title: "Durable & Long-Lasting", description: "Withstands digging, running, and heavy pet activity." },
    { icon: <Sparkles className="h-8 w-8" />, title: "Easy to Clean", description: "Simple rinse keeps your pet area fresh and odor-free." }
  ];

  return (
    <>
      <Seo
        title={seo?.titleTag || "Pet Turf Installation | AG&P Outdoor LLC"}
        description={seo?.metaDescription || "Professional pet turf installation in Central Florida. Safe, durable, and easy to clean with superior drainage. Perfect for dogs and cats."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <PageHero
        section="pet-turf"
        sectionClassName="relative h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Pet-Friendly Artificial Turf</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">Safe, durable, and easy to maintain — the perfect solution for pet owners</p>
          </motion.div>
        </div>
      </PageHero>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg text-gray-700 space-y-4">
            <h2 className="text-3xl font-bold text-[#1f3a2e]">The Ultimate Pet-Friendly Lawn Solution</h2>
            <p>If you're a pet owner, you know the struggle: muddy paws, brown patches from urine, constant digging, and endless yard maintenance. Natural grass simply can't keep up with active pets, especially in Florida's climate.</p>
            <p>AG&P Outdoor LLC specializes in pet-friendly artificial turf installations designed specifically for dogs and cats. Our turf is non-toxic, antimicrobial, and built to withstand heavy pet activity while staying clean and fresh.</p>
            <p>The secret is in our enhanced drainage system. We install specialized base layers that allow urine to drain quickly and completely, preventing odors and bacteria buildup. A simple rinse with water keeps your pet area clean and hygienic.</p>
            <p>Your pets will love the soft, comfortable surface, and you'll love the low maintenance. No more mud tracked into the house, no more dead grass, and no more worrying about harmful chemicals from fertilizers and pesticides.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#1f3a2e] mb-12 text-center">Pet Turf Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
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
            <EstimateForm title="Request Your Free Pet Turf Estimate" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default PetTurfPage;