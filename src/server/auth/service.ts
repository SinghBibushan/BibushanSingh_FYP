import bcrypt from "bcryptjs";

import {
  clearSessionCookie,
  createActionToken,
  setSessionCookie,
  verifyActionToken,
} from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { User } from "@/models/User";
import { sendEmail } from "@/server/notifications/mailer";

function makeUrl(path: string) {
  return new URL(path, env.APP_URL).toString();
}

function buildAuthEmail({
  title,
  message,
  actionLabel,
  actionUrl,
}: {
  title: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
}) {
  const text = `${title}\n\n${message}\n\n${actionLabel}: ${actionUrl}`;
  const html = `
    <div style="font-family:Segoe UI,sans-serif;padding:24px;background:#f8f4ec;color:#14213d">
      <div style="max-width:560px;margin:0 auto;background:#fffdf8;border-radius:20px;padding:32px;border:1px solid rgba(20,33,61,.08)">
        <p style="letter-spacing:.24em;font-size:12px;text-transform:uppercase;color:#d97706;margin:0 0 12px">EventEase</p>
        <h1 style="margin:0 0 12px;font-size:28px">${title}</h1>
        <p style="margin:0 0 24px;line-height:1.7">${message}</p>
        <a href="${actionUrl}" style="display:inline-block;background:#d97706;color:#fffdf8;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:600">${actionLabel}</a>
        <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.7">${actionUrl}</p>
      </div>
    </div>
  `;

  return { text, html };
}

export async function registerUser(input: RegisterInput) {
  const data = registerSchema.parse(input);
  await connectToDatabase();

  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: "USER",
  });

  const verificationToken = createActionToken(
    { email: user.email, purpose: "verify-email" },
    "24h",
  );
  const verifyUrl = makeUrl(`/verify-email/${verificationToken}`);
  const emailContent = buildAuthEmail({
    title: "Verify your email",
    message:
      "Complete your EventEase registration by verifying your email address.",
    actionLabel: "Verify email",
    actionUrl: verifyUrl,
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your EventEase account",
    ...emailContent,
  });

  await setSessionCookie({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    message: "Registration successful. Check your email verification link.",
    verifyUrl,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: Boolean(user.emailVerifiedAt),
    },
  };
}

export async function loginUser(input: LoginInput) {
  const data = loginSchema.parse(input);
  await connectToDatabase();

  const user = await User.findOne({ email: data.email });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const validPassword = await bcrypt.compare(data.password, user.passwordHash);

  if (!validPassword) {
    throw new Error("Invalid email or password.");
  }

  user.lastLoginAt = new Date();
  await user.save();

  await setSessionCookie({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    message: "Login successful.",
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: Boolean(user.emailVerifiedAt),
    },
  };
}

export async function logoutUser() {
  await clearSessionCookie();
  return { message: "Logged out successfully." };
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const data = forgotPasswordSchema.parse(input);
  await connectToDatabase();

  const user = await User.findOne({ email: data.email });

  if (!user) {
    return {
      message: "If the email exists, a password reset link has been prepared.",
    };
  }

  const resetToken = createActionToken(
    { email: user.email, purpose: "reset-password" },
    "1h",
  );
  const resetUrl = makeUrl(`/reset-password/${resetToken}`);
  const emailContent = buildAuthEmail({
    title: "Reset your password",
    message:
      "Use the link below to create a new password for your EventEase account.",
    actionLabel: "Reset password",
    actionUrl: resetUrl,
  });

  await sendEmail({
    to: user.email,
    subject: "Reset your EventEase password",
    ...emailContent,
  });

  return {
    message: "If the email exists, a password reset link has been prepared.",
    resetUrl,
  };
}

export async function resetPassword(token: string, input: ResetPasswordInput) {
  const data = resetPasswordSchema.parse(input);
  const payload = verifyActionToken(token, "reset-password");

  await connectToDatabase();

  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new Error("Account not found.");
  }

  user.passwordHash = await bcrypt.hash(data.password, 10);
  await user.save();

  await setSessionCookie({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return { message: "Password updated successfully." };
}

export async function verifyEmailAddress(token: string) {
  const payload = verifyActionToken(token, "verify-email");
  await connectToDatabase();

  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw new Error("Account not found.");
  }

  if (!user.emailVerifiedAt) {
    user.emailVerifiedAt = new Date();
    await user.save();
  }

  await setSessionCookie({
    sub: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return { message: "Email verified successfully." };
}
