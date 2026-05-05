import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/server-backend";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await fetch(`${getBackendUrl()}/auth/me`, {
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      credentials: "include",
      cache: "no-store",
    });
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    // Only proxy cookies if the backend request was successful (authenticated)
    if (res.ok) {
      const setCookies = res.headers.getSetCookie();
      for (const cookie of setCookies) {
        response.headers.append("set-cookie", cookie);
      }
    } 
    // If the backend returns 401, it means the session is invalid or non-existent.
    // We clear the cookies to keep the frontend state clean and professional.
    else if (res.status === 401) {
      response.cookies.delete("token");
      response.cookies.delete("auth-token");
    }

    return response;
  } catch (err) {
    console.error("Auth me proxy error", err);
    return NextResponse.json({ error: "Unable to load session" }, { status: 500 });
  }
}
