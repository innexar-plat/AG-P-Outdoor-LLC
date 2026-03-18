import React from 'react';
import { useSite } from '@/lib/SiteProvider.jsx';
import SiteBanner, { SitePopupBanner } from './SiteBanner.jsx';

const SiteBannerWrapper = () => {
  const site = useSite();

  return (
    <>
      {site.headerBanners.length > 0 && (
        <SiteBanner banners={site.headerBanners} position="header" />
      )}
      <SitePopupBanner banners={site.popupBanners} />
    </>
  );
};

export default SiteBannerWrapper;
