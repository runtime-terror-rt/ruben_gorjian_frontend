import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/server-backend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${getBackendUrl()}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include",
    });
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    const setCookies = res.headers.getSetCookie();
    for (const cookie of setCookies) {
      response.headers.append("set-cookie", cookie);
    }

    // Fallback: If backend returns a token in body but set-cookie didn't work
    if (data.token) {
      response.cookies.set({
        name: "token",
        value: data.token,
        httpOnly: true,
        path: "/",
        secure: req.headers.get("x-forwarded-proto") === "https",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    return response;
  } catch (err) {
    console.error("Google login proxy error", err);
    return NextResponse.json({ error: "Unable to login with Google" }, { status: 500 });
  }
}
