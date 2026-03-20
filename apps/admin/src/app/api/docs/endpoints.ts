export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  body?: Record<string, string>;
  query?: Record<string, string>;
  response: string;
}

export interface ApiSection {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export const API_DOCS: ApiSection[] = [
  {
    title: "Authentication",
    description: "Better Auth endpoints for sign in/out and session management",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/sign-in/email",
        description: "Sign in with email and password",
        auth: false,
        body: { email: "string (required)", password: "string (required)" },
        response: '{ user, session }',
      },
      {
        method: "POST",
        path: "/api/auth/sign-out",
        description: "Sign out the current user",
        auth: true,
        response: '{ success: true }',
      },
      {
        method: "GET",
        path: "/api/auth/get-session",
        description: "Get current user session",
        auth: true,
        response: '{ user, session }',
      },
    ],
  },
  {
    title: "Blog (Admin)",
    description: "CRUD for blog posts — requires authentication",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/blog",
        description: "List all blog posts (drafts included)",
        auth: true,
        response: '{ data: BlogPost[], error: null }',
      },
      {
        method: "POST",
        path: "/api/admin/blog",
        description: "Create a new blog post",
        auth: true,
        body: {
          title: "string (required)",
          slug: "string (required, unique)",
          content: "string (required, HTML)",
          coverImage: "string? (URL)",
          metaTitle: "string? (max 70 chars)",
          metaDescription: "string? (max 160 chars)",
          status: '"draft" | "published"',
        },
        response: '{ data: BlogPost, error: null }',
      },
      {
        method: "PUT",
        path: "/api/admin/blog/[id]",
        description: "Update a blog post",
        auth: true,
        body: { title: "string?", slug: "string?", content: "string?", status: '"draft" | "published"?' },
        response: '{ data: BlogPost, error: null }',
      },
      {
        method: "DELETE",
        path: "/api/admin/blog/[id]",
        description: "Delete a blog post",
        auth: true,
        response: '{ data: { ok: true }, error: null }',
      },
    ],
  },
  {
    title: "Portfolio (Admin)",
    description: "CRUD for portfolio items",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/portfolio",
        description: "List all portfolio items",
        auth: true,
        response: '{ data: PortfolioItem[], error: null }',
      },
      {
        method: "POST",
        path: "/api/admin/portfolio",
        description: "Create a portfolio item",
        auth: true,
        body: {
          title: "string (required)",
          description: "string?",
          category: '"residential" | "commercial" | "sports"',
          imageUrl: "string (required, URL)",
          beforeImageUrl: "string? (URL)",
          sortOrder: "number?",
          visible: "boolean?",
        },
        response: '{ data: PortfolioItem, error: null }',
      },
      {
        method: "PUT",
        path: "/api/admin/portfolio/[id]",
        description: "Update a portfolio item",
        auth: true,
        response: '{ data: PortfolioItem, error: null }',
      },
      {
        method: "DELETE",
        path: "/api/admin/portfolio/[id]",
        description: "Delete a portfolio item",
        auth: true,
        response: '{ data: { ok: true }, error: null }',
      },
    ],
  },
  {
    title: "Testimonials (Admin)",
    description: "CRUD for customer testimonials with approval flow",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/testimonials",
        description: "List all testimonials (approved and pending)",
        auth: true,
        response: '{ data: Testimonial[], error: null }',
      },
      {
        method: "POST",
        path: "/api/admin/testimonials",
        description: "Create a testimonial",
        auth: true,
        body: {
          name: "string (required)",
          text: "string (required)",
          location: "string?",
          photoUrl: "string? (URL)",
          rating: "number (1-5)",
          approved: "boolean?",
        },
        response: '{ data: Testimonial, error: null }',
      },
      {
        method: "PUT",
        path: "/api/admin/testimonials/[id]",
        description: "Update a testimonial (including approve/reject)",
        auth: true,
        response: '{ data: Testimonial, error: null }',
      },
      {
        method: "DELETE",
        path: "/api/admin/testimonials/[id]",
        description: "Delete a testimonial",
        auth: true,
        response: '{ data: { ok: true }, error: null }',
      },
    ],
  },
  {
    title: "Site Images (Admin)",
    description: "Manage site images with single/gallery/carousel display types",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/images",
        description: "List all site image slots",
        auth: true,
        response: '{ data: SiteImage[], error: null }',
      },
      {
        method: "POST",
        path: "/api/admin/images",
        description: "Create or update an image slot (upsert by slotKey)",
        auth: true,
        body: {
          section: "string (required)",
          slotKey: "string (required, unique)",
          label: "string (required)",
          url: "string (required)",
          altText: "string?",
          displayType: '"single" | "gallery" | "carousel"',
          sortOrder: "number?",
        },
        response: '{ data: SiteImage, error: null }',
      },
    ],
  },
  {
    title: "Banners (Admin)",
    description: "Manage promotional banners for dashboard and site",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/banners",
        description: "List all banners",
        auth: true,
        response: '{ data: Banner[], error: null }',
      },
      {
        method: "POST",
        path: "/api/admin/banners",
        description: "Create a banner",
        auth: true,
        body: {
          title: "string (required)",
          subtitle: "string?",
          imageUrl: "string? (URL)",
          linkUrl: "string? (URL)",
          linkText: "string?",
          placement: '"dashboard" | "site_header" | "site_footer" | "site_popup"',
          bgColor: "string? (hex color)",
          textColor: "string? (hex color)",
          active: "boolean?",
          startsAt: "string? (ISO date)",
          endsAt: "string? (ISO date)",
        },
        response: '{ data: Banner, error: null }',
      },
      {
        method: "PUT",
        path: "/api/admin/banners/[id]",
        description: "Update a banner",
        auth: true,
        response: '{ data: Banner, error: null }',
      },
      {
        method: "DELETE",
        path: "/api/admin/banners/[id]",
        description: "Delete a banner",
        auth: true,
        response: '{ data: { ok: true }, error: null }',
      },
    ],
  },
  {
    title: "Forms (Admin)",
    description: "Form submissions management",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/forms",
        description: "List form submissions with optional filters",
        auth: true,
        query: { formType: '"contact" | "quote" | "callback"', read: '"true" | "false"', from: "ISO date", to: "ISO date" },
        response: '{ data: FormSubmission[], error: null }',
      },
      {
        method: "PUT",
        path: "/api/admin/forms/[id]",
        description: "Mark a form submission as read",
        auth: true,
        body: { read: "boolean" },
        response: '{ data: FormSubmission, error: null }',
      },
      {
        method: "DELETE",
        path: "/api/admin/forms/[id]",
        description: "Delete a form submission",
        auth: true,
        response: '{ data: { ok: true }, error: null }',
      },
    ],
  },
  {
    title: "SEO (Admin)",
    description: "Per-page SEO configuration",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/seo",
        description: "List all page SEO entries",
        auth: true,
        response: '{ data: PageSeo[], error: null }',
      },
      {
        method: "PUT",
        path: "/api/admin/seo",
        description: "Upsert SEO data for a page",
        auth: true,
        body: { pageKey: "string (required)", titleTag: "string?", metaDescription: "string?", ogImage: "string? (URL)" },
        response: '{ data: PageSeo, error: null }',
      },
    ],
  },
  {
    title: "Users (Admin)",
    description: "Admin user management",
    endpoints: [
      {
        method: "GET",
        path: "/api/admin/users",
        description: "List all admin users",
        auth: true,
        response: '{ data: User[], error: null }',
      },
      {
        method: "PUT",
        path: "/api/admin/users",
        description: "Update a user role",
        auth: true,
        body: { userId: "string (required)", role: '"admin" | "editor"' },
        response: '{ data: User, error: null }',
      },
      {
        method: "DELETE",
        path: "/api/admin/users",
        description: "Delete a user (cannot delete self)",
        auth: true,
        body: { userId: "string (required)" },
        response: '{ data: { ok: true }, error: null }',
      },
    ],
  },
  {
    title: "File Upload (Admin)",
    description: "Upload files to R2 (or base64 fallback)",
    endpoints: [
      {
        method: "POST",
        path: "/api/admin/upload",
        description: "Upload an image file (multipart/form-data)",
        auth: true,
        body: { file: "File (required, max 5MB, image/*)", folder: "string? (default: 'uploads')" },
        response: '{ data: { url, key }, error: null }',
      },
    ],
  },
  {
    title: "Public — Blog",
    description: "Public endpoints for the website (no auth)",
    endpoints: [
      { method: "GET", path: "/api/site/blog", description: "List published blog posts (paginated)", auth: false, query: { page: "number", limit: "number" }, response: '{ data: BlogPost[], error: null }' },
      { method: "GET", path: "/api/site/blog/[slug]", description: "Get a published blog post by slug", auth: false, response: '{ data: BlogPost, error: null }' },
    ],
  },
  {
    title: "Public — Portfolio",
    description: "Visible portfolio items",
    endpoints: [
      { method: "GET", path: "/api/site/portfolio", description: "List visible portfolio items", auth: false, response: '{ data: PortfolioItem[], error: null }' },
    ],
  },
  {
    title: "Public — Testimonials",
    description: "Approved testimonials",
    endpoints: [
      { method: "GET", path: "/api/site/testimonials", description: "List approved testimonials", auth: false, response: '{ data: Testimonial[], error: null }' },
    ],
  },
  {
    title: "Public — Images",
    description: "Site images by section",
    endpoints: [
      { method: "GET", path: "/api/site/images/[section]", description: "Get images for a section", auth: false, response: '{ data: SiteImage[], error: null }' },
    ],
  },
  {
    title: "Public — SEO",
    description: "Per-page SEO data",
    endpoints: [
      { method: "GET", path: "/api/site/seo/[page]", description: "Get SEO data for a page", auth: false, response: '{ data: PageSeo, error: null }' },
    ],
  },
  {
    title: "Public — Banners",
    description: "Active banners by placement",
    endpoints: [
      { method: "GET", path: "/api/site/banners/[placement]", description: "Get active banners for a placement", auth: false, response: '{ data: Banner[], error: null }' },
    ],
  },
  {
    title: "Public — Form Submit",
    description: "Public form submission (rate limited)",
    endpoints: [
      {
        method: "POST",
        path: "/api/site/forms/submit",
        description: "Submit a contact/quote/callback form",
        auth: false,
        body: {
          formType: '"contact" | "quote" | "callback"',
          name: "string (required)",
          email: "string (required, valid email)",
          phone: "string?",
          message: "string?",
          metadata: "string? (JSON string)",
        },
        response: '{ data: { ok: true }, error: null }',
      },
    ],
  },
];
