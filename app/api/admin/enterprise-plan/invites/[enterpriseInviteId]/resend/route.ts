import { NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ enterpriseInviteId: string }> }
) {
  try {
    const { enterpriseInviteId } = await params;
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/admin/enterprise-plan/invites/${enterpriseInviteId}/resend`, {
      method: "POST",
      headers,
      credentials: "include",
    });
    
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { message: text };
    } catch (err) {
      data = { message: text || "Empty response from server" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Admin resend invitation proxy error:", err);
    return NextResponse.json(
      { error: "Unable to resend invitation", details: err instanceof Error ? err.message : String(err) }, 
      { status: 500 }
    );
  }
}
