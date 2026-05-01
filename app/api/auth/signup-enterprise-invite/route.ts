import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/server-backend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const cookieHeader = cookieStore ? cookieStore.toString() : "";

    const res = await fetch(`${getBackendUrl()}/auth/signup-enterprise-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    const setCookies = res.headers.getSetCookie();
    for (const cookie of setCookies) {
      response.headers.append("set-cookie", cookie);
    }

    // Fallback: If backend returns a token but cookie wasn't set properly, set it manually
    if (data.token) {
      response.cookies.set({
        name: "auth-token",
        value: data.token,
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    return response;
  } catch (err) {
    console.error("Enterprise invite signup proxy error:", err);
    return NextResponse.json(
      { error: "Unable to complete signup", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}