import { auth } from "@/lib/auth";
import { normalizeAuthRequest } from "../normalize-auth-request";

/**
 * Explicit route for sign-out (avoids catch-all + basePath 404 in production).
 * @see https://github.com/vercel/next.js/issues/62657
 */
export const GET = (request: Request): Promise<Response> =>
	auth.handler(normalizeAuthRequest(request));
export const POST = (request: Request): Promise<Response> =>
	auth.handler(normalizeAuthRequest(request));
