import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import { fetchSeo } from '@/lib/api';

const FAQPage = () => {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('faq').then((data) => data && setSeo(data));
  }, []);
  const faqs = [
    { question: "How long does artificial turf last?", answer: "With proper installation and maintenance, quality artificial turf can last 15-20 years. Our professional base preparation and drainage systems maximize longevity. The key factors are proper installation, quality materials, and minimal maintenance." },
    { question: "Is artificial turf safe for pets?", answer: "Absolutely! Our pet turf is non-toxic, antimicrobial, and designed with enhanced drainage for urine. It's durable enough to withstand active pets and easy to clean. We use lead-free, pet-safe materials that are gentle on paws." },
    { question: "Why is base preparation so important?", answer: "Proper base prep is the foundation of a long-lasting installation. It ensures proper drainage, prevents settling, and creates a smooth, stable surface. We excavate, grade, compact, and install drainage systems to industry standards. Skipping this step leads to premature failure." },
    { question: "How much does artificial turf installation cost?", answer: "Costs vary based on area size, turf quality, site conditions, and project complexity. We provide free onsite evaluations and detailed quotes. Contact us for a personalized estimate tailored to your specific project." },
    { question: "What maintenance does artificial turf require?", answer: "Minimal! Occasional rinsing to remove dust and debris, brushing to keep fibers upright, and removing leaves or debris. No mowing, watering, fertilizing, or pest control needed. Most homeowners spend less than 30 minutes per month on maintenance." },
    { question: "Do you serve my area?", answer: "We serve Ocoee, Orlando, Winter Garden, Windermere, Clermont, Kissimmee, Apopka, and throughout Central Florida. Contact us to confirm service availability in your specific location." },
    { question: "How long does installation take?", answer: "Most residential installations are completed in 1-3 days, depending on size and complexity. Commercial projects may take longer. We'll provide a specific timeline during your free consultation." },
    { question: "Will artificial turf get hot in the Florida sun?", answer: "Modern artificial turf is designed to minimize heat retention. We use premium turf with heat-reducing technology. A quick rinse with water cools it down instantly. Many homeowners find it cooler than natural grass in direct sunlight." },
    { question: "Can I install artificial turf myself?", answer: "While DIY is possible, professional installation is strongly recommended. Proper base preparation, drainage, grading, and seaming require specialized equipment and expertise. Poor installation leads to drainage issues, settling, and premature failure." },
    { question: "What's the difference between cheap and quality turf?", answer: "Quality turf uses better materials, has higher density, more realistic appearance, better UV protection, and longer warranties. Cheap turf fades quickly, flattens, and doesn't last. We only use premium materials that are built to last." },
    { question: "Do you offer warranties?", answer: "Yes! We offer warranties on both materials and installation. Turf manufacturers typically provide 8-15 year warranties on materials. We stand behind our installation work and will address any issues that arise." },
    { question: "How does artificial turf compare to natural grass?", answer: "Artificial turf eliminates mowing, watering, fertilizing, and pest control. It stays green year-round, handles heavy use better, and saves money long-term. Initial cost is higher, but ROI is excellent when you factor in water savings and eliminated maintenance costs." }
  ];

  return (
    <>
      <Seo
        title={seo?.titleTag || "Frequently Asked Questions | AG&P Outdoor LLC - Artificial Turf Installation"}
        description={seo?.metaDescription || "Get answers to common questions about artificial turf installation, maintenance, costs, and more. Expert advice from AG&P Outdoor LLC."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <HelpCircle className="h-16 w-16 text-[#2d5016] mx-auto mb-4" />
            <h1 className="text-5xl md:text-6xl font-bold text-[#2c3e50] mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">Everything you need to know about artificial turf installation</p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-[#2c3e50] mb-3 flex items-start">
                  <span className="bg-[#2d5016] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 flex-shrink-0 mt-1">
                    Q
                  </span>
                  {faq.question}
                </h3>
                <p className="text-gray-700 ml-11">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default FAQPage;