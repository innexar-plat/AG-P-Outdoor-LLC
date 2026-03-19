import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Droplets, Shield, Leaf, DollarSign } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { fetchSeo } from '@/lib/api';
import { PageHero } from '@/components/PageHero.jsx';

const ResidentialTurfPage = () => {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('residential-turf').then((data) => data && setSeo(data));
  }, []);
  const benefits = [
    {
      icon: <Home className="h-8 w-8" />,
      title: "Low Maintenance",
      description: "No more mowing, watering, or fertilizing. Save time and money while enjoying a perfect lawn year-round."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Pet-Friendly",
      description: "Durable, non-toxic, and easy to clean. Perfect for families with dogs and cats."
    },
    {
      icon: <Leaf className="h-8 w-8" />,
      title: "Year-Round Green",
      description: "Lush, vibrant appearance in every season. No brown patches or dead spots."
    },
    {
      icon: <Droplets className="h-8 w-8" />,
      title: "Superior Drainage",
      description: "Our professional drainage systems prevent pooling and ensure quick water runoff."
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Long-Term Durability",
      description: "Quality materials and expert installation mean 15-20 years of beautiful, functional turf."
    }
  ];

  const process = [
    {
      step: "Site Evaluation",
      description: "We assess your yard, measure the area, discuss your needs, and provide a detailed quote."
    },
    {
      step: "Grass Removal",
      description: "Complete removal of existing grass and vegetation to create a clean slate."
    },
    {
      step: "Base Preparation",
      description: "Excavation, grading, and compaction of base materials to ensure proper drainage and stability."
    },
    {
      step: "Grading & Drainage",
      description: "Precise grading for water flow and installation of drainage systems where needed."
    },
    {
      step: "Weed Barrier",
      description: "Installation of commercial-grade weed barrier to prevent future growth."
    },
    {
      step: "Turf Installation",
      description: "Professional laying, cutting, and seaming of premium artificial turf."
    },
    {
      step: "Infill Application",
      description: "Application of infill material for cushioning, stability, and natural appearance."
    },
    {
      step: "Final Cleanup",
      description: "Thorough cleanup, final inspection, and care instructions for your new turf."
    }
  ];

  const faqs = [
    {
      question: "How long does residential turf installation take?",
      answer: "Most residential installations are completed in 1-3 days, depending on the size and complexity of the project. We'll provide a specific timeline during your free consultation."
    },
    {
      question: "Will my artificial turf get hot in the Florida sun?",
      answer: "Modern artificial turf is designed to minimize heat retention. We use premium turf with heat-reducing technology, and a quick rinse with water cools it down instantly."
    },
    {
      question: "Can I install artificial turf over my existing lawn?",
      answer: "No. Proper installation requires complete removal of existing grass and professional base preparation. This ensures proper drainage, prevents settling, and maximizes the lifespan of your turf."
    },
    {
      question: "Is artificial turf safe for children and pets?",
      answer: "Absolutely! Our turf is non-toxic, lead-free, and designed for heavy use. It's softer than natural grass, drains quickly, and is easy to clean."
    }
  ];

  return (
    <>
      <Seo
        title={seo?.titleTag || "Residential Artificial Turf Installation | AG&P Outdoor LLC - Central Florida"}
        description={seo?.metaDescription || "Professional residential artificial turf installation in Central Florida. Expert base preparation, drainage solutions, and quality materials for a beautiful, low-maintenance lawn. Free estimates."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      {/* Hero Section */}
      <PageHero
        section="residential-turf"
        fallbackUrl="https://images.unsplash.com/photo-1622212177067-f8927759c33a1"
        sectionClassName="relative h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Residential Artificial Turf Installation
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Transform your yard with professional turf installation done the right way — proper base prep, drainage, and quality materials
            </p>
          </motion.div>
        </div>
      </PageHero>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-6">
                Why Choose Artificial Turf for Your Home?
              </h2>
              <div className="prose prose-lg text-gray-700 space-y-4">
                <p>
                  Your home's outdoor space should be beautiful, functional, and easy to maintain. At AG&P Outdoor LLC, we specialize in residential artificial turf installation that's done the right way — with professional base preparation, advanced drainage solutions, and premium materials that last.
                </p>
                <p>
                  Unlike natural grass that requires constant mowing, watering, fertilizing, and pest control, artificial turf gives you a lush, green lawn year-round with minimal maintenance. It's perfect for Florida's climate, where heat, humidity, and water restrictions make natural grass challenging to maintain.
                </p>
                <p>
                  But here's what sets us apart: we don't just lay turf on top of dirt. We excavate, grade, and prepare a proper base with drainage systems that prevent pooling and ensure your turf lasts 15-20 years. Our installations are built to withstand heavy use, pets, and Florida weather.
                </p>
                <p>
                  Whether you're tired of brown patches, want to save on water bills, or simply want a beautiful yard without the hassle, professional artificial turf installation is the solution. And when it's installed correctly by AG&P Outdoor, you'll enjoy a flawless finish that looks and feels like natural grass.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2c3e50] mb-4">
              Benefits of Residential Artificial Turf
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="bg-gradient-to-br from-[#2d5016] to-[#1f3810] text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Process */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2c3e50] mb-4">
              Our Professional Installation Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every step is critical to ensuring your turf looks great and lasts for decades
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {process.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start">
                  <div className="bg-[#2d5016] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2c3e50] mb-2">{item.step}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2c3e50] mb-4">
              Residential Turf Gallery
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              'https://images.unsplash.com/photo-1622212177067-f8927759c33a1',
              'https://images.unsplash.com/photo-1587936491365-48f95355007f',
              'https://images.unsplash.com/photo-1682173044097-d14202e43fe3'
            ].map((url, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={url}
                  alt={`Residential turf installation example ${index + 1}`}
                  className="w-full h-64 object-cover hover:scale-110 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2c3e50] mb-4">
              Residential Turf FAQs
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <h3 className="text-lg font-bold text-[#2c3e50] mb-2 flex items-start">
                  <CheckCircle className="h-5 w-5 text-[#2d5016] mr-2 mt-1 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-gray-700 ml-7">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#2d5016] to-[#1f3810]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready for a Beautiful, Low-Maintenance Lawn?
              </h2>
              <p className="text-xl text-gray-200">
                Get your free onsite evaluation and detailed quote
              </p>
            </motion.div>

            <EstimateForm title="Request Your Free Residential Turf Estimate" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ResidentialTurfPage;