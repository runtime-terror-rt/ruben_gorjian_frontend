"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SocialCallbackPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState("Finalizing your connection...");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const finalize = async () => {
      const platform = sessionStorage.getItem("pending_platform");

      if (!platform) {
        setStatus("Invalid callback state. No pending platform found.");
        toast({ title: "Error", description: "No pending platform to connect.", variant: "destructive" });
        setTimeout(() => {
          router.push("/dashboard/social");
        }, 2000);
        return;
      }

      try {
        const res = await fetch("/api/social-media/platform/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ platform }),
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || result.message || "Failed to finalize");
        
        toast({ title: "Connected", description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} account connected successfully.` });
      } catch (err) {
        console.error("Finalize failed", err);
        toast({ title: "Connection failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      } finally {
        // cleanup
        sessionStorage.removeItem("pending_platform");
        router.push("/dashboard/social");
      }
    };

    finalize();
  }, [router, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-lg font-semibold">{status}</p>
      </div>
    </div>
  );
}
