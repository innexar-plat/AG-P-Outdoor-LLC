import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../../../dist/apps/web');
const canonicalOrigin = 'https://agpoutdoor.com';

const routes = [
  {
    path: '/',
    title: 'AG&P Outdoor LLC | Artificial Turf Installation - Central Florida',
    description:
      'Professional artificial turf installation in Central Florida. Expert base preparation, drainage solutions, and quality installations for residential, commercial, and pet turf.',
    heading: 'Artificial Turf Installation in Central Florida',
    intro:
      'AG&P Outdoor LLC delivers premium turf systems for homes and businesses with clean finishes, proper drainage, and durable materials.',
  },
  {
    path: '/about',
    title: 'About AG&P Outdoor LLC | Turf Experts in Central Florida',
    description:
      'Meet AG&P Outdoor LLC, a Central Florida turf installation company focused on quality base preparation, drainage, and long-lasting results.',
    heading: 'About AG&P Outdoor LLC',
    intro:
      'Learn about our installation standards, service approach, and commitment to building turf projects that perform over time.',
  },
  {
    path: '/blog',
    title: 'AG&P Outdoor Blog | Turf Tips, Guides, and Project Insights',
    description:
      'Read practical turf articles from AG&P Outdoor LLC covering maintenance, design ideas, drainage, and installation best practices.',
    heading: 'Turf Tips and Insights',
    intro:
      'Explore practical guidance to help you plan, maintain, and get the most from your synthetic turf project.',
  },
  {
    path: '/contact',
    title: 'Contact AG&P Outdoor LLC | Request a Free Turf Estimate',
    description:
      'Contact AG&P Outdoor LLC to request a free estimate for artificial turf, pavers, drainage, and grass removal services in Central Florida.',
    heading: 'Request a Free Estimate',
    intro:
      'Tell us about your project goals and we will guide you through the best turf solution for your property.',
  },
  {
    path: '/faq',
    title: 'Turf Installation FAQ | AG&P Outdoor LLC',
    description:
      'Get answers to common questions about artificial turf installation, maintenance, durability, drainage, and warranties.',
    heading: 'Frequently Asked Questions',
    intro:
      'Find quick answers about products, installation process, timelines, and long-term care.',
  },
  {
    path: '/gallery',
    title: 'Project Gallery | AG&P Outdoor LLC Turf Installations',
    description:
      'View AG&P Outdoor LLC project photos including residential turf, pet turf, commercial installations, and landscape upgrades.',
    heading: 'Project Gallery',
    intro:
      'Browse recent installations to see design options, finish quality, and transformation results.',
  },
  {
    path: '/reviews',
    title: 'Customer Reviews | AG&P Outdoor LLC',
    description:
      'Read customer reviews and testimonials about AG&P Outdoor LLC artificial turf installations and landscaping services.',
    heading: 'Customer Reviews',
    intro:
      'See what homeowners and businesses are saying about working with our team.',
  },
  {
    path: '/services/commercial-turf',
    title: 'Commercial Turf Installation | AG&P Outdoor LLC',
    description:
      'Professional commercial artificial turf installation for offices, retail areas, common spaces, and other business properties.',
    heading: 'Commercial Turf Installation',
    intro:
      'Durable, low-maintenance turf systems designed for high-traffic commercial environments.',
  },
  {
    path: '/services/drainage-grading',
    title: 'Drainage and Grading Services | AG&P Outdoor LLC',
    description:
      'Drainage and grading services that improve water flow and create a stable foundation for high-quality turf installations.',
    heading: 'Drainage and Grading',
    intro:
      'Protect your investment with proper grading and drainage engineering before turf installation.',
  },
  {
    path: '/services/grass-removal',
    title: 'Natural Grass Removal | AG&P Outdoor LLC',
    description:
      'Natural grass removal services with complete surface prep for a clean, long-lasting synthetic turf installation.',
    heading: 'Natural Grass Removal',
    intro:
      'We remove existing grass and prepare your site correctly for a stable and professional turf finish.',
  },
  {
    path: '/services/pavers',
    title: 'Paver Installation Services | AG&P Outdoor LLC',
    description:
      'Enhance your landscape with professional paver installation integrated with artificial turf and outdoor living spaces.',
    heading: 'Paver Installation',
    intro:
      'Upgrade patios, walkways, and transitions with durable pavers that pair seamlessly with turf.',
  },
  {
    path: '/services/pet-turf',
    title: 'Pet Turf Installation | AG&P Outdoor LLC',
    description:
      'Pet-friendly artificial turf installation with drainage-focused base work for cleaner, safer, and more durable play areas.',
    heading: 'Pet Turf Installation',
    intro:
      'Create a cleaner and more resilient outdoor space for pets with a system built for drainage and easy maintenance.',
  },
  {
    path: '/services/putting-green',
    title: 'Putting Green Installation | AG&P Outdoor LLC',
    description:
      'Custom backyard and commercial putting green installation with precision grading and premium artificial turf surfaces.',
    heading: 'Putting Green Installation',
    intro:
      'Practice at home or upgrade your facility with a smooth, realistic putting surface built to perform.',
  },
  {
    path: '/services/residential-turf',
    title: 'Residential Turf Installation | AG&P Outdoor LLC',
    description:
      'Residential artificial turf installation for front yards, backyards, and family spaces with expert preparation and clean finish.',
    heading: 'Residential Turf Installation',
    intro:
      'Transform your home landscape with low-maintenance, year-round green turf installed to professional standards.',
  },
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function routeUrl(routePath) {
  return routePath === '/' ? `${canonicalOrigin}/` : `${canonicalOrigin}${routePath}`;
}

function upsertTag(html, regex, replacement, insertBefore = '</head>') {
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace(insertBefore, `  ${replacement}\n${insertBefore}`);
}

function buildFallbackMarkup(currentRoute) {
  const links = routes
    .map((route) => {
      const label = route.path === '/' ? 'Home' : route.path.replace(/^\//, '').replace(/-/g, ' ');
      return `<li><a href="${route.path}">${escapeHtml(label)}</a></li>`;
    })
    .join('');

  return [
    '<div id="root">',
    '  <main style="max-width:900px;margin:2rem auto;padding:0 1rem;font-family:DM Sans,Arial,sans-serif;line-height:1.6;color:#1f2937;">',
    `    <h1 style="font-size:2rem;line-height:1.2;margin:0 0 1rem 0;color:#163b24;">${escapeHtml(currentRoute.heading)}</h1>`,
    `    <p style="margin:0 0 1.25rem 0;">${escapeHtml(currentRoute.intro)}</p>`,
    '    <p style="margin:0 0 1rem 0;">Navigate to other pages:</p>',
    `    <ul style="padding-left:1.25rem;display:grid;gap:.35rem;">${links}</ul>`,
    '  </main>',
    '</div>',
  ].join('\n');
}

function renderRouteHtml(templateHtml, route) {
  const canonical = routeUrl(route.path);
  let html = templateHtml;

  html = upsertTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);
  html = upsertTag(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(route.description)}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`
  );
  html = upsertTag(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`
  );
  html = upsertTag(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`
  );

  html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, buildFallbackMarkup(route));
  return html;
}

async function main() {
  const templatePath = path.join(distDir, 'index.html');
  const template = await fs.readFile(templatePath, 'utf8');

  for (const route of routes) {
    const routeHtml = renderRouteHtml(template, route);

    if (route.path === '/') {
      await fs.writeFile(templatePath, routeHtml, 'utf8');
      continue;
    }

    const relativeDir = route.path.replace(/^\//, '');
    const outputDir = path.join(distDir, relativeDir);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'index.html'), routeHtml, 'utf8');
  }

  console.log(`Prerendered ${routes.length} routes into ${distDir}`);
}

main().catch((error) => {
  console.error('Prerender failed:', error);
  process.exit(1);
});
