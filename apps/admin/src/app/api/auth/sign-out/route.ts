import { auth } from "@/lib/auth";

/**
 * Explicit sign-out endpoint using Better Auth server API directly.
 */
export const GET = (request: Request): Promise<Response> =>
	auth.api.signOut({ headers: request.headers, asResponse: true });
export const POST = (request: Request): Promise<Response> =>
	auth.api.signOut({ headers: request.headers, asResponse: true });
