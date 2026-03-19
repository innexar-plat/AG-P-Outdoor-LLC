import React, { useState, useEffect } from 'react';
import Seo from '@/components/Seo.jsx';
import { motion, AnimatePresence } from '@/lib/motion-lite.jsx';
import { Calendar, ArrowRight, X } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import StickyMobileButtons from '@/components/StickyMobileButtonsDeferred.jsx';
import { Button } from '@/components/ui/button';
import { useSite } from '@/lib/SiteProvider.jsx';
import { fetchBlogPosts, fetchSeo } from '@/lib/api';

const BlogPage = () => {
  const site = useSite();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [seo, setSeo] = useState(null);

  useEffect(() => {
    fetchSeo('blog').then((data) => data && setSeo(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBlogPosts(50).then((data) => {
      setLoading(false);
      if (Array.isArray(data)) {
        setArticles(data.map((post) => ({
          title: post.title,
          slug: post.slug,
          excerpt: post.metaDescription || (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 200) + '...' : ''),
          coverImage: post.coverImage,
          publishedAt: post.publishedAt || post.createdAt,
          content: post.content || '',
        })));
      }
    });
  }, []);

  return (
    <>
      <Seo
        title={seo?.titleTag || `Blog | ${site.companyName}`}
        description={seo?.metaDescription || `Expert tips, guides, and insights from ${site.companyName}.`}
        ogImage={seo?.ogImage}
      />

      <Header />
      <StickyMobileButtons />

      <section className="pt-32 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-[#1f3a2e] mb-6">Blog</h1>
              <p className="text-xl text-gray-600">Expert tips, guides, and insights</p>
            </div>

            {loading ? (
              <div className="text-center py-16 text-gray-500">Loading...</div>
            ) : articles.length === 0 ? (
              <div className="text-center py-16 text-gray-500">No articles yet.</div>
            ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {articles.map((article, index) => (
                <motion.article
                  key={article.slug || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300"
                >
                  {article.coverImage && (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : ''}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#1f3a2e] mb-3">{article.title}</h2>
                    <p className="text-gray-700 mb-4 line-clamp-3">{article.excerpt}</p>
                    <Button
                      variant="outline"
                      className="border-[#2f6f46] text-[#2f6f46] hover:bg-[#2f6f46] hover:text-white"
                      onClick={() => setSelectedArticle(article)}
                    >
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Article modal */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white rounded-2xl max-w-3xl w-full mx-4 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedArticle.coverImage && (
                <img
                  src={selectedArticle.coverImage}
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover"
                  width="1200"
                  height="256"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {selectedArticle.publishedAt
                      ? new Date(selectedArticle.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : ''}
                  </span>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Close article"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <h1 className="text-3xl font-bold text-[#1f3a2e] mb-6">{selectedArticle.title}</h1>
                <div
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default BlogPage;
