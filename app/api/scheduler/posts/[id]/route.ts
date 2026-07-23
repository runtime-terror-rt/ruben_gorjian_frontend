import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.ANOTHER_BACKEND_API_URL ||
  "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${getBackendUrl()}/scheduler/posts/${id}`, {
      method: "GET",
      headers: {
        ...(token ? { Cookie: `token=${token}` } : {}),
      },
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Scheduler Post ${id} GET Error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const contentType = request.headers.get("content-type") || "";
    const headers = await getBackendHeaders();

    let patchData = {};

    if (contentType.includes("application/json")) {
      patchData = await request.json().catch(() => ({}));
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData().catch(() => null);
      if (formData) {
        const dataStr = formData.get("data");
        if (dataStr && typeof dataStr === "string") {
          try {
            patchData = JSON.parse(dataStr);
          } catch (e) {
            console.error("Failed to parse form data JSON", e);
          }
        }
      }
    }

    headers["Content-Type"] = "application/json";

    const res = await fetch(`${getBackendUrl()}/scheduler/posts/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(patchData),
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Scheduler Post ${id} PATCH Error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${getBackendUrl()}/scheduler/posts/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Cookie: `token=${token}` } : {}),
      },
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error(`Scheduler Post ${id} DELETE Error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
