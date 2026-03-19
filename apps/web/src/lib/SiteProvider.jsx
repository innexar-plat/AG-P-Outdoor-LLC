import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSettings, fetchBanners } from './api';

const SiteContext = createContext(null);

const DEFAULTS = {
  company_name: 'AG&P Outdoor LLC',
  company_email: 'INFO@APGOUTDOOR.COM',
  company_phone: '772-226-9087',
  company_address: '878 Keaton Pkwy, Ocoee, FL 34761',
  company_description: 'Professional artificial turf installation done right — with expert base preparation, drainage solutions, and clean finishes.',
  company_tagline: 'Professional Turf Installation',
  company_website: 'https://agpoutdoor.com',
  company_whatsapp: '7722269087',
  logo_url: '/qr/agp-logo-source.png',
  cta_primary_text: 'Free Estimate',
  cta_primary_url: '/contact',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
  social_twitter: '',
  social_tiktok: '',
  social_linkedin: '',
};

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [headerBanners, setHeaderBanners] = useState([]);
  const [footerBanners, setFooterBanners] = useState([]);
  const [popupBanners, setPopupBanners] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [settingsData, hBanners, fBanners, pBanners] = await Promise.all([
        fetchSettings(),
        fetchBanners('site_header'),
        fetchBanners('site_footer'),
        fetchBanners('site_popup'),
      ]);

      if (cancelled) return;

      if (settingsData) {
        setSettings((prev) => ({ ...prev, ...settingsData }));
      }
      setHeaderBanners(hBanners || []);
      setFooterBanners(fBanners || []);
      setPopupBanners(pBanners || []);
      setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const value = {
    ...settings,
    headerBanners,
    footerBanners,
    popupBanners,
    loaded,
    phone: settings.company_phone || DEFAULTS.company_phone,
    email: settings.company_email || DEFAULTS.company_email,
    companyName: settings.company_name || DEFAULTS.company_name,
    tagline: settings.company_tagline || DEFAULTS.company_tagline,
    address: settings.company_address || DEFAULTS.company_address,
    logoUrl: settings.logo_url || DEFAULTS.logo_url,
    whatsapp: settings.company_whatsapp || DEFAULTS.company_whatsapp,
    ctaText: settings.cta_primary_text || DEFAULTS.cta_primary_text,
    ctaUrl: settings.cta_primary_url || DEFAULTS.cta_primary_url,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within SiteProvider');
  return ctx;
}
