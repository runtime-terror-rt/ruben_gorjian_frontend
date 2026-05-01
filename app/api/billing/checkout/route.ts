import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/server-backend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();

    // Build a proper "name=value; name2=value2" cookie header.
    // cookieStore.toString() does NOT produce a valid cookie string in Next.js —
    // getAll() + map is the only reliable approach.
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

    console.log(
      "[Billing-Checkout] Forwarding cookies to backend:",
      allCookies.map((c) => c.name).join(", ") || "(none)"
    );

    const res = await fetch(`${getBackendUrl()}/billing/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (err) {
    console.error("Checkout proxy error", err);
    return NextResponse.json({ error: "Unable to start checkout" }, { status: 500 });
  }
}
