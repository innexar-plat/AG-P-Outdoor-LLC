import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from '@/lib/motion-lite.jsx';
import { useSite } from '@/lib/SiteProvider.jsx';

const Logo = ({ size = 'md', onClick, className = '', disableLink = false }) => {
  const site = useSite();
  const localLogoFallback = '/qr/agp-logo-source.png';
  const isLocalLogo = typeof site.logoUrl === 'string' && site.logoUrl.startsWith('/');
  const logoSrc = isLocalLogo ? site.logoUrl : localLogoFallback;
  const sizeClasses = {
    sm: 'h-12 md:h-16',
    md: 'h-16 md:h-20',
    lg: 'h-24 md:h-32',
  };

  const logoContent = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      className={`bg-[#2f6f46] p-2 rounded-xl shadow-md inline-block ${className}`}
      onClick={onClick}
    >
      <img
        src={logoSrc}
        alt={site.companyName}
        className={`${sizeClasses[size]} w-auto object-contain rounded-lg`}
        width="320"
        height="120"
        decoding="async"
        loading="eager"
        onError={(e) => {
          if (e.currentTarget.src.endsWith(localLogoFallback)) return;
          e.currentTarget.src = localLogoFallback;
        }}
      />
    </motion.div>
  );

  if (disableLink || onClick) {
    return logoContent;
  }

  return (
    <Link to="/">
      {logoContent}
    </Link>
  );
};

export default Logo;