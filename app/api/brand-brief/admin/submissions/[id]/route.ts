import { NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const res = await fetch(`${getBackendUrl()}/api/brand-brief/admin/submissions/${id}`, {
      headers: await getBackendHeaders(),
      credentials: "include",
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Brand brief submission details proxy error", err);
    return NextResponse.json({ error: "Unable to load brand brief submission" }, { status: 500 });
  }
}
