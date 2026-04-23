import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/server-backend";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ planCode: string }> }
) {
  try {
    const { planCode } = await params;
    const cookieStore = await cookies();
    const cookieHeader = cookieStore ? cookieStore.toString() : "";

    // Forward to backend
    const res = await fetch(`${getBackendUrl()}/enterprise-plan/invites/${planCode}/details`, {
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`Failed to fetch enterprise plan details for ${err}`, err);
    return NextResponse.json({ error: "Unable to load enterprise plan details" }, { status: 500 });
  }
}
