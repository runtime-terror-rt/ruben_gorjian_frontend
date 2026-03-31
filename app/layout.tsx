import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Suspense } from "react";
<<<<<<< HEAD
import { poppins, stack_sans_notch } from "./fonts";
=======
import { poppins, stack_sans_notch, sora } from "./fonts";
>>>>>>> 1481ac94701442bff06c3a5237848e67723f65c9
import SmoothScroller from "@/components/SmoothScroller";
import MetaPixel from "@/components/MetaPixel";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";
import { getEnvVar } from "@/lib/env-utils";
import QueryProvider from "@/app/providers/QueryProvider";
import SocketProvider from "@/app/providers/SocketProvider";
import ErrorBoundary from "@/components/error-boundary";

export const metadata: Metadata = {
  title: "Talexia.ai - Your AI-Powered Social Media Team",
  description:
    "Talexia.ai turns your photos into high-impact visuals, plans your calendar, and generates strategic captions and hashtags.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body
<<<<<<< HEAD
        className={`${stack_sans_notch.className} ${poppins.className} min-h-screen antialiased bg-slate-950`}
=======
<<<<<<< HEAD
        className={`${stack_sans_notch.variable} ${poppins.variable} ${sora.variable} ${stack_sans_notch.className} ${poppins.className} min-h-screen antialiased bg-slate-950 px-2 sm:px-0`}
=======
        className={`${stack_sans_notch.variable} ${poppins.variable} ${sora.variable} ${stack_sans_notch.className} ${poppins.className} min-h-screen antialiased bg-slate-950`}
>>>>>>> 8ab9bb6 (updated)
>>>>>>> 1481ac94701442bff06c3a5237848e67723f65c9
      >
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
