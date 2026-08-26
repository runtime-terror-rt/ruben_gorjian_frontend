import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Allowed domains for downloading (SSRF protection)
const ALLOWED_DOMAINS = [
  "talexia.s3.us-east-2.amazonaws.com",
  "talexia-public.s3.amazonaws.com",
];

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  const fileName = request.nextUrl.searchParams.get("filename") || "download";

  if (!urlParam) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    // 1. SSRF Protection: Validate the URL
    const parsedUrl = new URL(urlParam);
    if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
      console.warn(`[Proxy Download] Blocked attempt to download from unauthorized domain: ${parsedUrl.hostname}`);
      return new NextResponse("Unauthorized domain", { status: 403 });
    }

    // 2. Fetch the file
    const res = await fetch(parsedUrl.toString());
    if (!res.ok) {
      throw new Error(`Upstream responded with ${res.status}: ${res.statusText}`);
    }

    // 3. Stream the response directly to the client
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        // Prevent caching of the downloaded file in the browser
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("[Proxy Download] Error:", error.message);
    return new NextResponse("Failed to download file", { status: 500 });
  }
}
