import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import { useSite } from '@/lib/SiteProvider.jsx';
import { fetchTestimonials, fetchSeo } from '@/lib/api';

const ReviewsPage = () => {
  const site = useSite();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('reviews').then((data) => data && setSeo(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTestimonials().then((data) => {
      setLoading(false);
      if (Array.isArray(data)) {
        setReviews(data.map((t) => ({
          name: t.name,
          location: t.location || '',
          text: t.text,
          rating: t.rating,
          photoUrl: t.photoUrl,
        })));
      }
    });
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <>
      <Seo
        title={seo?.titleTag || `Customer Reviews | ${site.companyName}`}
        description={seo?.metaDescription || `Read real customer reviews of ${site.companyName}. See why customers trust us for quality service.`}
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
            <h1 className="text-5xl md:text-6xl font-bold text-[#2c3e50] mb-6">Customer Reviews</h1>
            <p className="text-xl text-gray-600">Real feedback from real customers</p>
            <div className="flex items-center justify-center mt-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-8 w-8 ${i < Math.round(Number(avgRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="ml-3 text-2xl font-bold text-[#2c3e50]">{avgRating} Average Rating</span>
            </div>
          </motion.div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No reviews yet.</div>
          ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="border-t border-gray-200 pt-4 flex items-center gap-3">
                  {review.photoUrl && (
                    <img src={review.photoUrl} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-bold text-[#2c3e50]">{review.name}</p>
                    {review.location && <p className="text-sm text-gray-600">{review.location}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ReviewsPage;
