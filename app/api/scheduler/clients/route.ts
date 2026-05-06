import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const headers = await getBackendHeaders();

    // Proxying to backend /api/scheduler/clients
    const res = await fetch(`${getBackendUrl()}/api/scheduler/clients${searchParams ? `?${searchParams}` : ''}`, {
      method: "GET",
      headers,
    });

  

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return NextResponse.json(errorData, { status: res.status });
    }

    const data = await res.json().catch(() => null);


    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Clients GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
