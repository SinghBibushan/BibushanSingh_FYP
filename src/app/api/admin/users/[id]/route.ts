import { NextRequest, NextResponse } from "next/server";

import { getErrorMessage, getErrorStatus } from "@/lib/errors";
import { adminDeleteUser } from "@/server/admin/service";
import { adminUpdateUser } from "@/server/users/service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await adminUpdateUser(id, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Failed to update user.") },
      { status: getErrorStatus(error) },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const result = await adminDeleteUser(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: getErrorMessage(error, "Failed to delete user.") },
      { status: getErrorStatus(error) },
    );
  }
}
