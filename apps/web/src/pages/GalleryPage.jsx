import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from 'framer-motion';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtons.jsx';
import { useSite } from '@/lib/SiteProvider.jsx';
import { fetchPortfolio, fetchSeo } from '@/lib/api';

const GalleryPage = () => {
  const site = useSite();
  const [gallery, setGallery] = useState([]);
  const [filter, setFilter] = useState('all');
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('portfolio').then((data) => data && setSeo(data));
  }, []);

  useEffect(() => {
    fetchPortfolio().then((data) => {
      if (data && data.length > 0) {
        setGallery(data.map((item) => ({
          id: item.id,
          url: item.imageUrl,
          title: item.title,
          category: item.category || 'residential',
          description: item.description,
          beforeUrl: item.beforeImageUrl,
        })));
      }
    });
  }, []);

  const categories = ['all', ...new Set(gallery.map((g) => g.category))];
  const filtered = filter === 'all' ? gallery : gallery.filter((g) => g.category === filter);

  return (
    <>
      <Seo
        title={seo?.titleTag || `Project Gallery | ${site.companyName}`}
        description={seo?.metaDescription || `Browse our portfolio of professional installations. ${site.companyName}`}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-[#2c3e50] mb-6">Project Gallery</h1>
              <p className="text-xl text-gray-600">Explore our portfolio of professional installations</p>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === cat
                      ? 'bg-[#2d5016] text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((image, index) => (
                <motion.div
                  key={image.id ?? image.url ?? index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="text-[#2d5016] text-sm font-semibold mb-2">{image.category}</span>
                    <p className="text-white font-bold text-xl">{image.title}</p>
                    {image.description && (
                      <p className="text-white/80 text-sm mt-1 line-clamp-2">{image.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default GalleryPage;
