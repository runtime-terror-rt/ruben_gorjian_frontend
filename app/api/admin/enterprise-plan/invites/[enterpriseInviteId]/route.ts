import { NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ enterpriseInviteId: string }> }
) {
  try {
    const { enterpriseInviteId } = await params;
    const body = await req.json();
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/admin/enterprise-plan/invites/${enterpriseInviteId}`, {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Admin update invite proxy error:", err);
    return NextResponse.json(
      { error: "Unable to update enterprise invite", details: err instanceof Error ? err.message : String(err) }, 
      { status: 500 }
    );
  }
}
