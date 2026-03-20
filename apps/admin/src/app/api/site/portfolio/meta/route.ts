import { NextResponse } from "next/server";
import { listPortfolioCategories, listPortfolioTags } from "@/lib/queries/portfolio-taxonomy";

export async function GET() {
  try {
    const [categories, tags] = await Promise.all([
      listPortfolioCategories(true),
      listPortfolioTags(),
    ]);

    return NextResponse.json({
      data: {
        categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
        tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      },
      error: null,
    });
  } catch (err) {
    console.error("[site/portfolio/meta GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
