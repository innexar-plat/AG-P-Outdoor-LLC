import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { useSite } from '@/lib/SiteProvider.jsx';

function ensureAbsoluteUrl(base, url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const trimmedBase = base?.replace(/\/+$/, '');
  const trimmedUrl = url.startsWith('/') ? url : `/${url}`;
  return `${trimmedBase}${trimmedUrl}`;
}

export default function Seo({
  title,
  description,
  ogImage,
  canonical,
  noIndex = false,
  noFollow = false,
}) {
  const site = useSite();
  const location = useLocation();

  const baseUrl = site.company_website?.replace(/\/+$/, '') || '';
  const canonicalUrl = canonical || `${baseUrl}${location.pathname}`;
  const ogUrl = canonicalUrl;
  const ogImageUrl = ensureAbsoluteUrl(baseUrl, ogImage || site.logoUrl);
  const finalTitle = title || `${site.companyName} • ${site.tagline}`;
  const finalDescription = description || site.company_description;
  const robots = noIndex ? 'noindex, nofollow' : noFollow ? 'index, nofollow' : 'index, follow';

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.companyName} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={ogUrl} />
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
      {site.social_twitter && <meta name="twitter:site" content={site.social_twitter} />}

      <meta name="robots" content={robots} />
    </Helmet>
  );
}
