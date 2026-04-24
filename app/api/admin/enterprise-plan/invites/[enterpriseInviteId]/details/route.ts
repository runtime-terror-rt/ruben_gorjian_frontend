import { NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ enterpriseInviteId: string }> }
) {
  try {
    const { enterpriseInviteId } = await params;
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/admin/enterprise-plan/invites/${enterpriseInviteId}/details`, {
      headers,
      credentials: "include",
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Admin invite details proxy error:", err);
    return NextResponse.json({ error: "Unable to load details" }, { status: 500 });
  }
}
