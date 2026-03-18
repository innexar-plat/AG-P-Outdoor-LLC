import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { SiteProvider } from './lib/SiteProvider.jsx';
import { PageTracker } from './lib/PageTracker.jsx';
import SiteBannerWrapper from './components/SiteBannerWrapper.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import { Toaster } from './components/ui/toaster.jsx';
import HomePage from './pages/HomePage.jsx';
import ResidentialTurfPage from './pages/ResidentialTurfPage.jsx';
import PuttingGreenPage from './pages/PuttingGreenPage.jsx';
import PetTurfPage from './pages/PetTurfPage.jsx';
import CommercialTurfPage from './pages/CommercialTurfPage.jsx';
import PaversPage from './pages/PaversPage.jsx';
import DrainageGradingPage from './pages/DrainageGradingPage.jsx';
import NaturalGrassRemovalPage from './pages/NaturalGrassRemovalPage.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import FAQPage from './pages/FAQPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';

function App() {
  return (
    <SiteProvider>
    <Router>
      <PageTracker />
      <SiteBannerWrapper />
      <ScrollToTop />
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
      <Toaster />
    </Router>
    </SiteProvider>
  );
}

export default App;
