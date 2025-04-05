import logger from "@/lib/logger";
import { InferenceGatewayClient } from "@inference-gateway/sdk";
import { NextResponse } from "next/server";
import { TransformStream } from "stream/web";

export async function POST(req: Request) {
  try {
    logger.debug("Starting chat completions request");
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      logger.error("INFERENCE_GATEWAY_URL environment variable is not set");
      return NextResponse.json(
        { error: "Gateway URL configuration missing" },
        { status: 500 }
      );
    }

    logger.debug("Creating InferenceGatewayClient", { gatewayUrl });
    const client = new InferenceGatewayClient({
      baseURL: gatewayUrl,
      fetch: fetch.bind(globalThis),
    });

    const apiKey = process.env.INFERENCE_GATEWAY_API_KEY;
    const clientWithAuth = apiKey ? client.withOptions({ apiKey }) : client;
    const body = await req.json();
    logger.debug("Request body received", {
      stream: body.stream,
      model: body.model,
      messages: body.messages?.length,
    });
    const { stream } = body;

    if (stream) {
      const { readable, writable } = new TransformStream({
        flush(controller) {
          controller.terminate();
        },
      });

      const encoder = new TextEncoder();
      const writer = writable.getWriter();

      const response = new Response(readable as unknown as ReadableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Transfer-Encoding": "chunked",
          "X-Accel-Buffering": "no",
        },
      });

      (async () => {
        let inThinkTag = false;
        let thinkContent = "";
        let contentBuffer = "";
        let isWriterClosed = false;

        const safeWrite = async (data: string) => {
          if (isWriterClosed) return;
          try {
            writer.write(encoder.encode(data));
            await writer.ready;
          } catch (error) {
            logger.error("Error writing to stream", { error });
            isWriterClosed = true;
          }
        };

        const safeClose = () => {
          if (isWriterClosed) return;
          try {
            writer.close();
            isWriterClosed = true;
          } catch (error) {
            logger.error("Error closing stream:", error);
            isWriterClosed = true;
          }
        };

        try {
          await safeWrite(": ping\n\n");

          await clientWithAuth.streamChatCompletion(body, {
            onChunk: async (chunk) => {
              if (isWriterClosed) return;

              try {
                if (chunk.choices?.[0]?.delta?.content) {
                  let content = chunk.choices[0].delta.content;

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
                      !chunk.choices[0].delta.reasoning_content &&
                      thinkContent.trim()
                    ) {
                      chunk.choices[0].delta.reasoning_content =
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

                  chunk.choices[0].delta.content = content;
                }

                await safeWrite(`data: ${JSON.stringify(chunk)}\n\n`);

                await safeWrite(": keep-alive\n\n");
              } catch (error) {
                logger.error("Error processing chunk", { error });
              }
            },
            onError: (error) => {
              logger.error("Stream error", { error });
              if (!isWriterClosed) {
                safeWrite(
                  `data: ${JSON.stringify({
                    error: error.error || "Unknown error",
                  })}\n\n`
                );
                safeClose();
              }
            },
            onFinish: () => {
              if (!isWriterClosed) {
                safeWrite("data: [DONE]\n\n");
                safeClose();
              }
            },
          });
        } catch (error) {
          logger.error("Error in streaming completion", { error });
          if (!isWriterClosed) {
            safeWrite(
              `data: ${JSON.stringify({
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            );
            safeClose();
          }
        }
      })();

      return response;
    } else {
      try {
        logger.debug("Starting non-streaming chat completion");
        const completionData = await clientWithAuth.createChatCompletion(body);
        logger.debug("Completed non-streaming chat completion", {
          model: completionData.model,
          usage: completionData.usage,
        });

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
        logger.error("Error in chat completion", { error });
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    logger.error("Error in chat completions API", { error });
    return NextResponse.json(
      { error: "Failed to connect to inference gateway" },
      { status: 500 }
    );
  }
}
