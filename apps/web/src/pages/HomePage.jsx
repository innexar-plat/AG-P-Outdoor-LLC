import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Seo from '@/components/Seo.jsx';
import Header from '@/components/Header.jsx';
import HeroHome from '@/components/HeroHome.jsx';
import { useSite } from '@/lib/SiteProvider.jsx';
import { fetchSeo } from '@/lib/api';

const HomePageDeferredSections = lazy(() => import('@/components/home/HomePageDeferredSections.jsx'));
const StickyMobileButtonsDeferred = lazy(() => import('@/components/StickyMobileButtonsDeferred.jsx'));

const HomePage = () => {
  const site = useSite();
  const [seo, setSeo] = useState(null);
  const [shouldLoadStickyButtons, setShouldLoadStickyButtons] = useState(false);
  const [shouldLoadDeferredSections, setShouldLoadDeferredSections] = useState(false);
  const deferredSentinelRef = useRef(null);

  useEffect(() => {
    fetchSeo('home').then((data) => data && setSeo(data));
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) return;

    const stickyDelayId = window.setTimeout(() => setShouldLoadStickyButtons(true), 1200);
    return () => window.clearTimeout(stickyDelayId);
  }, []);

  useEffect(() => {
    const target = deferredSentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadDeferredSections(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '600px 0px',
      }
    );

    observer.observe(target);

    // Safety net: guarantees full content for users who don't scroll during the first seconds.
    const fallbackId = window.setTimeout(() => setShouldLoadDeferredSections(true), 7000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackId);
    };
  }, []);

  return <>
      <Seo
        title={seo?.titleTag || `${site.companyName} - Professional Artificial Turf Installation | Central Florida`}
        description={seo?.metaDescription || "Expert artificial turf installation in Central Florida. Professional base preparation, drainage solutions, and quality installations for residential, commercial, and pet turf. Licensed & Insured."}
        ogImage={seo?.ogImage}
      />

      <Header />
      {shouldLoadStickyButtons ? (
        <Suspense fallback={null}>
          <StickyMobileButtonsDeferred />
        </Suspense>
      ) : null}

      <HeroHome site={site} />

      <div ref={deferredSentinelRef} className="h-px" aria-hidden />

      {shouldLoadDeferredSections ? (
        <Suspense fallback={<section className="py-16" aria-hidden />}>
          <HomePageDeferredSections site={site} />
        </Suspense>
      ) : null}
    </>;
};
export default HomePage;