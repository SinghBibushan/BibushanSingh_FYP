import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { credential } = await req.json();

    // Decode Google JWT token
    const decoded: any = jwt.decode(credential);

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 });
    }

    const { email, name, picture, sub: googleId } = decoded;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google auth
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "GOOGLE",
        avatarUrl: picture || "",
        emailVerifiedAt: new Date(),
        passwordHash: "", // No password for Google auth
      });
    } else if (!user.googleId) {
      // Link existing account to Google
      user.googleId = googleId;
      user.authProvider = "GOOGLE";
      user.avatarUrl = picture || user.avatarUrl;
      user.emailVerifiedAt = user.emailVerifiedAt || new Date();
      await user.save();
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
