import { NextRequest, NextResponse } from "next/server";
import { getBackendHeaders, getBackendUrl } from "@/lib/server-backend";

async function proxyResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  }
  const text = await res.text().catch(() => "");
  return new NextResponse(text, {
    status: res.status,
    headers: contentType ? { "content-type": contentType } : undefined,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const headers = await getBackendHeaders();
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'host' && lowerKey !== 'connection' && lowerKey !== 'accept-encoding') {
        headers[key] = value;
      }
    });

    const res = await fetch(`${getBackendUrl()}/case-studies/${id}`, {
      method: "PATCH",
      headers,
      body: request.body as any,
      duplex: "half",
    } as RequestInit);

    return proxyResponse(res);
  } catch (error: any) {
    console.error("Case Studies PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const headers = await getBackendHeaders();

    const res = await fetch(`${getBackendUrl()}/case-studies/${id}`, {
      method: "DELETE",
      headers,
    });

    return proxyResponse(res);
  } catch (error: any) {
    console.error("Case Studies DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

