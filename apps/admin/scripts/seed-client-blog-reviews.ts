/**
 * Seed client content:
 * - 4 blog posts (published, no cover image)
 * - customer reviews into testimonials (approved)
 *
 * Idempotent: updates by slug (blog) and name+text (reviews).
 */
import "dotenv/config";
import { config } from "dotenv";
import { resolve } from "path";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local") });

import { db } from "../src/lib/db";
import { blogPosts, testimonials } from "../src/lib/schema";

const BLOG_POSTS = [
  {
    title: "How Much Does Artificial Turf Cost in Central Florida?",
    slug: "artificial-turf-cost-central-florida",
    metaTitle: "Artificial Turf Cost in Central Florida | AG&P Outdoor LLC",
    metaDescription:
      "Understand what affects artificial turf pricing in Central Florida, including base prep, drainage, project size, and turf quality.",
    content: `
      <h2>What changes the price of a turf project?</h2>
      <p>The final cost depends on more than turf itself. Proper installation includes demolition, base preparation, drainage planning, and finishing details.</p>
      <h2>Main pricing factors</h2>
      <ul>
        <li><strong>Project size:</strong> larger areas can reduce cost per square foot.</li>
        <li><strong>Current yard condition:</strong> more excavation can increase labor.</li>
        <li><strong>Drainage needs:</strong> low spots and poor grading need correction.</li>
        <li><strong>Turf type:</strong> blade height, density, and use case affect price.</li>
      </ul>
      <p>At AG&P Outdoor LLC, we provide transparent estimates and explain each line item before work starts.</p>
    `,
  },
  {
    title: "Backyard Turf Installation: Step-by-Step Process",
    slug: "backyard-turf-installation-step-by-step",
    metaTitle: "Backyard Turf Installation Process | AG&P Outdoor LLC",
    metaDescription:
      "See how a professional backyard turf installation works from removal and compaction to seams and final brush-up.",
    content: `
      <h2>Professional installation makes the difference</h2>
      <p>A clean-looking turf yard starts with what happens below the surface. Our process is structured to prevent movement, puddling, and visible seams.</p>
      <h2>Our installation workflow</h2>
      <ol>
        <li>Site inspection and measurement.</li>
        <li>Remove natural grass and organic material.</li>
        <li>Set grade and install compacted base layers.</li>
        <li>Lay, seam, and secure turf perimeter.</li>
        <li>Infill, brushing, cleanup, and final walkthrough.</li>
      </ol>
      <p>This method delivers a durable, low-maintenance lawn ready for daily use.</p>
    `,
  },
  {
    title: "Pet Turf Guide: Clean, Safe, and Easy to Maintain",
    slug: "pet-turf-guide-clean-safe-maintenance",
    metaTitle: "Pet Turf Installation Guide | AG&P Outdoor LLC",
    metaDescription:
      "Learn how pet-friendly artificial turf is installed for odor control, drainage performance, and easy daily maintenance.",
    content: `
      <h2>Why pet owners choose synthetic turf</h2>
      <p>Pet turf can stay clean and green year-round while reducing mud and wear in high-traffic zones.</p>
      <h2>What matters in pet installations</h2>
      <ul>
        <li>Fast drainage through the base and backing.</li>
        <li>Proper infill selection for comfort and odor control.</li>
        <li>Durable seams and edge anchoring for active dogs.</li>
        <li>Simple rinse-and-clean routine.</li>
      </ul>
      <p>With the right construction, pet areas remain comfortable and low-maintenance for the long term.</p>
    `,
  },
  {
    title: "Putting Green at Home: Design Tips for Real Practice",
    slug: "home-putting-green-design-tips",
    metaTitle: "Home Putting Green Design Tips | AG&P Outdoor LLC",
    metaDescription:
      "Plan a better home putting green with the right shape, speed, and slope so practice feels realistic and consistent.",
    content: `
      <h2>Build a green that helps your game</h2>
      <p>A quality home putting green should be enjoyable and predictable. The key is balancing contour, speed, and usability.</p>
      <h2>Design considerations</h2>
      <ul>
        <li>Choose cup positions that create varied drills.</li>
        <li>Use subtle contour transitions, not extreme slopes.</li>
        <li>Select turf speed to match your practice goals.</li>
        <li>Ensure stable base compaction for consistent roll.</li>
      </ul>
      <p>Our team customizes each putting green for realistic performance and long-term durability.</p>
    `,
  },
];

const REVIEWS = [
  {
    name: "Brian Heaney",
    text: "Absolutely awesome job by Thulio! The area was the last piece of the backyard not done and he didn't disappoint. I definitely asked 4000 questions and he was patient and answered every single one. Everything he said was spot on. Truly appreciate the work!",
  },
  {
    name: "Louise Share",
    text: "Thulio and his team did an amazing job. Love my new putting green. Maintenance free now. I can't believe such a great transformation in two days. Thank you!",
  },
  {
    name: "Karen Montefusco",
    text: "Looks beautiful, the guys were great. Very professional. Would definitely recommend!",
  },
  {
    name: "Kelly Abel",
    text: "Great install, the crew was awesome. They worked so hard, got through yard obstacles and made sure it was done with excellence. Highly recommend!",
  },
  {
    name: "Bruno Lucena",
    text: "They did an amazing job installing synthetic grass in my backyard. The transformation is incredible and the workers were polite, respectful, and very professional throughout the entire process.",
  },
  {
    name: "Alex Garrao",
    text: "Thulio e sua equipe fizeram um trabalho incrivel no meu quintal.",
  },
  {
    name: "Fred Vieira",
    text: "I've been thrilled with my new artificial grass installation done by Thulio and his crew. They transformed my backyard into a lush, green oasis. Highly recommended!",
  },
  {
    name: "Norah Rocha",
    text: "Outstanding way to do things. Amazing results, finished on the due date and left everything clean. Very respectful and professional workers.",
  },
  {
    name: "Dinaz Irani",
    text: "Thulio and his team did a great job. They showed up on time and completed the project to my expectations. I highly recommend them.",
  },
  {
    name: "Don Covey",
    text: "We have used them in the past and will continue to use them in the future. Incredible work, professional and pleasant to work with, good prices and attention to detail A++++.",
  },
  {
    name: "Israel Castro",
    text: "Very professional. I am thrilled with the work that has been done to transform my entire backyard at an affordable price.",
  },
  {
    name: "Drone",
    text: "Very professional and done a great work.",
  },
  {
    name: "Paula Villane",
    text: "Very professional. Excellent work!",
  },
  {
    name: "Iran Barros",
    text: "Great service and very professional.",
  },
  {
    name: "Sunshine Brick Pavers Co.",
    text: "Excellent partnership and professional execution from start to finish.",
  },
];

async function upsertBlog() {
  const now = new Date();
  let inserted = 0;
  let updated = 0;

  for (const post of BLOG_POSTS) {
    const [existing] = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug))
      .limit(1);

    if (existing) {
      await db
        .update(blogPosts)
        .set({
          title: post.title,
          content: post.content,
          coverImage: null,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          status: "published",
          publishedAt: now,
        })
        .where(eq(blogPosts.id, existing.id));
      updated += 1;
      continue;
    }

    await db.insert(blogPosts).values({
      title: post.title,
      slug: post.slug,
      content: post.content,
      coverImage: null,
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      status: "published",
      publishedAt: now,
      createdAt: now,
    });
    inserted += 1;
  }

  console.log(`[seed-client-content] blog inserted=${inserted} updated=${updated}`);
}

async function upsertReviews() {
  const now = new Date();
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < REVIEWS.length; i += 1) {
    const review = REVIEWS[i];
    const [existing] = await db
      .select({ id: testimonials.id })
      .from(testimonials)
      .where(and(eq(testimonials.name, review.name), eq(testimonials.text, review.text)))
      .limit(1);

    if (existing) {
      await db
        .update(testimonials)
        .set({
          location: null,
          photoUrl: null,
          rating: 5,
          approved: true,
          sortOrder: i,
        })
        .where(eq(testimonials.id, existing.id));
      updated += 1;
      continue;
    }

    await db.insert(testimonials).values({
      name: review.name,
      location: null,
      photoUrl: null,
      text: review.text,
      rating: 5,
      approved: true,
      sortOrder: i,
      createdAt: now,
    });
    inserted += 1;
  }

  console.log(`[seed-client-content] reviews inserted=${inserted} updated=${updated}`);
}

async function run() {
  await upsertBlog();
  await upsertReviews();
  console.log("[seed-client-content] done");
}

run().catch((err) => {
  console.error("[seed-client-content] failed:", err);
  process.exit(1);
});
