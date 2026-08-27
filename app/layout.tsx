import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Suspense } from "react";
import SmoothScroller from "@/components/SmoothScroller";
import MetaPixel from "@/components/MetaPixel";
import Script from "next/script";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";
import { getEnvVar } from "@/lib/env-utils";
import QueryProvider from "@/app/providers/QueryProvider";
import SocketProvider from "@/app/providers/SocketProvider";
import ErrorBoundary from "@/components/error-boundary";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Talexia",
  description:
    "Editorial visual production for fine jewelry brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
      </head>

      <body suppressHydrationWarning 
        className="min-h-screen antialiased bg-[#faf8f3] text-[#14110c] px-2 sm:px-0"
      >
        <Toaster
          position="top-right"
          expand={false}
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "bg-slate-900 border border-slate-800 text-slate-100 shadow-xl",
              title: "text-white",
              description: "text-slate-300",
              success: "border-lime-400/40",
              error: "border-red-500/40",
              warning: "border-amber-400/40",
              info: "border-sky-400/40",
            } }}
        />
        <ErrorBoundary>
          <SessionProvider>
            <QueryProvider>
              <SocketProvider>
                <SmoothScroller />
                {children}
                <Analytics />
                <Suspense fallback={null}>
                  <MetaPixel
                    pixelId={getEnvVar("NEXT_PUBLIC_META_PIXEL_ID") ?? ""}
                  />
                </Suspense>
              </SocketProvider>
            </QueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

