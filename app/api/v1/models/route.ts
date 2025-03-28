import { NextResponse } from "next/server"

export async function GET() {
  // This is a mock implementation
  // In a real app, you would fetch models from your OpenAI-compatible API
  const models = [
    {
      id: "gpt-4",
      object: "model",
      created: 1687882411,
      owned_by: "openai",
    },
    {
      id: "gpt-3.5-turbo",
      object: "model",
      created: 1677610602,
      owned_by: "openai",
    },
    {
      id: "gpt-4o",
      object: "model",
      created: 1712689492,
      owned_by: "openai",
    },
  ]

  return NextResponse.json({
    object: "list",
    data: models,
  })
}

