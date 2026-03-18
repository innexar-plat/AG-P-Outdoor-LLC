import { auth } from "@/lib/auth";

/**
 * Explicit route for get-session (avoids catch-all + basePath 404 in production).
 * @see https://github.com/vercel/next.js/issues/62657
 */
export const GET = (request: Request): Promise<Response> => auth.handler(request);
export const POST = (request: Request): Promise<Response> => auth.handler(request);
