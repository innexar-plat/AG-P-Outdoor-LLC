import { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Star, ArrowRight, Droplets, Shield, Award, Users } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroHome from '@/components/HeroHome.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { Button } from '@/components/ui/button';
import { useSite } from '@/lib/SiteProvider.jsx';
import { fetchPortfolio, fetchTestimonials, fetchSeo, fetchSiteImages } from '@/lib/api';
const HomePage = () => {
  const site = useSite();
  const [seo, setSeo] = useState(null);
  const benefits = [{
    icon: <Award className="h-8 w-8" />,
    title: "Professional Installation",
    description: "Expert craftsmanship with attention to every detail, ensuring a flawless finish that lasts."
  }, {
    icon: <Shield className="h-8 w-8" />,
    title: "Base Prep Expertise",
    description: "Proper foundation is everything. We excavate, grade, and compact to industry standards."
  }, {
    icon: <Droplets className="h-8 w-8" />,
    title: "Drainage Solutions",
    description: "Advanced drainage systems prevent pooling and extend your turf's lifespan."
  }, {
    icon: <CheckCircle className="h-8 w-8" />,
    title: "Durability Guaranteed",
    description: "Premium materials and professional installation mean your turf will look great for years."
  }, {
    icon: <Users className="h-8 w-8" />,
    title: "Local Expertise",
    description: "Family-owned and operated in Central Florida. We understand our climate and soil conditions."
  }];
  // Filled from Admin panel data (no Unsplash placeholders).
  const [dynamicGallery, setDynamicGallery] = useState([]);
  const [dynamicReviews, setDynamicReviews] = useState([]);
  useEffect(() => {
    fetchSeo('home').then((data) => data && setSeo(data));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadGallery = async () => {
      const portfolio = await fetchPortfolio();
      if (cancelled) return;

      if (Array.isArray(portfolio) && portfolio.length > 0) {
        setDynamicGallery(
          portfolio
            .filter((item) => item.imageUrl && item.title)
            .slice(0, 8)
            .map((item) => ({
              url: item.imageUrl,
              title: item.title,
            }))
        );
        return;
      }

      // Fallback: some deployments may store home gallery in site images/carousels.
      const data = await fetchSiteImages('home');
      let parsed = [];

      if (Array.isArray(data)) {
        const gal = data.find((s) => s.slotKey === 'home_gallery' || s.slotKey === 'gallery');
        const items = gal?.carouselItems;

        if (items) {
          try {
            parsed = Array.isArray(items) ? items : JSON.parse(items || '[]');
          } catch {
            parsed = [];
          }
        }
      }

      if (!cancelled && parsed.length > 0) {
        setDynamicGallery(
          parsed
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((i) => ({ url: i.url, title: i.altText || '' }))
            .filter((i) => i.url)
        );
      }
    };

    const loadReviews = async () => {
      const data = await fetchTestimonials();
      if (cancelled) return;

      if (Array.isArray(data) && data.length > 0) {
        setDynamicReviews(
          data.slice(0, 6).map((t) => ({
            name: t.name,
            location: t.location || '',
            project: '',
            rating: t.rating,
            text: t.text,
          }))
        );
      } else {
        setDynamicReviews([]);
      }
    };

    loadGallery();
    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);
  const faqs = [{
    question: "How long does artificial turf last?",
    answer: "With proper installation and maintenance, quality artificial turf can last 15-20 years. Our professional base preparation and drainage systems maximize longevity."
  }, {
    question: "Is artificial turf safe for pets?",
    answer: "Absolutely! Our pet turf is non-toxic, antimicrobial, and designed with enhanced drainage for urine. It's durable enough to withstand active pets and easy to clean."
  }, {
    question: "Why is base preparation so important?",
    answer: "Proper base prep is the foundation of a long-lasting installation. It ensures proper drainage, prevents settling, and creates a smooth, stable surface. We excavate, grade, compact, and install drainage systems to industry standards."
  }, {
    question: "How much does artificial turf installation cost?",
    answer: "Costs vary based on area size, turf quality, and site conditions. We provide free onsite evaluations and detailed quotes. Contact us for a personalized estimate."
  }, {
    question: "What maintenance does artificial turf require?",
    answer: "Minimal! Occasional rinsing, brushing to keep fibers upright, and removing debris. No mowing, watering, or fertilizing needed."
  }, {
    question: "Do you serve my area?",
    answer: "We serve Ocoee, Orlando, Winter Garden, Windermere, Clermont, Kissimmee, Apopka, and throughout Central Florida. Contact us to confirm service availability."
  }];
  return <>
      <Seo
        title={seo?.titleTag || `${site.companyName} - Professional Artificial Turf Installation | Central Florida`}
        description={seo?.metaDescription || "Expert artificial turf installation in Central Florida. Professional base preparation, drainage solutions, and quality installations for residential, commercial, and pet turf. Licensed & Insured."}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <HeroHome site={site} />

      {/* Why Choose AG&P */}
      <section id="why-choose" className="py-16 bg-gradient-to-br from-gray-50 to-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2c3e50] mb-4">
              Why Choose {site.companyName}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">We don't just install turf — we build the base systems that make it last.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100">
                <div className="bg-gradient-to-br from-[#2d5016] to-[#1f3810] text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-[#2c3e50] mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>



      {/* Project Gallery */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2c3e50] mb-4">
              Our Work Speaks for Itself
            </h2>
            <p className="text-xl text-gray-600">
              Browse our portfolio of professional installations
            </p>
          </motion.div>

          {dynamicGallery.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicGallery.map((image, index) => <motion.div key={index} initial={{
              opacity: 0,
              scale: 0.85,
              y: 20
            }} whileInView={{
              opacity: 1,
              scale: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.08,
              duration: 0.5,
              ease: "easeOut"
            }} className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer h-64">
                  <img src={image.url} alt={image.title} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out" loading="lazy" />
                  
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Title + icon on hover */}
                  <div className="absolute inset-0 flex items-end justify-between p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm md:text-base">{image.title}</p>
                    <ArrowRight className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0" />
                  </div>
                </motion.div>)}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/gallery">
              <Button className="bg-[#2d5016] hover:bg-[#1f3810] text-white font-semibold px-8 py-6">
                View Full Gallery
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2c3e50] mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real reviews from real customers across Central Florida
            </p>
          </motion.div>

          {dynamicReviews.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dynamicReviews.map((review, index) => <motion.div key={index} initial={{
              opacity: 0,
              y: 20,
              scale: 0.95
            }} whileInView={{
              opacity: 1,
              y: 0,
              scale: 1
            }} viewport={{
              once: true
            }} transition={{
              delay: index * 0.1,
              duration: 0.5
            }} whileHover={{ 
              y: -8,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
            }} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 cursor-default">
                  <motion.div 
                    className="flex items-center mb-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {[...Array(review.rating)].map((_, i) => <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.05 + index * 0.1 }}
                    >
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>)}
                  </motion.div>
                  <motion.p 
                    className="text-gray-700 mb-4 italic leading-relaxed"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.15 }}
                  >
                    "{review.text}"
                  </motion.p>
                  <motion.div 
                    className="border-t border-gray-200 pt-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.25 }}
                  >
                    <p className="font-bold text-[#2c3e50]">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.location}</p>
                    {review.project && <p className="text-xs text-[#2d5016] font-semibold mt-1">{review.project}</p>}
                  </motion.div>
                </motion.div>)}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/reviews">
              <Button variant="outline" className="border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white font-semibold px-8 py-6">
                Read More Reviews
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2c3e50] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get answers to common questions about artificial turf
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-[#2c3e50] mb-2">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </motion.div>)}
          </div>

          <div className="text-center mt-8">
            <Link to="/faq">
              <Button variant="outline" className="border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white font-semibold px-8 py-6">
                View All FAQs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-[#2d5016] to-[#1f3810]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Transform Your Outdoor Space?
              </h2>
              <p className="text-xl text-gray-200">
                Get your free onsite evaluation and detailed quote today
              </p>
            </motion.div>

            <EstimateForm />
          </div>
        </div>
      </section>

      <Footer />
    </>;
};
export default HomePage;