import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/server-backend";

// Public endpoint — no authentication required
export async function GET(
  req: Request,
  { params }: { params: Promise<{ planCode: string }> }
) {
  try {
    const { planCode } = await params;

    const res = await fetch(`${getBackendUrl()}/enterprise-plan/invites/${planCode}/details`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Failed to fetch enterprise plan details:", err);
    return NextResponse.json({ error: "Unable to load enterprise plan details" }, { status: 500 });
  }
}
