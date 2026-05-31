"use client";

import { useState, useEffect, useMemo } from "react";
import { getUserSettings } from "@/app/dashboard/settings/utils";
import { getUserTimezone, getTimezoneAbbr, getTimezoneDisplayName } from "@/lib/timezone";

export function useTimezone() {
  // ✅ Initial state: use browser Intl API directly (not localStorage which may be stale/UTC)
  // localStorage is only used as a cache after settings are loaded
  const [timezone, setTimezone] = useState<string>(() => {
    // Always prefer Intl API on initial render (works on client)
    if (typeof window !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return "UTC"; // SSR fallback — will be overridden by useEffect
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimezone() {
      try {
        const settings = await getUserSettings();
        // Use settings timezone if set, otherwise use browser Intl API
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const userTimezone = settings.business.timezone || browserTz;
        
        console.log("[useTimezone] settings.business.timezone:", settings.business.timezone);
        console.log("[useTimezone] browser Intl timezone:", browserTz);
        console.log("[useTimezone] resolved timezone:", userTimezone);
        
        setTimezone(userTimezone);
        
        // Store in localStorage for quick access (only if it's a valid non-UTC timezone)
        if (typeof window !== "undefined") {
          localStorage.setItem("user_timezone", userTimezone);
        }
      } catch (error) {
        console.error("Failed to load user timezone:", error);
        // Use browser Intl API directly as fallback (not localStorage)
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("[useTimezone] fallback to browser timezone:", browserTz);
        setTimezone(browserTz);
      } finally {
        setLoading(false);
      }
    }

    loadTimezone();
  }, []);

  const abbr = useMemo(() => getTimezoneAbbr(timezone), [timezone]);
  const displayName = useMemo(() => getTimezoneDisplayName(timezone), [timezone]);

  return useMemo(() => ({
    timezone,
    timezoneAbbr: abbr,
    timezoneDisplayName: displayName,
    loading,
  }), [timezone, abbr, displayName, loading]);
}



