import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant" | "system";

type ImagePart = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

type TextPart = {
  type: "text";
  text: string;
};

type MessageContent = string | Array<TextPart | ImagePart>;

type ChatMessage = {
  role: ChatRole;
  content: MessageContent;
};

type SearchResult = {
  title?: string;
  url?: string;
  content?: string;
};

function getCurrentDateTime() {
  const now = new Date();

  const currentDate = now.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = now.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return {
    currentDate,
    currentTime,
  };
}

function shouldSearch(query: string) {
  const searchTerms = [
    "latest",
    "today",
    "current",
    "recent",
    "news",
    "right now",
    "this week",
    "this month",
    "this year",
    "2026",
    "price",
    "prices",
    "weather",
    "score",
    "scores",
    "standings",
    "release",
    "released",
    "update",
    "updates",
    "breaking",
    "live",
    "stock",
    "stocks",
    "market",
    "election",
    "president",
    "ceo",
    "version",
    "new version",
    "launch",
    "launched",
  ];

  const normalizedQuery = query.toLowerCase();

  return searchTerms.some((term) =>
    normalizedQuery.includes(term)
  );
}

function createSystemMessage(): ChatMessage {
  const { currentDate, currentTime } =
    getCurrentDateTime();

  return {
    role: "system",
    content: `
You are Vision AI, a premium general-purpose AI assistant.

You are currently running inside the Vision AI application.

## CURRENT DATE AND TIME

Today is: ${currentDate}

Current time is: ${currentTime}

Timezone: Asia/Kolkata (India Standard Time).

## IMAGE UNDERSTANDING

You can understand images provided by the user.

When an image is provided:

- Carefully inspect the entire image.
- Read visible text when possible.
- Explain diagrams, charts, tables, handwritten work, screenshots, and documents.
- Solve questions shown in images.
- If the user asks about text in an image, extract the relevant text.
- If the image is unclear, blurry, cropped, or unreadable, say so honestly.
- Never invent text that cannot actually be read.
- For school questions, explain answers step-by-step when useful.
- If an image contains a mathematical problem, solve it accurately and show the working.
- If the user asks "what is this?", describe the important visible elements.
- Treat the image as part of the user's message and use it together with their written question.

## IMPORTANT DATE/TIME RULES

- Treat the date and time above as the current date and time.
- If the user asks for today's date, answer directly using the date above.
- If the user asks what day it is, answer using the date above.
- If the user asks for the current time, answer using the time above.
- Understand relative dates such as today, yesterday, tomorrow, this week, next week, etc.
- Do not claim that you cannot access the current date or time.

## GENERAL RESPONSE STYLE

- Answer the user's actual question directly.
- Do not unnecessarily repeat the user's question.
- Do not introduce yourself in every response.
- Keep simple questions simple.
- Give detailed explanations when the user asks for detail.
- Be clear, natural, useful, and conversational.
- Avoid unnecessary filler.
- Use Markdown naturally.
- Use headings when they genuinely improve readability.
- Use bullet points when useful.
- Use numbered steps for instructions.
- Use emojis sparingly.
- Never claim that you performed an action that you did not perform.
- If you do not know something, say so honestly.
- Do not invent facts, sources, links, or capabilities.

## PROGRAMMING CODE

When the user asks for programming code:

- Always use fenced Markdown code blocks.
- Always specify the programming language when possible.
- Never place programming code directly into ordinary paragraphs.
- Make code clean, readable, and copyable.
- Explain important parts when useful.
- If modifying code, clearly explain what should be replaced.

## MATHEMATICS

For inline mathematics, use:

\\( ... \\)

For standalone equations, use:

$$
...
$$

Never use square brackets as a substitute for mathematical notation.

Never output raw LaTeX commands outside math delimiters.

## SCIENCE

For scientific equations, use proper mathematical formatting.

## SCHOOL QUESTIONS

For school questions, especially Class 10 questions:

- Prefer simple explanations.
- Use exam-friendly wording.
- Highlight important points.
- Use correct formulas.
- Show steps for numerical problems.
- Keep answers easy to copy into a school notebook when appropriate.
- Do not make simple school questions unnecessarily complicated.

## COPYRIGHT

For copyrighted songs, books, movies, or other copyrighted works:

- Do not provide disallowed non-user-provided copyrighted text.
- Offer a summary, explanation, or short permitted excerpt instead.

## CONVERSATION CONTINUITY

Use previous messages supplied by the application as conversation context.

When the user asks a follow-up question, use the previous conversation instead of unnecessarily restarting.

Always prioritize the user's current request.
`.trim(),
  };
}

function normalizeMessages(
  input: unknown
): ChatMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") {
        return false;
      }

      const item = message as {
        role?: unknown;
        content?: unknown;
      };

      const validRole =
        item.role === "user" ||
        item.role === "assistant" ||
        item.role === "system";

      if (!validRole) {
        return false;
      }

      if (typeof item.content === "string") {
        return true;
      }

      if (!Array.isArray(item.content)) {
        return false;
      }

      return item.content.every((part) => {
        if (!part || typeof part !== "object") {
          return false;
        }

        const currentPart = part as {
          type?: unknown;
          text?: unknown;
          image_url?: unknown;
        };

        if (
          currentPart.type === "text" &&
          typeof currentPart.text === "string"
        ) {
          return true;
        }

        if (
          currentPart.type === "image_url" &&
          currentPart.image_url &&
          typeof currentPart.image_url === "object"
        ) {
          const imageUrl =
            currentPart.image_url as {
              url?: unknown;
            };

          return typeof imageUrl.url === "string";
        }

        return false;
      });
    })
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))
    .slice(-30);
}

function getTextFromContent(
  content: MessageContent
): string {
  if (typeof content === "string") {
    return content;
  }

  return content
    .filter(
      (part): part is TextPart =>
        part.type === "text"
    )
    .map((part) => part.text)
    .join(" ");
}

function hasImageContent(
  content: MessageContent
): boolean {
  if (typeof content === "string") {
    return false;
  }

  return content.some(
    (part) => part.type === "image_url"
  );
}

async function performSearch(query: string) {
  try {
    const searchResponse = await fetch(
      "http://localhost:3000/api/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
        }),
        cache: "no-store",
      }
    );

    if (!searchResponse.ok) {
      console.error(
        "Search API returned:",
        searchResponse.status
      );

      return "";
    }

    const searchData =
      await searchResponse.json();

    const results: SearchResult[] =
      Array.isArray(searchData?.results)
        ? searchData.results
        : [];

    if (results.length === 0) {
      return "";
    }

    return results
      .slice(0, 8)
      .map((result, index) => {
        return `
SOURCE ${index + 1}

Title:
${result.title || "Untitled"}

URL:
${result.url || ""}

Content:
${result.content || ""}
        `.trim();
      })
      .join(
        "\n\n-------------------------\n\n"
      );
  } catch (error) {
    console.error(
      "Automatic web search failed:",
      error
    );

    return "";
  }
}

function createSearchSystemMessage(
  searchContext: string
): ChatMessage {
  return {
    role: "system",
    content: `
Fresh web search information is available below.

Use it when answering questions involving current or changing information.

IMPORTANT:

- Prefer the search information for current facts.
- Do not invent facts that are not supported by the search results.
- Do not dump the search results into your answer.
- Do not unnecessarily mention source numbers.
- Answer naturally.
- If the search results are insufficient, be honest about the limitation.

WEB SEARCH RESULTS:

${searchContext}
`.trim(),
  };
}

function extractErrorMessage(
  errorText: string
) {
  const fallback =
    "Vision AI could not generate a response.";

  if (!errorText) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(errorText);

    return (
      parsed?.error?.message ||
      parsed?.error ||
      parsed?.message ||
      fallback
    );
  } catch {
    return errorText;
  }
}

function createOpenRouterStream(
  response: Response
) {
  if (!response.body) {
    throw new Error(
      "The AI returned no response stream."
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const reader =
        response.body!.getReader();

      let buffer = "";

      try {
        while (true) {
          const { done, value } =
            await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          const lines =
            buffer.split("\n");

          buffer =
            lines.pop() || "";

          for (const rawLine of lines) {
            const line =
              rawLine.trim();

            if (!line.startsWith("data:")) {
              continue;
            }

            const data =
              line.slice(5).trim();

            if (
              !data ||
              data === "[DONE]"
            ) {
              continue;
            }

            try {
              const parsed =
                JSON.parse(data);

              if (parsed?.error) {
                console.error(
                  "OpenRouter streaming error:",
                  parsed.error
                );

                continue;
              }

              const content =
                parsed?.choices?.[0]
                  ?.delta?.content;

              if (
                typeof content ===
                  "string" &&
                content.length > 0
              ) {
                controller.enqueue(
                  encoder.encode(content)
                );
              }
            } catch {
              // Ignore malformed SSE chunks.
            }
          }
        }

        buffer += decoder.decode();

        const finalLines =
          buffer.split("\n");

        for (const rawLine of finalLines) {
          const line =
            rawLine.trim();

          if (!line.startsWith("data:")) {
            continue;
          }

          const data =
            line.slice(5).trim();

          if (
            !data ||
            data === "[DONE]"
          ) {
            continue;
          }

          try {
            const parsed =
              JSON.parse(data);

            const content =
              parsed?.choices?.[0]
                ?.delta?.content;

            if (
              typeof content ===
                "string" &&
              content.length > 0
            ) {
              controller.enqueue(
                encoder.encode(content)
              );
            }
          } catch {
            // Ignore malformed final SSE data.
          }
        }

        controller.close();
      } catch (error) {
        console.error(
          "Vision AI streaming error:",
          error
        );

        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return stream;
}

export async function POST(
  req: Request
) {
  try {
    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENROUTER_API_KEY is missing. Add it to .env.local and restart the development server.",
        },
        {
          status: 500,
        }
      );
    }

    let body: {
      message?: unknown;
      messages?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    let messages =
      normalizeMessages(
        body.messages
      );

    if (messages.length === 0) {
      const fallbackMessage =
        typeof body.message ===
        "string"
          ? body.message.trim()
          : "";

      if (!fallbackMessage) {
        return NextResponse.json(
          {
            error:
              "Please enter a message.",
          },
          {
            status: 400,
          }
        );
      }

      messages = [
        {
          role: "user",
          content: fallbackMessage,
        },
      ];
    }

    const hasUserMessage =
      messages.some(
        (message) =>
          message.role === "user" &&
          getTextFromContent(
            message.content
          )
            .trim()
            .length > 0
      );

    if (!hasUserMessage) {
      return NextResponse.json(
        {
          error:
            "Please enter a message.",
        },
        {
          status: 400,
        }
      );
    }

    const cleanedMessages =
      messages
        .filter((message) => {
          if (
            message.role === "user" ||
            message.role === "assistant"
          ) {
            return (
              getTextFromContent(
                message.content
              )
                .trim()
                .length > 0 ||
              hasImageContent(
                message.content
              )
            );
          }

          return false;
        })
        .slice(-30);

    const latestUserMessage =
      [...cleanedMessages]
        .reverse()
        .find(
          (message) =>
            message.role === "user"
        );

    const userQuery =
      latestUserMessage
        ? getTextFromContent(
            latestUserMessage.content
          ).trim()
        : "";

    const imageAttached =
      cleanedMessages.some(
        (message) =>
          message.role === "user" &&
          hasImageContent(
            message.content
          )
      );

    let searchContext = "";

    if (
      userQuery &&
      !imageAttached &&
      shouldSearch(userQuery)
    ) {
      searchContext =
        await performSearch(
          userQuery
        );
    }

    const systemMessage =
      createSystemMessage();

    const openRouterMessages:
      ChatMessage[] = [
        systemMessage,

        ...(searchContext
          ? [
              createSearchSystemMessage(
                searchContext
              ),
            ]
          : []),

        ...cleanedMessages,
      ];

    /*
     * IMPORTANT:
     *
     * Text-only requests can use the normal
     * free router.
     *
     * Requests containing images use a
     * vision-capable model.
     *
     * OpenRouter requires the selected model
     * to support image input.
     */
    const model = imageAttached
      ? "google/gemini-2.5-flash"
      : "openrouter/free";

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",

            "HTTP-Referer":
              "http://localhost:3000",

            "X-OpenRouter-Title":
              "Vision AI",
          },

          body: JSON.stringify({
            model,

            messages:
              openRouterMessages,

            stream: true,

            temperature: 0.7,

            max_tokens: 3000,
          }),
        }
      );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "OpenRouter error:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            extractErrorMessage(
              errorText
            ),
        },
        {
          status:
            response.status >= 400
              ? response.status
              : 500,
        }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        {
          error:
            "The AI returned no response stream.",
        },
        {
          status: 500,
        }
      );
    }

    const stream =
      createOpenRouterStream(
        response
      );

    return new Response(
      stream,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",

          "Cache-Control":
            "no-cache, no-transform",

          Connection:
            "keep-alive",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (error) {
    console.error(
      "Chat API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while contacting Vision AI.",
      },
      {
        status: 500,
      }
    );
  }
}