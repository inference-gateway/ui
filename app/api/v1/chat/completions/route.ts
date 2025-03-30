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
      let inThinkTag = false;
      let thinkContent = "";
      let contentBuffer = "";

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
                // TODO: Normalize the reasoning on the backend on the inference-gateway
                // Groq pass the reasoning different then DeepSeek does and for DeepSeek models 😅
                // Better would be to transform their response on the backend and use the proper reasoning_content attribute, which is an optional attribute.
                const parsed = JSON.parse(data);

                if (parsed.choices?.[0]?.delta?.content) {
                  let content = parsed.choices[0].delta.content;

                  if (content.includes("<think>")) {
                    inThinkTag = true;
                    const parts = content.split("<think>");
                    contentBuffer += parts[0];
                    content = parts[0];

                    if (parts.length > 1) {
                      thinkContent += parts[1];
                    }
                  } else if (inThinkTag && content.includes("</think>")) {
                    const parts = content.split("</think>");
                    thinkContent += parts[0];
                    inThinkTag = false;

                    if (parts.length > 1) {
                      contentBuffer += parts[1];
                      content = contentBuffer;
                      contentBuffer = "";
                    } else {
                      content = contentBuffer;
                      contentBuffer = "";
                    }

                    if (
                      !parsed.choices[0].delta.reasoning_content &&
                      thinkContent.trim()
                    ) {
                      parsed.choices[0].delta.reasoning_content =
                        thinkContent.trim();
                    }
                    thinkContent = "";
                  } else if (inThinkTag) {
                    thinkContent += content;
                    content = "";
                  } else {
                    contentBuffer += content;
                    content = contentBuffer;
                    contentBuffer = "";
                  }

                  parsed.choices[0].delta.content = content;
                }

                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify(parsed)}\n\n`
                  )
                );
              } catch (error) {
                console.error("Error processing chunk:", error);
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
