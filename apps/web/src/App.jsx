import React, { lazy, Suspense } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { SiteProvider } from './lib/SiteProvider.jsx';
import { PageTracker } from './lib/PageTracker.jsx';
import SiteBannerWrapper from './components/SiteBannerWrapper.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { Toaster } from './components/ui/toaster.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const ResidentialTurfPage = lazy(() => import('./pages/ResidentialTurfPage.jsx'));
const PuttingGreenPage = lazy(() => import('./pages/PuttingGreenPage.jsx'));
const PetTurfPage = lazy(() => import('./pages/PetTurfPage.jsx'));
const CommercialTurfPage = lazy(() => import('./pages/CommercialTurfPage.jsx'));
const PaversPage = lazy(() => import('./pages/PaversPage.jsx'));
const DrainageGradingPage = lazy(() => import('./pages/DrainageGradingPage.jsx'));
const NaturalGrassRemovalPage = lazy(() => import('./pages/NaturalGrassRemovalPage.jsx'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage.jsx'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage.jsx'));
const FAQPage = lazy(() => import('./pages/FAQPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'));
const GalleryPage = lazy(() => import('./pages/GalleryPage.jsx'));

function App() {
  return (
    <SiteProvider>
    <Router>
      <PageTracker />
      <SiteBannerWrapper />
      <ScrollToTop />
      <main id="main-content">
        <Suspense fallback={<div className="min-h-[40vh]" aria-hidden />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services/residential-turf" element={<ResidentialTurfPage />} />
            <Route path="/services/putting-green" element={<PuttingGreenPage />} />
            <Route path="/services/pet-turf" element={<PetTurfPage />} />
            <Route path="/services/commercial-turf" element={<CommercialTurfPage />} />
            <Route path="/services/pavers" element={<PaversPage />} />
            <Route path="/services/drainage-grading" element={<DrainageGradingPage />} />
            <Route path="/services/grass-removal" element={<NaturalGrassRemovalPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
          </Routes>
        </Suspense>
      </main>
      <Toaster />
    </Router>
    </SiteProvider>
  );
}

export default App;
