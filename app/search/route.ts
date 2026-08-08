import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Search query is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "TAVILY_API_KEY is missing." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        topic: "general",
        max_results: 5,
        include_answer: false,
        include_raw_content: false,
        include_images: false,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Tavily error:", errorText);

      return NextResponse.json(
        {
          error: "Tavily search failed.",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      query: data.query || query,
      results: data.results || [],
    });
  } catch (error) {
    console.error("Search API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while searching.",
      },
      { status: 500 }
    );
  }
}