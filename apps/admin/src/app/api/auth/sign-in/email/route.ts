import { auth } from "@/lib/auth";

/**
 * Explicit sign-in endpoint using Better Auth server API directly.
 * This avoids path matching issues seen with auth.handler under Next basePath.
 */
export async function POST(request: Request): Promise<Response> {
	const body = await request.json().catch(() => ({}));
	return auth.api.signInEmail({
		headers: request.headers,
		body,
		asResponse: true,
	});
}

export const GET = (request: Request): Promise<Response> =>
	auth.api.getSession({ headers: request.headers, asResponse: true });
