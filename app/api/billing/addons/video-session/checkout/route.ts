import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/server-backend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const cookieHeader = cookieStore ? cookieStore.toString() : "";

    const res = await fetch(`${getBackendUrl()}/billing/addons/video-session/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await res.json();
    
    if (!res.ok) {
        return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Video session checkout proxy error", err);
    return NextResponse.json({ error: "Unable to start checkout" }, { status: 500 });
  }
}
