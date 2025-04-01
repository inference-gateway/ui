import { Redis } from "ioredis";
import { NextResponse } from "next/server";

// TODO - extract this to a common Server Side only file
const MAX_ERRORS = 5;
const RETRY_DELAY_MS = 5000;
let errorCount = 0;
let isAvailable = true;

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 20,
  retryStrategy: (times) => {
    return Math.min(times * 100, RETRY_DELAY_MS);
  },
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
  errorCount++;
  if (errorCount >= MAX_ERRORS) {
    isAvailable = false;
    setTimeout(() => {
      isAvailable = true;
      errorCount = 0;
    }, RETRY_DELAY_MS);
  }
});

redis.on("connect", () => {
  isAvailable = true;
  errorCount = 0;
});

function isRedisAvailable() {
  return isAvailable;
}

function getKey(userId: string | null | undefined, baseKey: string): string {
  return userId ? `${userId}_${baseKey}` : baseKey;
}

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
