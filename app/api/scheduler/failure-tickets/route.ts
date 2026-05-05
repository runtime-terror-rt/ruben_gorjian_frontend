import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/api/scheduler/failure-tickets${searchParams ? `?${searchParams}` : ''}`, {
      method: "GET",
      headers,
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Failure Tickets GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
