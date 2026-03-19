import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from '@/components/Logo.jsx';
import SiteBanner from '@/components/SiteBanner.jsx';
import { useSite } from '@/lib/SiteProvider.jsx';

const Footer = () => {
  const site = useSite();
  const currentYear = new Date().getFullYear();

  const serviceAreas = typeof site.about_service_areas === 'string' && site.about_service_areas.trim().length > 0
    ? site.about_service_areas.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Ocoee', 'Orlando', 'Winter Garden', 'Windermere', 'Clermont', 'Kissimmee', 'Apopka', 'Central Florida'];

  const services = [
    { name: 'Residential Turf', path: '/services/residential-turf' },
    { name: 'Putting Greens', path: '/services/putting-green' },
    { name: 'Pet Turf', path: '/services/pet-turf' },
    { name: 'Commercial Turf', path: '/services/commercial-turf' },
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Blog', path: '/blog' },
  ];

  const resourceLinks = [
    { name: 'FAQ', path: '/faq' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const allLinks = [...services, ...companyLinks, ...resourceLinks];

  // LocalBusiness Schema
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": site.companyName,
    "image": site.logoUrl,
    "description": site.company_description || "Professional artificial turf installation in Central Florida.",
    "address": site.address,
    "telephone": site.phone,
    "email": site.email,
    "url": site.company_website,
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"], "opens": "09:00", "closes": "18:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "09:00", "closes": "18:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "10:00", "closes": "14:00" }
    ],
    "priceRange": "$$",
    "areaServed": serviceAreas.map(area => ({ "@type": "City", "name": area }))
  };

  return (
    <>
      {site.footerBanners && site.footerBanners.length > 0 && (
        <SiteBanner banners={site.footerBanners} position="footer" />
      )}
      <footer className="font-header bg-footer-bg text-white">
        <script type="application/ld+json">
          {JSON.stringify(businessSchema)}
        </script>

        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Main row: Brand + Contact + Hours */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 pb-5 border-b border-white/10">
            <div className="md:col-span-1">
              <div className="mb-3">
                <Logo size="sm" />
              </div>
              <p className="font-semibold text-white text-sm">{site.companyName}</p>
              <p className="text-footer-text text-xs mt-1 leading-relaxed">
                {site.company_description
                  ? site.company_description.slice(0, 100) + (site.company_description.length > 100 ? '…' : '')
                  : 'Professional artificial turf installation. Licensed & Insured.'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <a href={`tel:${site.phone}`} className="flex items-center text-footer-text hover:text-footer-accent transition-colors">
                  <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                  {site.phone}
                </a>
                <a href={`mailto:${site.email}`} className="flex items-center text-footer-text hover:text-footer-accent transition-colors">
                  <Mail className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                  <span className="truncate">{site.email}</span>
                </a>
                <div className="flex items-start text-footer-text">
                  <MapPin className="h-3.5 w-3.5 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs">{site.address}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Hours</h3>
              <p className="text-footer-text text-xs leading-relaxed">
                Mon–Thu 9am–6pm · Fri 9am–6pm<br />
                Sat 10am–2pm · Sun Closed
              </p>
              <p className="text-footer-muted text-xs mt-3">
                Serving: {serviceAreas.join(', ')}
              </p>
            </div>
          </div>

          {/* Links row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 text-xs">
            {allLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-footer-text hover:text-footer-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-footer-muted text-xs">
              © {currentYear} {site.companyName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
