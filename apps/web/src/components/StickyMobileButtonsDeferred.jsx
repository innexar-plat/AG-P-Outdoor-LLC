import React, { lazy, Suspense, useEffect, useState } from 'react';

const StickyMobileButtons = lazy(() => import('./StickyMobileButtons.jsx'));

export default function StickyMobileButtonsDeferred() {
  const [isMobile, setIsMobile] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 1023px)').matches;
    setIsMobile(mobile);
    if (!mobile) return;

    const id = window.setTimeout(() => setShouldRender(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!isMobile || !shouldRender) return null;

  return (
    <Suspense fallback={null}>
      <StickyMobileButtons />
    </Suspense>
  );
}
