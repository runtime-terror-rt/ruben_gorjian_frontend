import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json().catch(() => ({}));
    const headers = await getBackendHeaders();
    headers["Content-Type"] = "application/json";

    const res = await fetch(`${getBackendUrl()}/scheduler/sessions/${id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Scheduler Session status ${id} PATCH Error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
