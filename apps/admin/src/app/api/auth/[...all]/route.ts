import { auth } from "@/lib/auth";

/**
 * Better Auth catch-all route. Handles sign-in, sign-out, session, etc.
 * The handler is a single function that handles all HTTP methods.
 */
export const GET = (request: Request): Promise<Response> => auth.handler(request);
export const POST = (request: Request): Promise<Response> => auth.handler(request);
