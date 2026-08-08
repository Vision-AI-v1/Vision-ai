import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const query =
      typeof body.query === "string"
        ? body.query.trim()
        : "";

    if (!query) {
      return NextResponse.json(
        {
          error: "Search query is required.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      console.error("TAVILY_API_KEY is missing.");

      return NextResponse.json(
        {
          error: "TAVILY_API_KEY is missing.",
        },
        {
          status: 500,
        }
      );
    }

    const response = await fetch(
      "https://api.tavily.com/search",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          query: query,
          search_depth: "basic",
          topic: "general",
          max_results: 5,
          include_answer: false,
          include_raw_content: false,
          include_images: false,
        }),

        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Tavily returned an error:",
        response.status,
        errorText
      );

      return NextResponse.json(
        {
          error: "Tavily search failed.",
          status: response.status,
          details: errorText,
        },
        {
          status: response.status,
        }
      );
    }

    const data = await response.json();

    const results = Array.isArray(data.results)
      ? data.results.map((result: any) => ({
          title:
            typeof result.title === "string"
              ? result.title
              : "Untitled",

          url:
            typeof result.url === "string"
              ? result.url
              : "",

          content:
            typeof result.content === "string"
              ? result.content
              : "",

          score:
            typeof result.score === "number"
              ? result.score
              : 0,
        }))
      : [];

    return NextResponse.json({
      query: data.query || query,
      results: results,
      count: results.length,
    });
  } catch (error) {
    console.error(
      "Vision AI search error:",
      error
    );

    return NextResponse.json(
      {
        error: "Something went wrong while searching the web.",
      },
      {
        status: 500,
      }
    );
  }
}