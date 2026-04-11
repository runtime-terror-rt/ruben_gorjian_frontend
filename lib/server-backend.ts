import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_API_URL;

export function getBackendUrl() {
  if (!backendUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }
  return backendUrl.replace(/\/$/, "");
}

export async function getBackendHeaders(): Promise<Record<string, string>> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore ? cookieStore.toString() : "";
    const headers: Record<string, string> = {
      "ngrok-skip-browser-warning": "true",
    };
    if (cookieHeader) {
      headers.cookie = cookieHeader;
    }
    return headers;
  } catch {
    return { "ngrok-skip-browser-warning": "true" };
  }
}
