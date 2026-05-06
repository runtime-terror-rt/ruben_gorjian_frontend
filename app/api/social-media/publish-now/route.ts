import { NextResponse, type NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/server-backend";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
      const cookieStore = await cookies();
      const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

      let body = {};
      try {
        body = await req.json();
      } catch (e) {
        // Body might be empty
      }

      const res = await fetch(`${getBackendUrl()}/api/social-media/publish-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { cookie: cookieHeader } : {})
        },
        credentials: "include",
        body: JSON.stringify(body)
      });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Publish post proxy error:", error);
    return NextResponse.json({ error: "Failed to publish post" }, { status: 500 });
  }
}
