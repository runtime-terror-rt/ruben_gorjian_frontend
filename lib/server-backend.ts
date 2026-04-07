import { cookies } from "next/headers";

const backendUrl = process.env.BACKEND_API_URL;

const getBackendUrl = () => {
  if (!backendUrl) {
    throw new Error("BACKEND_API_URL is not configured");
  }
  return backendUrl.replace(/\/$/, "");
};

/**
 * Common headers for backend requests:
 * - ngrok-skip-browser-warning for dev bypass
 * - forwarding browser cookies for auth
 */
const getBackendHeaders = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore ? cookieStore.toString() : "";
  
  return {
    "ngrok-skip-browser-warning": "true",
    ...(cookieHeader ? { cookie: cookieHeader } : {}),
  };
};

export { getBackendUrl, getBackendHeaders };
