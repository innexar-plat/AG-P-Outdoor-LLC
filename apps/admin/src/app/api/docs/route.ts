import { NextResponse } from "next/server";
import { API_DOCS } from "./endpoints";

/**
 * GET /api/docs — returns structured API documentation
 */
export async function GET() {
  return NextResponse.json({
    title: "Innexar Panel API",
    version: "1.0.0",
    baseUrl: "/api",
    sections: API_DOCS,
  });
}
