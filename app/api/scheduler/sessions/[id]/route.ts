import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/scheduler/sessions/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Session PATCH Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
