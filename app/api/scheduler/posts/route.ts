import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.ANOTHER_BACKEND_API_URL ||
  "http://localhost:4000";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams.toString();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${BACKEND_URL}/scheduler/posts${searchParams ? `?${searchParams}` : ''}`, {
      method: "GET",
      headers: {
        ...(token ? { Cookie: `token=${token}` } : {}),
      },
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Posts GET Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let body: BodyInit | null;
    const headers: Record<string, string> = {
      ...(token ? { Cookie: `token=${token}` } : {}),
    };

    if (contentType.includes("application/json")) {
      const postData = await request.json().catch(() => ({}));
      const formData = new FormData();
      formData.append("data", JSON.stringify(postData));
      body = formData;
    } else {
      // For multipart/form-data (files), we forward the body as-is (readable stream)
      // and let the backend deal with the boundary
      body = request.body;
      headers["Content-Type"] = contentType;
    }

    const res = await fetch(`${BACKEND_URL}/scheduler/posts`, {
      method: "POST",
      headers,
      body,
      // @ts-expect-error - duplex is required for streaming request bodies in new fetch
      duplex: 'half',
    });

    const data = await res.json().catch(() => null);

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Scheduler Posts POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
