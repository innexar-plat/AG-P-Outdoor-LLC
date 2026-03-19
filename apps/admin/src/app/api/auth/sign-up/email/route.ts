import { auth } from "@/lib/auth";

/**
 * Explicit sign-up endpoint for operational scripts and bootstrap flows.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({}));
  return auth.api.signUpEmail({
    headers: request.headers,
    body,
    asResponse: true,
  });
}

export const GET = (request: Request): Promise<Response> =>
  auth.api.getSession({ headers: request.headers, asResponse: true });
