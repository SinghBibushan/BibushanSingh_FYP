import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ChatMessage } from "@/models/ChatMessage";
import { verifyAuth } from "@/lib/auth";

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
    console.error("Get chat messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    const roomId = `user_${user._id}`;

    const chatMessage = await ChatMessage.create({
      userId: user._id,
      message,
      isAdmin: user.role === "ADMIN",
      read: false,
      roomId,
    });

    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
