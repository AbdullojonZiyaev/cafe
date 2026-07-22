import { NextResponse } from "next/server";

const API_BASE_URL = "https://wc.nets.tj/api/public";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "demo";
  const endpoint = `${API_BASE_URL}/${encodeURIComponent(slug)}/menu`;

  try {
    const upstream = await fetch(endpoint, { cache: "no-store" });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream API failed with status ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const payload = await upstream.json();
    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch menu from upstream API" },
      { status: 502 }
    );
  }
}
