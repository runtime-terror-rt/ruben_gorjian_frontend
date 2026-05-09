import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/server-backend";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

    // Professional Public Proxy: Hitting /admin/coupons without cookies as it's public.
    const res = await fetch(`${getBackendUrl()}/admin/coupons`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Coupons API (/admin/coupons) returned ${res.status}: ${res.statusText}`);
      const errorText = await res.text();
      console.error(`Error body: ${errorText}`);
      return NextResponse.json({ error: "Failed to fetch coupons from backend" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Coupons proxy error", err);
    return NextResponse.json({ error: "Unable to fetch coupons" }, { status: 500 });
  }
}
