import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const headers = await getBackendHeaders();

    let body: BodyInit | null;

    if (contentType.includes("application/json")) {
      const postData = await request.json().catch(() => ({}));
      body = JSON.stringify(postData);
      headers["Content-Type"] = "application/json";
    } else {
      // For multipart/form-data (files), we forward the body as-is (readable stream)
      body = request.body;
      headers["Content-Type"] = contentType;
    }

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${getBackendUrl()}/api/scheduler/bulk/upload-images${searchParams ? `?${searchParams}` : ''}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      // @ts-expect-error - duplex is required for streaming request bodies in new fetch
      duplex: 'half',
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Bulk Upload Images POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
