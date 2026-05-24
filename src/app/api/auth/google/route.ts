import { NextRequest, NextResponse } from "next/server";

import { AppError, getErrorMessage, getErrorStatus } from "@/lib/errors";
import { applyRateLimit } from "@/lib/rate-limit";
import { authenticateWithGoogle } from "@/server/auth/service";

function getSafePath(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  let path = value;
  try {
    path = decodeURIComponent(value);
  } catch {
    return fallback;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  return path;
}

async function readCredential(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { credential?: unknown };
    return typeof body.credential === "string" ? body.credential : "";
  }

  const formData = await req.formData();
  const credential = formData.get("credential");

  return typeof credential === "string" ? credential : "";
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  const isRedirectFlow = !contentType.includes("application/json");
  const redirectPath = getSafePath(req.nextUrl.searchParams.get("redirect"), "/dashboard");
  const failurePath = getSafePath(
    req.nextUrl.searchParams.get("from") ?? req.cookies.get("google_auth_from")?.value ?? null,
    "/login",
  );
  const rateLimit = applyRateLimit(req, {
    scope: "auth-google",
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return rateLimit.response;
  }

  try {
    const credential = await readCredential(req);
    if (!credential) {
      throw new AppError("Missing Google credential.", 400, "BAD_REQUEST");
    }

    const result = await authenticateWithGoogle(credential);
    if (isRedirectFlow) {
      const response = NextResponse.redirect(new URL(redirectPath, req.url), {
        status: 303,
        headers: rateLimit.headers,
      });
      response.cookies.delete("google_auth_from");

      return response;
    }

    return NextResponse.json(result, {
      headers: rateLimit.headers,
    });
  } catch (error) {
    if (isRedirectFlow) {
      const url = new URL(failurePath, req.url);
      url.searchParams.set(
        "googleError",
        getErrorMessage(error, "Authentication failed."),
      );

      const response = NextResponse.redirect(url, {
        status: 303,
        headers: rateLimit.headers,
      });
      response.cookies.delete("google_auth_from");

      return response;
    }

    return NextResponse.json(
      { message: getErrorMessage(error, "Authentication failed.") },
      {
        status: getErrorStatus(error),
        headers: rateLimit.headers,
      },
    );
  }
}
