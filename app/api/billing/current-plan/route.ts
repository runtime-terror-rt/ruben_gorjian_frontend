import { NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function GET() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/billing/current-plan`, {
      headers: await getBackendHeaders(),
      credentials: "include",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch billing data" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Fetch billing data error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
