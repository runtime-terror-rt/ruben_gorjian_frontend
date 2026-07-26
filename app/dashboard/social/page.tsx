"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Unlink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  FaFacebook as Facebook,
  FaInstagram as Instagram,
} from "react-icons/fa";
import { SiTiktok as Tiktok } from "react-icons/si";
import { PlatformUpsellModal } from "@/components/dashboard/PlatformUpsellModal";

const primaryButtonClass = "dashboard-primary-btn";
const iconPrimaryButtonClass = "dashboard-primary-btn h-8 w-8 px-0";

interface PlanInfo {
  platformLimit: number;
  addonPlatformQty: number;
  code: string;
}


interface SocialAccount {
  id: string;
  platform: "INSTAGRAM" | "FACEBOOK" | "TIKTOK";
  displayName?: string | null;
  externalAccountId?: string | null;
  createdAt?: string;
}

function isUploadPostAccount(account?: SocialAccount | null) {
  return Boolean(account?.externalAccountId?.startsWith("upload-post:"));
}

function SocialPageInner() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<
    SocialAccount["platform"] | null
  >(null);
  const [connectErrors, setConnectErrors] = useState<
    Partial<Record<SocialAccount["platform"], string>>
  >({});
  const [inlineMessage, setInlineMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledQueryKeyRef = useRef<string | null>(null);
  const refetchRetryIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [plan, setPlan] = useState<PlanInfo | null>(null);
  const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
  const [pendingConnectPlatform, setPendingConnectPlatform] = useState<SocialAccount["platform"] | null>(null);
  const queryKey = searchParams.toString();

  // Fetch once on mount; keep this outside dependencies so changes to toast don't retrigger repeatedly
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await fetch(`/api/social-media/platform/my-links?_t=${Date.now()}`, {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        }
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      const rawAccounts = Array.isArray(data)
        ? data
        : data.links || data.accounts || data.data || [];

      const mappedAccounts: SocialAccount[] = rawAccounts.map((acc: any) => ({
        id: acc.id || acc._id || acc.platform,
        platform: acc.platform?.toUpperCase(),
        displayName: acc.username || acc.displayName || acc.platform,
        externalAccountId: acc.externalAccountId || acc.username || "",
        createdAt: acc.createdAt,
      }));
      setAccounts(mappedAccounts);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch connected accounts";
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPlanInfo = useCallback(async () => {
    try {
      const data = await apiGet<{
        success: boolean;
        plan: any;
        subscription: any;
      }>("/api/billing/current-plan");

      if (data.success && data.plan) {
        setPlan({
          platformLimit: data.plan.platformQty || data.plan.platformLimit || 0,
          addonPlatformQty: data.subscription?.addonPlatformQty || 0,
          code: data.plan.code,
        });
      }
    } catch (error) {
      console.error("Failed to fetch plan info:", error);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchPlanInfo();
  }, [fetchAccounts, fetchPlanInfo]);

  // Clear delayed refetch on unmount
  useEffect(() => {
    return () => {
      if (refetchRetryIdRef.current) {
        clearTimeout(refetchRetryIdRef.current);
        refetchRetryIdRef.current = null;
      }
    };
  }, []);
  const connectPlatform = async (platform: SocialAccount["platform"]) => {
    // Strictly follow plan limits
    if (plan) {
      const totalAllowed = plan.platformLimit;
      const connectedCount = accounts.length;

      console.log("Connect attempt:", {
        platform,
        connectedCount,
        totalAllowed,
        plan,
        willShowModal: connectedCount >= totalAllowed
      });

      // strictly follow the 3-platform limit rule
      if (connectedCount >= totalAllowed && totalAllowed < 3) {
        setPendingConnectPlatform(platform);
        setIsUpsellModalOpen(true);
        return;
      }

      if (totalAllowed >= 3 && connectedCount >= totalAllowed) {
        toast({
          title: "Limit Reached",
          description: "You have reached the maximum limit of 3 platforms.",
          variant: "destructive",
        });
        return;
      }
    } else {
      console.log("Plan not loaded yet, allowing connection attempt...");
    }

    await performConnect(platform);
  };

  const performConnect = async (platform: SocialAccount["platform"]) => {
    sessionStorage.setItem("pending_platform", platform.toLowerCase());
    setConnectingPlatform(platform);
    setConnectErrors((prev) => ({ ...prev, [platform]: undefined }));
    try {
      const response = await fetch("/api/social-media/platform/connect-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        credentials: "include",
        body: JSON.stringify({
          platform: platform.toLowerCase(),
          timestamp: Date.now(), // Add timestamp to prevent caching
        }),
      });

      const data = await response.json().catch(() => ({}));

      console.log("Connect response:", data);

      // Success case: extract and redirect to connect URL
      const connectUrl =
        data.url || data.link || data.connect?.access_url || data.connect?.url;

      if (connectUrl) {
        window.location.href = connectUrl;
        return;
      }

      // Check if response is successful first
      if (!response.ok) {
        const errorMsg =
          (typeof data.error === "string" ? data.error : null) ||
          (typeof data.message === "string" ? data.message : null) ||
          data.details?.message ||
          data.details?.provider?.message ||
          (typeof data.err === "string" ? data.err : null) ||
          (data.error
            ? typeof data.error === "object"
              ? JSON.stringify(data.error)
              : String(data.error)
            : null) ||
          (data && Object.keys(data).length > 0
            ? JSON.stringify(data)
            : null) ||
          `HTTP ${response.status}: ${response.statusText}`;

        console.error("BACKEND REJECTED CONNECTION:", {
          platform,
          errorMsg,
          httpStatus: response.status,
          planDataInFrontend: plan
        });

        // Falls back to upsell modal if backend says limit reached AND user truly has < 3 slots
        if (errorMsg.toLowerCase().includes("limit reached")) {
          const currentTotalAllowed = plan?.platformLimit || 0;
          if (currentTotalAllowed < 3) {
            setPendingConnectPlatform(platform);
            setIsUpsellModalOpen(true);
            return;
          } else {
            // If plan says they have slots, but backend rejects, it's a sync issue
            // We show the error banner but NOT the modal
          }
        }

        setConnectErrors((prev) => ({ ...prev, [platform]: errorMsg }));
        toast({
          title: `Failed to connect ${platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()}`,
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      // If we reach here, response was OK but no connect URL was found
      const errorMsg = "No connect URL returned from server.";
      setConnectErrors((prev) => ({ ...prev, [platform]: errorMsg }));
      toast({
        title: `Failed to connect ${platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()}`,
        description: errorMsg,
        variant: "destructive",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to connect account";
      console.error("Connect error:", error);
      setConnectErrors((prev) => ({ ...prev, [platform]: message }));
      toast({
        title: `Failed to connect ${platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()}`,
        description: message,
        variant: "destructive",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const response = await fetch("/api/social-media/platform/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      setAccounts(accounts.filter((acc) => acc.id !== accountId));
      toast({
        title: "Disconnected",
        description: "Account disconnected successfully.",
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast({
        title: "Failed to disconnect",
        description:
          error instanceof Error
            ? error.message
            : "Failed to disconnect account",
        variant: "destructive",
      });
    }
  };

  const facebookAccount = accounts.find((acc) => acc.platform === "FACEBOOK");
  const instagramAccount = accounts.find((acc) => acc.platform === "INSTAGRAM");
  const tiktokAccount = accounts.find((acc) => acc.platform === "TIKTOK");

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#14110c]">Social Media</h1>
          <p className="text-sm text-[#6b6b6b]">Loading your connected accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#14110c]">Social Media</h1>
        <p className="text-sm text-[#6b6b6b]">
          Connect your social media accounts to schedule and publish posts
        </p>
        {inlineMessage && (
          <div
            className={`mt-3 rounded-md border px-3 py-2 text-sm ${inlineMessage.type === "error"
              ? "border-amber-500/50 bg-amber-500/10 text-amber-100"
              : "border-[#b08d3e]/50 bg-[#b08d3e]/10 text-lime-100"
              }`}
          >
            {inlineMessage.text}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className={`transition-all duration-200 ${facebookAccount ? "border-[#b08d3e]/40 bg-white shadow-sm" : "border-[#d9d4c9] bg-[#ffffff]/60"}`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-[#1877F2]">
                  <Facebook className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-[#14110c]">Facebook</CardTitle>
                  {/* <CardDescription className="text-[#6b6b6b]">
                    Connect your Facebook page 
                  </CardDescription> */}
                </div>
              </div>
              {facebookAccount && (
                <span className="text-xs bg-[#b08d3e]/10 text-[#8a6d28] border border-[#b08d3e]/30 px-2 py-1 rounded font-medium">
                  ● Connected
                </span>
              )}
              {isUploadPostAccount(facebookAccount) && (
                <Badge variant="outline">via Upload-Post</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {facebookAccount ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#faf8f3] border border-[#d9d4c9]">
                  <p className="text-sm font-medium text-[#14110c]">
                    @
                    {facebookAccount.displayName ||
                      facebookAccount.externalAccountId ||
                      "facebook-page"}
                  </p>
                  <p className="text-xs text-[#b08d3e]">
                    Connected{" "}
                    {facebookAccount.createdAt
                      ? new Date(facebookAccount.createdAt).toLocaleDateString()
                      : "just now"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectAccount(facebookAccount.id)}
                    className="flex-1 !bg-[#d9d4c9] !border-[#b08d3e] hover:!bg-[#d9d4c9] hover:!border-[#b08d3e]"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 px-0"
                    title="View on Facebook"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {connectErrors.FACEBOOK && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                    {connectErrors.FACEBOOK}
                  </div>
                )}
                <p className="text-sm text-[#6b6b6b]">
                  Connect your Facebook page to start scheduling posts to
                  Facebook
                </p>
                <Button
                  onClick={() => connectPlatform("FACEBOOK")}
                  disabled={connectingPlatform === "FACEBOOK"}
                  className={`w-full ${primaryButtonClass}`}
                >
                  {connectingPlatform === "FACEBOOK"
                    ? "Connecting..."
                    : "Connect Facebook"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className={`transition-all duration-200 ${instagramAccount ? "border-[#b08d3e]/40 bg-white shadow-sm" : "border-[#d9d4c9] bg-[#ffffff]/60"}`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white shadow-sm">
                <Instagram className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#14110c]">Instagram</CardTitle>
              </div>
              {instagramAccount && (
                <span className="text-xs bg-[#b08d3e]/10 text-[#8a6d28] border border-[#b08d3e]/30 px-2 py-1 rounded font-medium">
                  ● Connected
                </span>
              )}
              {isUploadPostAccount(instagramAccount) && (
                <Badge variant="outline">via Upload-Post</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {instagramAccount ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#faf8f3] border border-[#d9d4c9]">
                  <p className="text-sm font-medium text-[#14110c]">
                    @
                    {instagramAccount.displayName ||
                      instagramAccount.externalAccountId ||
                      "instagram-account"}
                  </p>
                  <p className="text-xs text-[#b08d3e]">
                    Connected{" "}
                    {instagramAccount.createdAt
                      ? new Date(
                        instagramAccount.createdAt,
                      ).toLocaleDateString()
                      : "just now"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectAccount(instagramAccount.id)}
                    className="flex-1 !bg-[#d9d4c9] !border-[#b08d3e] hover:!bg-[#d9d4c9] hover:!border-[#b08d3e]"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 px-0"
                    title="View on Instagram"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {connectErrors.INSTAGRAM && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                    {connectErrors.INSTAGRAM}
                  </div>
                )}
                <p className="text-sm text-[#6b6b6b]">
                  Connect Instagram to publish directly to your feed
                </p>
                <Button
                  onClick={() => connectPlatform("INSTAGRAM")}
                  disabled={connectingPlatform === "INSTAGRAM"}
                  className={`w-full ${primaryButtonClass}`}
                >
                  {connectingPlatform === "INSTAGRAM"
                    ? "Connecting..."
                    : "Connect Instagram"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className={`transition-all duration-200 ${tiktokAccount ? "border-[#b08d3e]/40 bg-white shadow-sm" : "border-[#d9d4c9] bg-[#ffffff]/60"}`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-black text-white border border-[#d9d4c9] shadow-sm">
                <Tiktok className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#14110c]">TikTok</CardTitle>
              </div>
              {tiktokAccount && (
                <span className="text-xs bg-[#b08d3e]/10 text-[#8a6d28] border border-[#b08d3e]/30 px-2 py-1 rounded font-medium">
                  ● Connected
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {tiktokAccount ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#faf8f3] border border-[#d9d4c9]">
                  <p className="text-sm font-medium text-[#14110c]">
                    @
                    {tiktokAccount.displayName ||
                      tiktokAccount.externalAccountId ||
                      "tiktok-account"}
                  </p>
                  <p className="text-xs text-[#b08d3e]">
                    Connected{" "}
                    {tiktokAccount.createdAt
                      ? new Date(tiktokAccount.createdAt).toLocaleDateString()
                      : "just now"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectAccount(tiktokAccount.id)}
                    className="flex-1 !bg-[#d9d4c9] !border-[#b08d3e] hover:!bg-[#d9d4c9] hover:!border-[#b08d3e]"
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {connectErrors.TIKTOK && (
                  <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                    {connectErrors.TIKTOK}
                  </div>
                )}
                <p className="text-sm text-[#6b6b6b]">
                  Connect TikTok to schedule and post videos
                </p>
                <Button
                  onClick={() => connectPlatform("TIKTOK" as any)}
                  disabled={connectingPlatform === ("TIKTOK" as any)}
                  className={`w-full ${primaryButtonClass}`}
                >
                  {connectingPlatform === ("TIKTOK" as any)
                    ? "Connecting..."
                    : "Connect TikTok"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(facebookAccount || instagramAccount || tiktokAccount) && (
        <Card className="border-[#d9d4c9] bg-[#ffffff]/60">
          <CardHeader>
            <CardTitle className="text-[#14110c]">Connected Accounts</CardTitle>
            <CardDescription className="text-[#6b6b6b]">
              These accounts are ready for scheduling posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facebookAccount && (
                <div className="flex items-center justify-between p-3 border border-[#d9d4c9] rounded-lg bg-[#e6e1d8]/30">
                  <div className="flex items-center space-x-3">
                    <div className="text-[#1877F2]">
                      <Facebook className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#14110c]">
                        @
                        {facebookAccount.displayName ||
                          facebookAccount.externalAccountId ||
                          "facebook-page"}
                      </p>
                      <p className="text-xs text-[#b08d3e]">Facebook Page</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => disconnectAccount(facebookAccount.id)}
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {instagramAccount && (
                <div className="flex items-center justify-between p-3 border border-[#d9d4c9] rounded-lg bg-[#e6e1d8]/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white">
                      <Instagram className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#14110c]">
                        @
                        {instagramAccount.displayName ||
                          instagramAccount.externalAccountId ||
                          "instagram-account"}
                      </p>
                      <p className="text-xs text-[#b08d3e]">
                        Instagram Business
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => disconnectAccount(instagramAccount.id)}
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {tiktokAccount && (
                <div className="flex items-center justify-between p-3 border border-[#b08d3e]/30 rounded-lg bg-white">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-lg bg-black text-white border border-[#d9d4c9]">
                      <Tiktok className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#14110c]">
                        @
                        {tiktokAccount.displayName ||
                          tiktokAccount.externalAccountId ||
                          "tiktok-account"}
                      </p>
                      <p className="text-xs text-[#b08d3e]">TikTok</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => disconnectAccount(tiktokAccount.id)}
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <PlatformUpsellModal
        isOpen={isUpsellModalOpen}
        onOpenChange={setIsUpsellModalOpen}
        currentTotalAllowed={plan?.platformLimit || 0}
        onSuccess={async () => {
          // 1. Refresh plan info to get the new limit
          await fetchPlanInfo();

          // 2. Automatically resume the connection process
          if (pendingConnectPlatform) {
            const platformToConnect = pendingConnectPlatform;
            setPendingConnectPlatform(null);
            // Small delay to ensure state and backend are in sync
            setTimeout(() => {
              performConnect(platformToConnect);
            }, 500);
          }
        }}
      />
    </div>
  );
}

export default function SocialPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#14110c]">Social Media</h1>
            <p className="text-sm text-[#6b6b6b]">Loading your connected accounts...</p>
          </div>
        </div>
      }
    >
      <SocialPageInner />
    </Suspense>
  );
}
