import { auth } from "@/lib/auth";
import logger from "@/lib/logger";
import { InferenceGatewayClient } from "@inference-gateway/sdk";
import { NextResponse } from "next/server";
import { TransformStream } from "stream/web";

export async function POST(req: Request) {
  const isAuthEnabled = process.env.AUTH_ENABLED === "true";
  const session = isAuthEnabled ? await auth() : null;

  if (isAuthEnabled && !session) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    logger.debug("[Chat Completions] Starting request");
    const gatewayUrl = process.env.INFERENCE_GATEWAY_URL;

    if (!gatewayUrl) {
      logger.error(
        "[Chat Completions] INFERENCE_GATEWAY_URL environment variable is not set"
      );
      return NextResponse.json(
        { error: "Gateway URL configuration missing" },
        { status: 500 }
      );
    }

    logger.debug("[Chat Completions] Creating InferenceGatewayClient", {
      gatewayUrl,
    });
    const fetchWithAuth = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ) => {
      const headers = new Headers(init?.headers);
      if (session?.accessToken) {
        headers.set("Authorization", `Bearer ${session.accessToken}`);
      }
      return fetch(input, {
        ...init,
        headers,
      });
    };

    const clientWithAuth = new InferenceGatewayClient({
      baseURL: gatewayUrl,
      fetch: fetchWithAuth,
    });
    const body = await req.json();
    logger.debug("[Chat Completions] Request body received", {
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
            logger.error("[Chat Completions] Error writing to stream", {
              error,
            });
            isWriterClosed = true;
          }
        };

        const safeClose = () => {
          if (isWriterClosed) return;
          try {
            writer.close();
            isWriterClosed = true;
          } catch (error) {
            logger.error("[Chat Completions] Error closing stream", { error });
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
                logger.error("[Chat Completions] Error processing chunk", {
                  error,
                });
              }
            },
            onError: (error) => {
              logger.error("[Chat Completions] Stream error", { error });
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
          logger.error("[Chat Completions] Error in streaming completion", {
            error,
          });
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
        logger.debug("[Chat Completions] Starting non-streaming completion");
        const completionData = await clientWithAuth.createChatCompletion(body);
        logger.debug("[Chat Completions] Completed non-streaming completion", {
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
        logger.error("[Chat Completions] Error in completion", { error });
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    logger.error("[Chat Completions] API error", { error });
    return NextResponse.json(
      { error: "Failed to connect to inference gateway" },
      { status: 500 }
    );
  }
}
