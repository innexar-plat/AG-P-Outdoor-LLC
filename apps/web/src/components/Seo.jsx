import { useEffect } from 'react';
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

  useEffect(() => {
    if (finalTitle) {
      document.title = finalTitle;
    }

    const ensureMeta = (attrName, attrValue, content) => {
      if (!content) return;
      let node = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!node) {
        node = document.createElement('meta');
        node.setAttribute(attrName, attrValue);
        document.head.appendChild(node);
      }
      node.setAttribute('content', content);
    };

    const ensureCanonical = (url) => {
      if (!url) return;
      let node = document.head.querySelector('link[rel="canonical"]');
      if (!node) {
        node = document.createElement('link');
        node.setAttribute('rel', 'canonical');
        document.head.appendChild(node);
      }
      node.setAttribute('href', url);
    };

    ensureCanonical(canonicalUrl);
    ensureMeta('name', 'description', finalDescription);
    ensureMeta('property', 'og:type', 'website');
    ensureMeta('property', 'og:site_name', site.companyName);
    ensureMeta('property', 'og:title', finalTitle);
    ensureMeta('property', 'og:description', finalDescription);
    ensureMeta('property', 'og:url', ogUrl);

    if (ogImageUrl) {
      ensureMeta('property', 'og:image', ogImageUrl);
      ensureMeta('name', 'twitter:image', ogImageUrl);
    }

    ensureMeta('name', 'twitter:card', 'summary_large_image');
    ensureMeta('name', 'twitter:title', finalTitle);
    ensureMeta('name', 'twitter:description', finalDescription);
    if (site.social_twitter) {
      ensureMeta('name', 'twitter:site', site.social_twitter);
    }
    ensureMeta('name', 'robots', robots);
  }, [
    canonicalUrl,
    finalDescription,
    finalTitle,
    ogImageUrl,
    ogUrl,
    robots,
    site.companyName,
    site.social_twitter,
  ]);

  return null;
}
