import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/server-backend";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    // We try to fetch the invite details from the backend
    // Common pattern is /auth/enterprise-invite/:token or similar
    const res = await fetch(`${getBackendUrl()}/auth/enterprise-invite/${token}`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Fetch enterprise invite details error:", err);
    return NextResponse.json({ error: "Unable to load invite details" }, { status: 500 });
  }
}
