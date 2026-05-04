import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/scheduler/sessions${searchParams ? `?${searchParams}` : ''}`, {
      method: "GET",
      headers,
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Sessions GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => ({}));

    // Prevent uploading assets for Video Sessions
    if (rawBody.scheduleType === "VIDEO_SESSION" && rawBody.uploadedAssetIds && rawBody.uploadedAssetIds.length > 0) {
      return NextResponse.json(
        { error: "Assets (photos/videos) cannot be uploaded for Video Sessions." },
        { status: 400 }
      );
    }
    const headers = await getBackendHeaders();
    headers["Content-Type"] = "application/json";

    const res = await fetch(`${getBackendUrl()}/scheduler/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify(rawBody),
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Sessions POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
