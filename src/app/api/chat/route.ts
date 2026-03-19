import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/db";
import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { ChatMessage } from "@/models/ChatMessage";
import { verifyAuth } from "@/lib/auth";

const chatMessageSchema = z.object({
  message: z.string().trim().min(1).max(1000),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = `user_${user._id}`;
    const messages = await ChatMessage.find({ roomId })
      .populate("userId", "name avatarUrl")
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to fetch messages.") },
      { status: getErrorStatus(error) },
    );
  }
}

export async function POST(req: NextRequest) {
  const rateLimit = applyRateLimit(req, {
    scope: "chat-send",
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    await connectDB();
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = chatMessageSchema.parse(await req.json());
    const roomId = `user_${user._id}`;

    const chatMessage = await ChatMessage.create({
      userId: user._id,
      message,
      isAdmin: user.role === "ADMIN",
      read: false,
      roomId,
    });

    return NextResponse.json(
      { message: chatMessage },
      {
        status: 201,
        headers: rateLimit.headers,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to send message.") },
      {
        status: getErrorStatus(error),
        headers: rateLimit.ok ? rateLimit.headers : undefined,
      },
    );
  }
}
