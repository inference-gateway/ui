import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { model, messages, stream = false } = body

    // This is a mock implementation for demonstration purposes
    // In a real app, you would forward this request to your OpenAI-compatible API

    if (stream) {
      // Handle streaming response
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        async start(controller) {
          // Simulate a streaming response
          const assistantMessage =
            "I'm an AI assistant. I'm here to help you with any questions or tasks you might have. I can provide information, assist with various topics, or engage in conversation. How can I assist you today?"
          const chunks = assistantMessage.split(" ")

          // Send the response header
          controller.enqueue(
            encoder.encode(
              "data: " +
                JSON.stringify({
                  id: "chatcmpl-" + Date.now(),
                  object: "chat.completion.chunk",
                  created: Math.floor(Date.now() / 1000),
                  model,
                  choices: [
                    {
                      index: 0,
                      delta: { role: "assistant" },
                      finish_reason: null,
                    },
                  ],
                }) +
                "\n\n",
            ),
          )

          // Send each word with a delay
          for (let i = 0; i < chunks.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 100))

            controller.enqueue(
              encoder.encode(
                "data: " +
                  JSON.stringify({
                    id: "chatcmpl-" + Date.now(),
                    object: "chat.completion.chunk",
                    created: Math.floor(Date.now() / 1000),
                    model,
                    choices: [
                      {
                        index: 0,
                        delta: { content: chunks[i] + " " },
                        finish_reason: null,
                      },
                    ],
                  }) +
                  "\n\n",
              ),
            )
          }

          // Send the [DONE] message
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      // Handle regular response
      const lastMessage = messages[messages.length - 1]
      let responseContent = "I'm an AI assistant. How can I help you today?"

      // Simple echo for demonstration
      if (lastMessage.role === "user") {
        if (lastMessage.content.toLowerCase().includes("hello") || lastMessage.content.toLowerCase().includes("hi")) {
          responseContent = "Hello! How can I assist you today?"
        } else if (lastMessage.content.toLowerCase().includes("help")) {
          responseContent = "I can help with a variety of tasks. Just let me know what you need!"
        } else if (lastMessage.content === "/help") {
          responseContent =
            "**Available Commands:**\n- /help - Show this help message\n- /reset or /clear - Clear the chat history"
        } else {
          responseContent = `I received your message: "${lastMessage.content}". How can I assist you further?`
        }
      }

      return NextResponse.json({
        id: "chatcmpl-" + Date.now(),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: responseContent,
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 100,
          total_tokens: 200,
        },
      })
    }
  } catch (error) {
    console.error("Error in chat completions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

