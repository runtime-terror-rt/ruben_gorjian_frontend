import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/uploads/assets/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.error || "Failed to delete asset" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Asset DELETE Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
