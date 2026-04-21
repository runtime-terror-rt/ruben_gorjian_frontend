import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/server-backend";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const cookieHeader = cookieStore ? cookieStore.toString() : "";

    const res = await fetch(`${getBackendUrl()}/admin/enterprise-plan/invites/${id}/resend`, {
      method: "POST",
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      credentials: "include",
    });
    
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }
    return response;
  } catch (err) {
    console.error("Admin resend invitation proxy error", err);
    return NextResponse.json({ error: "Unable to resend invitation" }, { status: 500 });
  }
}
