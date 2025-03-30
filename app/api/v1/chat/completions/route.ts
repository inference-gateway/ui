import { NextResponse } from "next/server";
import { TransformStream } from "stream/web";

export async function POST(req: Request) {
  try {
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      console.error("INFERENCE_GATEWAY_URL environment variable is not set");
      return NextResponse.json(
        { error: "Gateway URL configuration missing" },
        { status: 500 }
      );
    }

    const completionsEndpoint = `${gatewayUrl}/chat/completions`;

    const headers = new Headers();
    for (const [key, value] of req.headers.entries()) {
      if (key.toLowerCase() !== "host") {
        headers.set(key, value);
      }
    }

    const body = await req.json();
    const { stream } = body;

    const response = await fetch(completionsEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from inference gateway: ${errorText}`);
      return NextResponse.json(
        { error: "Failed to get completion from inference gateway" },
        { status: response.status }
      );
    }

    if (stream) {
      const { readable, writable } = new TransformStream({
        transform(chunk, controller) {
          try {
            const text = new TextDecoder().decode(chunk);
            const messages = text.split("\n\n").filter(Boolean);

            for (const message of messages) {
              if (!message.startsWith("data: ")) continue;

              const data = message.substring(6);
              if (data === "[DONE]") {
                controller.enqueue(
                  new TextEncoder().encode(`data: [DONE]\n\n`)
                );
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.choices?.[0]?.delta?.content) {
                  const content = parsed.choices[0].delta.content;
                  const thinkMatch = content.match(
                    /<think>([\s\S]*?)<\/think>/
                  );

                  if (thinkMatch) {
                    const reasoning = thinkMatch[1].trim();

                    parsed.choices[0].delta.content = content
                      .replace(/<think>[\s\S]*?<\/think>/, "")
                      .trim();

                    if (!parsed.choices[0].delta.reasoning_content) {
                      parsed.choices[0].delta.reasoning_content = reasoning;
                    }
                  }
                }

                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify(parsed)}\n\n`
                  )
                );
              } catch {
                controller.enqueue(new TextEncoder().encode(`${message}\n\n`));
              }
            }
          } catch (error) {
            console.error("Error transforming stream:", error);
            controller.enqueue(chunk);
          }
        },
      });

      response.body?.pipeTo(writable).catch((err) => {
        console.error("Error piping response:", err);
      });

      return new Response(readable as unknown as ReadableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      const completionData = await response.json();

      if (completionData.choices?.[0]?.message?.content) {
        const content = completionData.choices[0].message.content;
        const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);

        if (thinkMatch) {
          const reasoning = thinkMatch[1].trim();

          completionData.choices[0].message.content = content
            .replace(/<think>[\s\S]*?<\/think>/, "")
            .trim();

          if (!completionData.choices[0].message.reasoning_content) {
            completionData.choices[0].message.reasoning_content = reasoning;
          }
        }
      }

      return NextResponse.json(completionData);
    }
  } catch (error) {
    console.error("Error in chat completions API:", error);
    return NextResponse.json(
      { error: "Failed to connect to inference gateway" },
      { status: 500 }
    );
  }
}
