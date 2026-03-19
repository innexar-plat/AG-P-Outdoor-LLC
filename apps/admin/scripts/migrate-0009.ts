/**
 * Content migration 0009:
 * - upsert core company settings
 * - upsert 4 blog posts (published)
 * - upsert 5 approved testimonials
 *
 * Safe to run multiple times.
 */
import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { blogPosts, settings, testimonials } from "../src/lib/schema";

const COMPANY_SETTINGS: Record<string, string> = {
  company_name: "AG&P Outdoor LLC",
  company_email: "INFO@APGOUTDOOR.COM",
  company_phone: "772-226-9087",
  company_address: "878 Keaton Pkwy, Ocoee, FL 34761",
  company_description:
    "Professional artificial turf installation with proper base prep, drainage, and clean finishing for residential and commercial projects.",
  company_tagline: "Professional Turf Installation",
  cta_primary_text: "Free Estimate",
  cta_primary_url: "/contact",
};

const BLOG_CONTENT: Array<{
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
}> = [
  {
    title: "How We Build Long-Lasting Artificial Turf Bases in Florida",
    slug: "how-we-build-long-lasting-artificial-turf-bases-florida",
    coverImage:
      "https://images.unsplash.com/photo-1592409065733-28f1e8e6f4a8?auto=format&fit=crop&w=1400&q=80",
    metaTitle: "Artificial Turf Base Preparation Guide | AG&P Outdoor LLC",
    metaDescription:
      "Learn how AG&P Outdoor prepares stable, long-lasting turf bases in Florida with proper excavation, compaction, and drainage.",
    content: `
      <h2>Why the base layer matters</h2>
      <p>Most turf failures come from poor base work, not from the turf itself. At AG&amp;P Outdoor LLC, we treat base preparation as the most important part of every installation.</p>
      <h2>Our process</h2>
      <ul>
        <li>Remove existing grass and unstable soil.</li>
        <li>Set correct grade for water flow and drainage.</li>
        <li>Install and compact aggregate in controlled lifts.</li>
        <li>Fine-level the surface before laying turf.</li>
      </ul>
      <p>This method improves longevity, appearance, and day-to-day usability of the final turf surface.</p>
    `,
  },
  {
    title: "5 Signs Your Yard Needs Drainage and Grading Before Turf",
    slug: "5-signs-yard-needs-drainage-grading-before-turf",
    coverImage:
      "https://images.unsplash.com/photo-1572085313466-6710de8d7ba3?auto=format&fit=crop&w=1400&q=80",
    metaTitle: "Drainage and Grading Before Turf | AG&P Outdoor LLC",
    metaDescription:
      "See the top warning signs that indicate your property needs drainage and grading before artificial turf installation.",
    content: `
      <h2>Do not skip drainage planning</h2>
      <p>Florida rain can expose hidden grade problems quickly. Installing turf without correcting drainage first can lead to ponding, shifting, and premature wear.</p>
      <h2>Common warning signs</h2>
      <ol>
        <li>Water pooling after moderate rain.</li>
        <li>Soft spots that stay wet for days.</li>
        <li>Visible erosion lines on slopes.</li>
        <li>Water pushing toward foundations.</li>
        <li>Prior landscaping repeatedly failing in the same area.</li>
      </ol>
      <p>Our team evaluates these conditions before installation and applies grading solutions designed for the specific site.</p>
    `,
  },
  {
    title: "Residential vs Commercial Turf: What Changes in Installation",
    slug: "residential-vs-commercial-turf-installation-differences",
    coverImage:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80",
    metaTitle: "Residential vs Commercial Turf Installation | AG&P Outdoor LLC",
    metaDescription:
      "Understand how residential and commercial artificial turf projects differ in planning, materials, and execution.",
    content: `
      <h2>Not all projects are built the same</h2>
      <p>Residential and commercial installs share core principles, but project constraints are different. Traffic loads, usage patterns, and maintenance expectations can change the installation strategy.</p>
      <h2>Main differences</h2>
      <ul>
        <li><strong>Residential:</strong> comfort, aesthetics, and family/pet use.</li>
        <li><strong>Commercial:</strong> durability, foot traffic, and brand presentation.</li>
        <li><strong>Sports/putting areas:</strong> precision speed, seam planning, and surface consistency.</li>
      </ul>
      <p>We select materials and base specs based on actual use, not one-size-fits-all packages.</p>
    `,
  },
  {
    title: "Putting Green Turf: How We Balance Speed, Break, and Durability",
    slug: "putting-green-turf-speed-break-durability",
    coverImage:
      "https://images.unsplash.com/photo-1560932684-11b0d92f4fdf?auto=format&fit=crop&w=1400&q=80",
    metaTitle: "Custom Putting Green Installation Tips | AG&P Outdoor LLC",
    metaDescription:
      "Discover how AG&P Outdoor designs putting green turf for realistic roll, consistent speed, and long-term durability.",
    content: `
      <h2>Performance starts below the surface</h2>
      <p>Great putting greens depend on detailed shaping and stable construction. Turf selection is only one part of the result.</p>
      <h2>What we tune in each project</h2>
      <ul>
        <li>Surface grade and contour transitions.</li>
        <li>Sub-base compaction consistency.</li>
        <li>Cup locations and practice flow.</li>
        <li>Roll speed for realistic play at home.</li>
      </ul>
      <p>The goal is a practice surface that feels premium and stays consistent through weather changes.</p>
    `,
  },
];

const REVIEW_CONTENT: Array<{
  name: string;
  location: string;
  text: string;
  rating: number;
  sortOrder: number;
}> = [
  {
    name: "Michael R.",
    location: "Winter Garden, FL",
    text: "AG&P transformed our backyard with excellent base prep and clean finishing. The team was punctual, respectful, and very detail-oriented.",
    rating: 5,
    sortOrder: 0,
  },
  {
    name: "Sandra T.",
    location: "Ocoee, FL",
    text: "We hired them for pet turf and drainage corrections. No more mud and no standing water after storms. Very professional work.",
    rating: 5,
    sortOrder: 1,
  },
  {
    name: "Carlos M.",
    location: "Orlando, FL",
    text: "Our putting green came out better than expected. The shape, speed, and look are all excellent. Communication was great from start to finish.",
    rating: 5,
    sortOrder: 2,
  },
  {
    name: "Jessica L.",
    location: "Clermont, FL",
    text: "From quote to final walkthrough, everything was clear and organized. The turf looks premium and the seams are practically invisible.",
    rating: 5,
    sortOrder: 3,
  },
  {
    name: "David P.",
    location: "Kissimmee, FL",
    text: "Commercial area installation was completed on schedule and with minimal disruption. Great crew and solid workmanship.",
    rating: 5,
    sortOrder: 4,
  },
];

async function upsertSettings() {
  for (const [key, value] of Object.entries(COMPANY_SETTINGS)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value },
      });
  }
}

async function upsertBlogPosts() {
  const now = new Date();

  for (const post of BLOG_CONTENT) {
    const existing = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(blogPosts)
        .set({
          title: post.title,
          content: post.content,
          coverImage: post.coverImage,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          status: "published",
          publishedAt: now,
        })
        .where(eq(blogPosts.id, existing[0].id));
      continue;
    }

    await db.insert(blogPosts).values({
      title: post.title,
      slug: post.slug,
      content: post.content,
      coverImage: post.coverImage,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      status: "published",
      publishedAt: now,
      createdAt: now,
    });
  }
}

async function upsertTestimonials() {
  const now = new Date();

  for (const review of REVIEW_CONTENT) {
    const existing = await db
      .select({ id: testimonials.id })
      .from(testimonials)
      .where(and(eq(testimonials.name, review.name), eq(testimonials.text, review.text)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(testimonials)
        .set({
          location: review.location,
          rating: review.rating,
          approved: true,
          sortOrder: review.sortOrder,
        })
        .where(eq(testimonials.id, existing[0].id));
      continue;
    }

    await db.insert(testimonials).values({
      name: review.name,
      location: review.location,
      photoUrl: null,
      text: review.text,
      rating: review.rating,
      approved: true,
      sortOrder: review.sortOrder,
      createdAt: now,
    });
  }
}

async function migrate0009() {
  await upsertSettings();
  await upsertBlogPosts();
  await upsertTestimonials();
  console.log("migrate-0009 done: settings + blog posts + testimonials");
}

migrate0009().catch((err) => {
  console.error("migrate-0009 failed:", err);
  process.exit(1);
});
