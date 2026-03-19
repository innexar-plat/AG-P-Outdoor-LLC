import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/Logo.jsx';
import { useSite } from '@/lib/SiteProvider.jsx';

const Header = () => {
  const site = useSite();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const rawAdminUrl = import.meta.env.VITE_ADMIN_URL ?? 'http://localhost:3001';
  const normalizedAdminUrl = rawAdminUrl.replace(/\/+$/, '');
  const adminUrl = normalizedAdminUrl.endsWith('/admin') ? normalizedAdminUrl : `${normalizedAdminUrl}/admin`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { name: 'Residential Turf', path: '/services/residential-turf' },
    { name: 'Putting Greens', path: '/services/putting-green' },
    { name: 'Pet Turf', path: '/services/pet-turf' },
    { name: 'Commercial Turf', path: '/services/commercial-turf' },
    { name: 'Pavers', path: '/services/pavers' },
    { name: 'Drainage & Grading', path: '/services/drainage-grading' },
    { name: 'Natural Grass Removal', path: '/services/grass-removal' },
  ];

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About Us', path: '/about' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`font-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#dff3ed] border-b border-[#bfded6] shadow-[0_10px_26px_rgba(20,73,67,0.14)] py-2'
            : 'bg-[#dff3ed] border-b border-[#bfded6] shadow-[0_3px_12px_rgba(20,73,67,0.08)] py-3'
        }`}
      >
        <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 sm:space-x-4">
            <Logo size="sm" disableLink />
            <div>
              <span className="text-header-text font-semibold text-lg sm:text-xl tracking-tight">{site.companyName}</span>
              <p className="text-xs text-slate-500 hidden sm:block font-normal tracking-wide">{site.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-header-hover ${
                location.pathname === '/' ? 'text-header-accent' : 'text-header-text'
              }`}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-sm font-medium text-header-text hover:text-header-hover transition-colors">
                Services <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {services.map((service) => (
                  <DropdownMenuItem key={service.path} asChild>
                    <Link to={service.path} className="cursor-pointer">
                      {service.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-header-hover ${
                  location.pathname === link.path ? 'text-header-accent' : 'text-header-text'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center space-x-4">
            <a
              href={adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-header-text hover:text-header-hover transition-colors"
            >
              Admin
            </a>
            <a href={`tel:${site.phone}`} className="text-header-accent font-semibold flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              {site.phone}
            </a>
            <Link to={site.ctaUrl}>
              <Button className="bg-header-accent hover:bg-header-accent-hover text-white font-semibold px-6">
                {site.ctaText}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-header-text hover:text-header-hover"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-4 pb-4 border-t border-teal-200/70"
            >
              <div className="flex flex-col space-y-3 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium py-2 transition-colors hover:text-header-hover ${
                      location.pathname === link.path ? 'text-header-accent' : 'text-header-text'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-teal-200/70 pt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Services</p>
                  {services.map((service) => (
                    <Link
                      key={service.path}
                      to={service.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm py-2 text-header-text hover:text-header-hover"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
                <a
                  href={adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm font-medium py-2 text-header-text hover:text-header-hover"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </a>
                <Link to={site.ctaUrl} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-header-accent hover:bg-header-accent-hover text-white font-semibold mt-4">
                    {site.ctaText}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </nav>
      </header>
      <div className="h-[88px] lg:h-[92px]" aria-hidden />
    </>
  );
};

export default Header;