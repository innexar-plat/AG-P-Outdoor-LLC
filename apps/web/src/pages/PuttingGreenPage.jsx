import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Home, CheckCircle } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { fetchSeo } from '@/lib/api';
import { PageHero } from '@/components/PageHero.jsx';

const PuttingGreenPage = () => {
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('putting-green').then((data) => data && setSeo(data));
  }, []);
  const benefits = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Practice at Home",
      description: "Improve your short game with unlimited practice in your own backyard."
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Increases Property Value",
      description: "A custom putting green is a unique feature that adds value and appeal to your home."
    },
    {
      icon: <Home className="h-8 w-8" />,
      title: "Professional Quality",
      description: "Tournament-grade turf with precise slope design for realistic ball roll."
    }
  ];

  const process = [
    { step: "Site Evaluation", description: "We assess your space, discuss your vision, and design a custom putting green layout." },
    { step: "Base Preparation", description: "Excavation and precise grading to create the perfect slope and contours." },
    { step: "Slope Design", description: "Custom contouring for challenging, realistic putting experiences." },
    { step: "Turf Installation", description: "Professional installation of premium putting green turf." },
    { step: "Hole Setup", description: "Installation of cups, flags, and finishing touches." }
  ];

  const faqs = [
    {
      question: "How much space do I need for a putting green?",
      answer: "Putting greens can be customized to fit any space, from compact 200 sq ft designs to expansive 1000+ sq ft greens. We'll design a layout that maximizes your available space."
    },
    {
      question: "Will the ball roll like a real golf green?",
      answer: "Yes! We use professional-grade putting green turf and precise slope design to create realistic ball roll and speed. Our greens are designed to mimic tournament conditions."
    },
    {
      question: "Can you add multiple holes and slopes?",
      answer: "Absolutely! We can design custom greens with multiple holes, undulations, and challenging slopes to keep your practice sessions interesting."
    }
  ];

  return (
    <>
      <Seo
        title={seo?.titleTag || "Custom Putting Green Installation | AG&P Outdoor LLC"}
        description={seo?.metaDescription || "Professional custom putting green installation in Central Florida. Tournament-grade turf, slope design, and precision installation for golfers of every skill level."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <PageHero
        section="putting-green"
        fallbackUrl="https://images.unsplash.com/photo-1587936491365-48f95355007f"
        sectionClassName="relative h-[70vh] flex items-center justify-center overflow-hidden mt-20"
      >
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Custom Putting Green Installation
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Practice your short game at home with a professional-quality putting green
            </p>
          </motion.div>
        </div>
      </PageHero>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-6">
                Precision Installation for Serious Golfers
              </h2>
              <div className="prose prose-lg text-gray-700 space-y-4">
                <p>
                  Imagine stepping into your backyard and practicing your putting whenever you want. No driving to the course, no waiting for tee times — just you, your putter, and a professionally designed putting green that plays like the real thing.
                </p>
                <p>
                  At AG&P Outdoor LLC, we specialize in custom putting green installations that combine tournament-grade turf with precision slope design. Our greens aren't just flat surfaces — we create challenging contours, realistic breaks, and multiple hole placements to keep your practice sessions engaging and effective.
                </p>
                <p>
                  The key to a great putting green is in the base preparation. We excavate, grade, and contour the foundation with laser precision to ensure consistent ball roll and proper drainage. Our professional installation process guarantees a putting surface that performs beautifully year after year.
                </p>
                <p>
                  Whether you're a scratch golfer looking to sharpen your skills or a weekend player who wants to practice at home, a custom putting green is an investment in your game and your property. And when it's installed by AG&P Outdoor, you'll have a feature that adds value, enjoyment, and curb appeal to your home.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2c3e50] mb-4">
              Why Install a Putting Green?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#2c3e50] mb-4">
              Our Installation Process
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {process.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200"
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

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              'https://images.unsplash.com/photo-1587936491365-48f95355007f',
              'https://images.unsplash.com/photo-1581062778574-8ce5c4db882'
            ].map((url, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="rounded-xl overflow-hidden shadow-lg"
              >
                <img
                  src={url}
                  alt={`Putting green installation ${index + 1}`}
                  className="w-full h-64 object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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

      <section className="py-16 bg-gradient-to-br from-[#2d5016] to-[#1f3810]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <EstimateForm title="Request Your Free Putting Green Estimate" />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default PuttingGreenPage;