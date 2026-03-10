import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { Types } from "mongoose";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { env } from "@/lib/env";
import {
  adminUserUpdateSchema,
  updateProfileSchema,
  type AdminUserUpdateInput,
  type UpdateProfileInput,
} from "@/lib/validations/user";
import { NotificationLog } from "@/models/NotificationLog";
import { StudentVerification } from "@/models/StudentVerification";
import { User } from "@/models/User";
import { logNotification } from "@/server/notifications/service";

async function requireSession() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized.");
  }

  await connectToDatabase();
  return session;
}

async function requireAdminSession() {
  const session = await requireSession();

  if (session.role !== "ADMIN") {
    throw new Error("Forbidden.");
  }

  return session;
}

export async function updateCurrentUserProfile(input: UpdateProfileInput) {
  const session = await requireSession();
  const data = updateProfileSchema.parse(input);

  const user = await User.findByIdAndUpdate(
    session.sub,
    {
      name: data.name,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      notificationPreferences: data.notificationPreferences,
    },
    { new: true },
  ).lean();

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    message: "Profile updated successfully.",
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      notificationPreferences: user.notificationPreferences,
    },
  };
}

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function submitStudentVerification(formData: FormData) {
  const session = await requireSession();
  const file = formData.get("document");

  if (!(file instanceof File)) {
    throw new Error("Document file is required.");
  }

  if (file.size === 0) {
    throw new Error("Uploaded file is empty.");
  }

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PNG, JPG, WEBP, or PDF files are allowed.");
  }

  const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR, "student-verifications");
  await mkdir(uploadDir, { recursive: true });

  const extension = path.extname(file.name) || ".bin";
  const filename = sanitizeFilename(
    `${session.sub}-${Date.now()}${extension.toLowerCase()}`,
  );
  const fullPath = path.join(uploadDir, filename);
  const relativePath = path.join(env.UPLOAD_DIR, "student-verifications", filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  const verification = await StudentVerification.findOneAndUpdate(
    { userId: new Types.ObjectId(session.sub) },
    {
      userId: new Types.ObjectId(session.sub),
      documentPath: relativePath,
      status: "PENDING",
      reviewedBy: null,
      reviewedAt: null,
      notes: "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await User.findByIdAndUpdate(session.sub, {
    studentVerificationId: verification._id,
    studentVerificationStatus: "PENDING",
  });

  const user = await User.findById(session.sub).lean();

  if (user) {
    await logNotification({
      userId: String(user._id),
      email: user.email,
      channel: "LOG",
      type: "STUDENT_VERIFICATION_SUBMITTED",
      subject: "Student verification submitted",
      message:
        "Your student verification document was submitted and is pending admin review.",
      payload: {
        documentPath: relativePath,
      },
    });
  }

  return {
    message: "Student verification submitted successfully.",
    verification: {
      id: String(verification._id),
      status: verification.status,
      documentPath: verification.documentPath,
    },
  };
}

export async function getCurrentUserNotifications() {
  const session = await requireSession();

  const notifications = await NotificationLog.find({
    userId: new Types.ObjectId(session.sub),
  })
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  return notifications.map((notification) => ({
    id: String(notification._id),
    channel: notification.channel,
    type: notification.type,
    subject: notification.subject,
    payload: notification.payload,
    status: notification.status,
    sentAt: notification.sentAt,
    createdAt: notification.createdAt,
  }));
}

export async function adminUpdateUser(id: string, input: AdminUserUpdateInput) {
  await requireAdminSession();
  const data = adminUserUpdateSchema.parse(input);

  const user = await User.findByIdAndUpdate(
    id,
    {
      ...(data.role ? { role: data.role } : {}),
      ...(typeof data.loyaltyPoints === "number"
        ? { loyaltyPoints: data.loyaltyPoints }
        : {}),
      ...(data.studentVerificationStatus
        ? { studentVerificationStatus: data.studentVerificationStatus }
        : {}),
    },
    { new: true },
  ).lean();

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    message: "User updated successfully.",
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      studentVerificationStatus: user.studentVerificationStatus,
    },
  };
}
