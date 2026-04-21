import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/server-backend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${getBackendUrl()}/api/auth/signup-enterprise-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || "Empty response from server" };
    }

    const response = NextResponse.json(data, { status: res.status });

    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
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
