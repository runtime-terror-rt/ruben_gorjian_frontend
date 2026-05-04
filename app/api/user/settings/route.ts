import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/server-backend";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await fetch(`${getBackendUrl()}/user/settings`, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      credentials: "include",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Settings GET proxy error", err);
    return NextResponse.json({ error: "Unable to load settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return PATCH(req);
}

export async function PATCH(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
    
    let body: any;
    let headers: Record<string, string> = {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      // Forward the formData to backend
      const res = await fetch(`${getBackendUrl()}/user/settings`, {
        method: "PATCH",
        headers: headers, // fetch will automatically set the boundary for FormData
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } else {
      body = await req.json();
      headers["Content-Type"] = "application/json";
      const res = await fetch(`${getBackendUrl()}/user/settings`, {
        method: "PATCH",
        headers: headers,
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch (err) {
    console.error("Settings PATCH proxy error", err);
    return NextResponse.json({ error: "Unable to update settings" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
    const res = await fetch(`${getBackendUrl()}/user/settings/photo`, {
      method: "DELETE",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      credentials: "include",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Settings DELETE photo proxy error", err);
    return NextResponse.json({ error: "Unable to remove profile photo" }, { status: 500 });
  }
}
