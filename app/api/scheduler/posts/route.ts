import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/api/scheduler/posts${searchParams ? `?${searchParams}` : ''}`, {
      method: "GET",
      headers,
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Posts GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const headers = await getBackendHeaders();

    let body: BodyInit | null;

    if (contentType.includes("application/json")) {
      const postData = await request.json().catch(() => ({}));
      const formData = new FormData();
      formData.append("data", JSON.stringify(postData));
      body = formData;
      // Note: We don't set Content-Type header here because FormData will set it with the boundary
    } else {
      // For multipart/form-data (files), we forward the body as-is (readable stream)
      body = request.body;
      headers["Content-Type"] = contentType;
    }

    const res = await fetch(`${getBackendUrl()}/api/scheduler/posts`, {
      method: "POST",
      headers,
      body,
      // @ts-expect-error - duplex is required for streaming request bodies in new fetch
      duplex: 'half',
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Posts POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
