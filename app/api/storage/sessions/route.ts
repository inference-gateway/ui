import redis, { getKey, isRedisAvailable } from "@/lib/server/redis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO - Parse the JWT to get the subject and store this in redis as a key
  const userId = request.headers.get("Authorization")?.split(" ")[1] ?? null;
  const key = getKey(userId, "chatSessions");

  if (!isRedisAvailable()) {
    return NextResponse.json(
      { error: "Redis service unavailable" },
      { status: 503 }
    );
  }

  try {
    const sessions = await redis.get(key);
    return NextResponse.json({
      sessions: sessions ? JSON.parse(sessions) : [],
    });
  } catch (error: unknown) {
    console.error("Failed to get chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to get chat sessions" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get("Authorization")?.split(" ")[1] ?? null;
  const key = getKey(userId, "chatSessions");
  const { value } = await request.json();

  if (!isRedisAvailable()) {
    return NextResponse.json(
      { error: "Redis service unavailable" },
      { status: 503 }
    );
  }

  try {
    await redis.set(key, value);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to save chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to save chat sessions" },
      { status: 503 }
    );
  }
}

export async function DELETE(request: Request) {
  const userId = request.headers.get("Authorization")?.split(" ")[1] ?? null;
  const key = getKey(userId, "chatSessions");

  if (!isRedisAvailable()) {
    return NextResponse.json(
      { error: "Redis service unavailable" },
      { status: 503 }
    );
  }

  try {
    await redis.del(key);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to delete chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to delete chat sessions" },
      { status: 503 }
    );
  }
}
