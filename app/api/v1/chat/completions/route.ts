import {
  CreateChatCompletionResponse,
  CreateChatCompletionStreamResponse,
} from "@/types/chat";
import { InferenceGatewayClient } from "@inference-gateway/sdk";
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

    const client = new InferenceGatewayClient({
      baseURL: gatewayUrl,
      fetch: fetch.bind(globalThis),
    });

    let apiKey: string | undefined;
    for (const [key, value] of req.headers.entries()) {
      if (key.toLowerCase() === "authorization") {
        apiKey = value.replace("Bearer ", "");
        break;
      }
    }

    const clientWithAuth = apiKey ? client.withOptions({ apiKey }) : client;

    const body = await req.json();
    const { stream } = body;

    if (stream) {
      const { readable, writable } = new TransformStream();
      const encoder = new TextEncoder();
      const writer = writable.getWriter();

      let inThinkTag = false;
      let thinkContent = "";
      let contentBuffer = "";

      try {
        await clientWithAuth.streamChatCompletion(body, {
          onChunk: (chunk) => {
            try {
              const typedChunk =
                chunk as unknown as CreateChatCompletionStreamResponse;

              if (typedChunk.choices?.[0]?.delta?.content) {
                let content = typedChunk.choices[0].delta.content;

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
                    !typedChunk.choices[0].delta.reasoning_content &&
                    thinkContent.trim()
                  ) {
                    typedChunk.choices[0].delta.reasoning_content =
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

                typedChunk.choices[0].delta.content = content;
              }

              writer.write(
                encoder.encode(`data: ${JSON.stringify(typedChunk)}\n\n`)
              );
            } catch (error) {
              console.error("Error processing chunk:", error);
            }
          },
          onError: (error) => {
            console.error("Stream error:", error);
            writer.write(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: error.error || "Unknown error",
                })}\n\n`
              )
            );
          },
          onOpen: () => {
            // Stream opened
          },
          onFinish: () => {
            writer.write(encoder.encode("data: [DONE]\n\n"));
            writer.close();
          },
        });
      } catch (error) {
        console.error("Error in streaming completion:", error);
        writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`
          )
        );
        writer.close();
      }

      return new Response(readable as unknown as ReadableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      try {
        const completionData = (await clientWithAuth.createChatCompletion(
          body
        )) as unknown as CreateChatCompletionResponse;

        if (completionData.choices?.[0]?.message?.content) {
          const content = completionData.choices[0].message.content || "";
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
      } catch (error) {
        console.error("Error in chat completion:", error);
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error in chat completions API:", error);
    return NextResponse.json(
      { error: "Failed to connect to inference gateway" },
      { status: 500 }
    );
  }
}
