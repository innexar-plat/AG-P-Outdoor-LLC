/**
 * API response shape: success and error.
 */
export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: string; code?: string };

export type FormType = "contact" | "quote" | "callback";

export type BlogPostStatus = "draft" | "published";
