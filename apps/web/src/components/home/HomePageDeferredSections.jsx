import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '@/lib/motion-lite.jsx';
import { CheckCircle, Star, ArrowRight, Droplets, Shield, Award, Users } from 'lucide-react';
import Footer from '@/components/Footer.jsx';
import EstimateForm from '@/components/EstimateForm.jsx';
import { Button } from '@/components/ui/button';
import { fetchPortfolio, fetchTestimonials, fetchSiteImages } from '@/lib/api';

const benefits = [
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Professional Installation',
    description: 'Expert craftsmanship with attention to every detail, ensuring a flawless finish that lasts.',
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Base Prep Expertise',
    description: 'Proper foundation is everything. We excavate, grade, and compact to industry standards.',
  },
  {
    icon: <Droplets className="h-8 w-8" />,
    title: 'Drainage Solutions',
    description: "Advanced drainage systems prevent pooling and extend your turf's lifespan.",
  },
  {
    icon: <CheckCircle className="h-8 w-8" />,
    title: 'Durability Guaranteed',
    description: 'Premium materials and professional installation mean your turf will look great for years.',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Local Expertise',
    description: 'Family-owned and operated in Central Florida. We understand our climate and soil conditions.',
  },
];

const process = [
  {
    step: '1',
    title: 'Free Onsite Evaluation',
    description: 'We visit your property, assess the area, discuss your vision, and provide a detailed quote.',
  },
  {
    step: '2',
    title: 'Base Prep & Professional Installation',
    description: 'We remove existing grass, prepare the base with proper grading and drainage, then install your premium turf.',
  },
  {
    step: '3',
    title: 'Final Walk-Through & Care Instructions',
    description: "We ensure you're 100% satisfied and provide maintenance tips to keep your turf looking perfect.",
  },
];

const faqs = [
  {
    question: 'How long does artificial turf last?',
    answer:
      'With proper installation and maintenance, quality artificial turf can last 15-20 years. Our professional base preparation and drainage systems maximize longevity.',
  },
  {
    question: 'Is artificial turf safe for pets?',
    answer:
      'Absolutely! Our pet turf is non-toxic, antimicrobial, and designed with enhanced drainage for urine. It is durable enough to withstand active pets and easy to clean.',
  },
  {
    question: 'Why is base preparation so important?',
    answer:
      'Proper base prep is the foundation of a long-lasting installation. It ensures proper drainage, prevents settling, and creates a smooth, stable surface.',
  },
  {
    question: 'How much does artificial turf installation cost?',
    answer:
      'Costs vary based on area size, turf quality, and site conditions. We provide free onsite evaluations and detailed quotes. Contact us for a personalized estimate.',
  },
  {
    question: 'What maintenance does artificial turf require?',
    answer:
      'Minimal. Occasional rinsing, brushing to keep fibers upright, and removing debris. No mowing, watering, or fertilizing needed.',
  },
  {
    question: 'Do you serve my area?',
    answer:
      'We serve Ocoee, Orlando, Winter Garden, Windermere, Clermont, Kissimmee, Apopka, and throughout Central Florida. Contact us to confirm service availability.',
  },
];

export default function HomePageDeferredSections({ site }) {
  const [dynamicGallery, setDynamicGallery] = useState([]);
  const [dynamicReviews, setDynamicReviews] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadGallery = async () => {
      const portfolio = await fetchPortfolio();
      if (cancelled) return;

      if (Array.isArray(portfolio) && portfolio.length > 0) {
        setDynamicGallery(
          portfolio
            .filter((item) => item.imageUrl && item.title)
            .slice(0, 4)
            .map((item) => ({
              url: item.imageUrl,
              title: item.title,
            }))
        );
        return;
      }

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
            .map((item) => ({ url: item.url, title: item.altText || '' }))
            .filter((item) => item.url)
        );
      }
    };

    const loadReviews = async () => {
      const data = await fetchTestimonials();
      if (cancelled) return;

      if (Array.isArray(data) && data.length > 0) {
        setDynamicReviews(
          data.slice(0, 6).map((item) => ({
            name: item.name,
            location: item.location || '',
            project: '',
            rating: item.rating,
            text: item.text,
            photoUrl: item.photoUrl || null,
            photoUrls: Array.isArray(item.photoUrls) ? item.photoUrls : [],
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

  return (
    <>
      <section id="why-choose" className="py-16 bg-gradient-to-br from-gray-50 to-white scroll-mt-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1f3a2e] mb-4">Why Choose {site.companyName}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">We do not just install turf. We build the base systems that make it last.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <div className="bg-gradient-to-br from-[#2f6f46] to-[#245739] text-white w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-[#1f3a2e] mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#1f3a2e] to-[#1b3228] text-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our 3-Step Process</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">From consultation to completion, we make it easy</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {process.map((item, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="bg-[#2f6f46] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
                {index < process.length - 1 ? (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-[#2f6f46]" />
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1f3a2e] mb-4">Our Work Speaks for Itself</h2>
            <p className="text-xl text-gray-600">Browse our portfolio of professional installations</p>
          </motion.div>

          {dynamicGallery.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicGallery.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
                  className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer h-64"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="512"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute inset-0 flex items-end justify-between p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-semibold text-sm md:text-base">{image.title}</p>
                    <ArrowRight className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : null}

          <div className="text-center mt-8">
            <Link to="/gallery">
              <Button className="bg-[#2f6f46] hover:bg-[#245739] text-white font-semibold px-8 py-6">
                View Full Gallery
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1f3a2e] mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real reviews from real customers across Central Florida</p>
          </motion.div>

          {dynamicReviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dynamicReviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 cursor-default"
                >
                  <motion.div className="flex items-center mb-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.1 + 0.2 }}>
                    {[...Array(review.rating)].map((_, i) => (
                      <motion.div key={i} initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.05 + index * 0.1 }}>
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.p className="text-gray-700 mb-4 italic leading-relaxed" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.1 + 0.15 }}>
                    &quot;{review.text}&quot;
                  </motion.p>
                  <motion.div className="border-t border-gray-200 pt-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: index * 0.1 + 0.25 }}>
                    <div className="flex items-center gap-3">
                      {review.photoUrl ? (
                        <img
                          src={review.photoUrl}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          loading="lazy"
                          decoding="async"
                          width="48"
                          height="48"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div>
                        <p className="font-bold text-[#1f3a2e]">{review.name}</p>
                        <p className="text-sm text-gray-600">{review.location}</p>
                        {review.project ? <p className="text-xs text-[#2f6f46] font-semibold mt-1">{review.project}</p> : null}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : null}

          <div className="text-center mt-8">
            <Link to="/reviews">
              <Button variant="outline" className="border-[#2f6f46] text-[#2f6f46] hover:bg-[#2f6f46] hover:text-white font-semibold px-8 py-6">
                Read More Reviews
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1f3a2e] mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Get answers to common questions about artificial turf</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-[#1f3a2e] mb-2">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/faq">
              <Button variant="outline" className="border-[#2f6f46] text-[#2f6f46] hover:bg-[#2f6f46] hover:text-white font-semibold px-8 py-6">
                View All FAQs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#2f6f46] to-[#245739]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Transform Your Outdoor Space?</h2>
              <p className="text-xl text-gray-200">Get your free onsite evaluation and detailed quote today</p>
            </motion.div>

            <EstimateForm />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
