import { auth } from "@/lib/auth";

/**
 * Explicit route for sign-in/email (avoids catch-all + basePath 404 in production).
 */
export const GET = (request: Request): Promise<Response> => auth.handler(request);
export const POST = (request: Request): Promise<Response> => auth.handler(request);
