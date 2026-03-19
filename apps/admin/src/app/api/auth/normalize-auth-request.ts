/**
 * Better Auth router expects the internal auth namespace (/api/auth/*), while
 * this Next app is publicly exposed under basePath=/admin.
 * Normalize incoming request URLs so auth.handler can resolve all endpoints.
 */
export function normalizeAuthRequest(request: Request): Request {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/admin/api/auth")) {
    url.pathname = url.pathname.replace("/admin/api/auth", "/api/auth");
    return new Request(url.toString(), request);
  }

  return request;
}
