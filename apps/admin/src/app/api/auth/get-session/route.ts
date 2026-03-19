import { auth } from "@/lib/auth";

/**
 * Explicit get-session endpoint using Better Auth server API directly.
 */
export const GET = (request: Request): Promise<Response> =>
	auth.api.getSession({ headers: request.headers, asResponse: true });
export const POST = (request: Request): Promise<Response> =>
	auth.api.getSession({ headers: request.headers, asResponse: true });
