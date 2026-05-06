import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.userId || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const headers = await getBackendHeaders();
    
    const response = await fetch(
      `${getBackendUrl()}/api/admin/users/${id}/connected-platforms`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Connected platforms fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch connected platforms" },
      { status: 500 }
    );
  }
}
