import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  try {
    const { question, page, pageTitle, pageUrl } = await req.json();

    if (!question) {
      return new Response("Question is required", {
        status: 400,
      });
    }

    const prompt = `
You are Vision AI, an AI browser assistant.

You are helping the user understand and work with the webpage they are currently viewing.

PAGE TITLE:
${pageTitle || "Unknown"}

PAGE URL:
${pageUrl || "Unknown"}

PAGE CONTENT:
${page || "No page content available."}

USER REQUEST:
${question}

Instructions:
- Answer the user's request directly.
- Use the webpage content when relevant.
- Do not claim you performed an action if you did not.
- If the page content is insufficient, clearly say so.
- Be useful and concise.
`;

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content;

            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          controller.close();
        } catch (error) {
          console.error("Browser assistant stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Browser assistant error:", error);

    return new Response("Vision AI could not answer.", {
      status: 500,
    });
  }
}