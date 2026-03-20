import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion } from '@/lib/motion-lite.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtonsDeferred.jsx';
import { useSite } from '@/lib/SiteProvider.jsx';
import { fetchPortfolio, fetchPortfolioMeta, fetchSeo } from '@/lib/api';

const GalleryPage = () => {
  const site = useSite();
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('portfolio').then((data) => data && setSeo(data));
  }, []);

  useEffect(() => {
    fetchPortfolioMeta().then((data) => {
      if (!data) return;
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setTags(Array.isArray(data.tags) ? data.tags : []);
    });
  }, []);

  useEffect(() => {
    fetchPortfolio({
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      tag: tagFilter !== 'all' ? tagFilter : undefined,
      q: search.trim() || undefined,
    }).then((data) => {
      if (!Array.isArray(data)) {
        setGallery([]);
        return;
      }
      setGallery(data.map((item) => ({
        id: item.id,
        url: item.imageUrl,
        title: item.title,
        categories: Array.isArray(item.categories) ? item.categories : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        description: item.description,
        beforeUrl: item.beforeImageUrl,
      })));
    });
  }, [categoryFilter, tagFilter, search]);

  const categoryOptions = [{ slug: 'all', name: 'All categories' }, ...categories];
  const tagOptions = [{ slug: 'all', name: 'All tags' }, ...tags];
  const filtered = gallery;

  const clearFilters = () => {
    setCategoryFilter('all');
    setTagFilter('all');
    setSearch('');
  };

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
              <h1 className="text-5xl md:text-6xl font-bold text-[#1f3a2e] mb-6">Project Gallery</h1>
              <p className="text-xl text-gray-600">Explore our portfolio of professional installations</p>
            </div>

            <div className="mb-8 grid gap-3 lg:grid-cols-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#2f6f46]"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#2f6f46]"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>

              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-[#2f6f46]"
              >
                {tagOptions.map((tag) => (
                  <option key={tag.slug} value={tag.slug}>{tag.name}</option>
                ))}
              </select>

              <button
                onClick={clearFilters}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Clear filters
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {categoryOptions.slice(1).map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setCategoryFilter(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    categoryFilter === cat.slug
                      ? 'bg-[#2f6f46] text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat.name}
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
                    <span className="text-[#2f6f46] text-sm font-semibold mb-2">{image.categories[0]?.name || 'Uncategorized'}</span>
                    <p className="text-white font-bold text-xl">{image.title}</p>
                    {image.description && (
                      <p className="text-white/80 text-sm mt-1 line-clamp-2">{image.description}</p>
                    )}
                    {image.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag) => (
                          <span key={tag.id} className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                            {tag.name}
                          </span>
                        ))}
                      </div>
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
