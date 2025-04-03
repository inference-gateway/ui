import redis, { getKey, isRedisAvailable } from "@/lib/server/redis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const userId = request.headers.get("Authorization")?.split(" ")[1] ?? null;
  const key = getKey(userId, "activeChatId");

  if (!isRedisAvailable()) {
    return NextResponse.json(
      { error: "Redis service unavailable" },
      { status: 503 }
    );
  }

  try {
    const activeId = await redis.get(key);
    return NextResponse.json({ id: activeId || "1" });
  } catch (error: unknown) {
    console.error("Failed to get active chat ID:", error);
    return NextResponse.json(
      { error: "Failed to get active chat ID" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get("Authorization")?.split(" ")[1] ?? null;
  const key = getKey(userId, "activeChatId");
  const { id } = (await request.json()) as { id: string };

  if (!isRedisAvailable()) {
    return NextResponse.json(
      { error: "Redis service unavailable" },
      { status: 503 }
    );
  }

  try {
    await redis.set(key, id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to save active chat ID:", error);
    return NextResponse.json(
      { error: "Failed to save active chat ID" },
      { status: 503 }
    );
  }
}
