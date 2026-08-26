"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { Camera, Eye, EyeOff, Trash2, User, RefreshCw, FileText } from "lucide-react";
import { useSessionContext } from "@/context/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  getUserSettings,
  removeUserAvatar,
  updateUserSettings,
  type UserSettingsResponse,
} from "./utils";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

type FormState = {
  fullName: string;
  businessName: string;
  email: string;
  bio: string;
  industry: string;
  website: string;
  timezone: string;
};

export default function SettingsPage() {
  const { session, refresh, updateSession } = useSessionContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialForm = useMemo<FormState>(
    () => ({
      fullName: "",
      businessName: "",
      email: session?.email || "",
      bio: "",
      industry: "",
      website: "",
      // ✅ Default to browser detected timezone, not UTC
      timezone: typeof window !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC",
    }),
    [session?.email],
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettingsResponse | null>(null);
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNextPw, setShowNextPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "brand-brief" | "full-management" | "security">("profile");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const renderVal = (val: any) => {
    if (val === undefined || val === null || val === "" || val === "N/A") return "-";
    if (Array.isArray(val)) return val.length ? val.join(", ") : "-";
    return val;
  };

  const brandBriefQuery = useQuery({
    queryKey: ["my-brand-brief"],
    queryFn: () => apiGet<{ success: boolean; items: any[] }>("/api/brand-brief/me"),
    enabled: activeTab === "brand-brief",
  });



  const brief = brandBriefQuery.data?.items?.[0];

  const hasBrandBrief = true; // All plans now use Brand Brief
  /* // Commented out old enterprise-only logic
  const isEnterprise =
    session?.subscription?.planCategory?.toUpperCase() === "ENTERPRISE" ||
    session?.subscription?.planCategory?.toUpperCase() === "BRAND_BRIEF" ||
    session?.subscription?.planCategory?.toUpperCase() === "BRAND_BRIF" ||
    session?.subscription?.planCode?.toUpperCase().startsWith("ENT");
  */

  const hasFullManagement = false;
  /* // Commented out old full management logic
  const hasFullManagementOld = !isEnterprise && (session?.fullManagementOnboardingCompleted || session?.subscription?.planCategory === "FULL_MANAGEMENT");
  */

  const fullManagementQuery = useQuery({
    queryKey: ["my-full-management"],
    queryFn: () => apiGet<{ data: any; businessName: string; completed: boolean }>("/api/onboarding/full-management"),
    enabled: false, // Disabled
  });

  const fullManagementData = fullManagementQuery.data?.data;
  const fmBusinessName = fullManagementQuery.data?.businessName;

  const handleDownloadPdf = async () => {
    if (!brief) return;
    setIsDownloading(true);
    try {
      const response = await fetch("/api/brand-brief/me/pdf");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brand-brief-${(brief.restaurantName || "submission").replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadFullManagementPdf = async () => {
    if (!fullManagementData) return;
    setIsDownloading(true);
    try {
      const response = await fetch("/api/onboarding/full-management/pdf");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `full-management-${(fmBusinessName || "onboarding").replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    async function load() {
      setError(null);
      setLoading(true);
      try {
        const data = await getUserSettings();
        setSettings(data);
        setForm({
          fullName: data.profile.fullName || "",
          businessName: data.business.name || "",
          email: data.profile.email || session?.email || "",
          bio: data.profile.bio || "",
          industry: data.business.industry || "",
          website: data.business.website || "",
          timezone: data.business.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Unable to load settings",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [session?.email]);

  const handleChange =
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      };

  const avatarSrc = avatarPreviewUrl
    ? avatarPreviewUrl
    : settings?.profile.avatar.url
      ? `${settings.profile.avatar.url}${settings.profile.avatar.version ? `?v=${settings.profile.avatar.version}` : ""}`
      : null;

  async function persistForm(
    overrides?: Parameters<typeof updateUserSettings>[0]["avatar"],
  ) {
    const payload = {
      fullName: form.fullName.trim(),
      businessName: form.businessName.trim(),
      bio: form.bio.trim(),
      industry: form.industry.trim(),
      website: form.website.trim(),
      timezone: form.timezone.trim(),
      avatar: overrides,
      avatarFile: selectedAvatarFile,
    };
    const data = await updateUserSettings(payload);
    setSettings(data);
    updateSession(data as any);
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl(null);
    await refresh();
    return data;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const errors: string[] = [];
    if (!form.fullName.trim()) errors.push("Full name is required.");
    if (!form.email.trim()) errors.push("Email is required.");
    if (form.website.trim() && !isValidUrl(form.website.trim())) {
      errors.push("Website must be a valid URL.");
    }
    if (form.bio.length > 300) {
      errors.push("Bio must be 300 characters or fewer.");
    }

    if (errors.length > 0) {
      setError(errors.join(" "));
      return;
    }

    setSaving(true);
    try {
      await persistForm();
      setMessage("Settings saved.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  const onAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setMessage(null);

    if (!ALLOWED_AVATAR_TYPES.has(file.type.toLowerCase())) {
      setError("Profile photo must be JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setError("Profile photo must be 5MB or smaller.");
      return;
    }

    setSelectedAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl(previewUrl);
  };

  const onRemoveAvatar = async () => {
    setError(null);
    setMessage(null);
    setAvatarRemoving(true);
    try {
      const data = await removeUserAvatar();
      setSettings(data);
      setAvatarPreviewUrl(null);
      await refresh();
      setMessage("Profile photo removed.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to remove profile photo.",
      );
    } finally {
      setAvatarRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          {/* <p className="text-xs uppercase tracking-wide text-[#6b6b6b]">
            Settings
          </p> */}
          <h1 className="text-2xl font-semibold text-[#14110c]">
            {activeTab === "profile"
              ? "Account & Business"
              : activeTab === "brand-brief"
                ? "Brand Brief"
                : activeTab === "full-management"
                  ? "Full Management"
                  : "Security"}
          </h1>
          <p className="text-sm text-[#14110c]">
            {activeTab === "profile"
              ? "Keep your profile and business info up to date."
              : activeTab === "brand-brief"
                ? "Review your submitted brand brief details."
                : activeTab === "full-management"
                  ? "Review your full management details."
                  : "Manage your account security and password."}
          </p>
        </div>
        {activeTab === "profile" && (
          <Button
            variant="outline"
            className="rounded-full px-4 py-2 border-[#d9d4c9] bg-[#ffffff]/60 text-[#14110c] hover:bg-[#e6e1d8] transition-colors"
            onClick={() => {
              setForm(initialForm);
              setMessage(null);
              setError(null);
            }}
          >
            Reset form
          </Button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#d9d4c9]">
        <button
          onClick={() => setActiveTab("profile")}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-colors relative",
            activeTab === "profile" ? "text-[#b08d3e]" : "text-[#6b6b6b] hover:text-[#14110c]"
          )}
        >
          Profile
          {activeTab === "profile" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b08d3e]" />
          )}
        </button>
        {hasBrandBrief && (
          <button
            onClick={() => setActiveTab("brand-brief")}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors relative",
              activeTab === "brand-brief" ? "text-[#b08d3e]" : "text-[#6b6b6b] hover:text-[#14110c]"
            )}
          >
            Brand Brief
            {activeTab === "brand-brief" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b08d3e]" />
            )}
          </button>
        )}
        {hasFullManagement && (
          <button
            onClick={() => setActiveTab("full-management")}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors relative",
              activeTab === "full-management" ? "text-[#b08d3e]" : "text-[#6b6b6b] hover:text-[#14110c]"
            )}
          >
            Full Management
            {activeTab === "full-management" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b08d3e]" />
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab("security")}
          className={cn(
            "px-6 py-3 text-sm font-medium transition-colors relative",
            activeTab === "security" ? "text-[#b08d3e]" : "text-[#6b6b6b] hover:text-[#14110c]"
          )}
        >
          Security
          {activeTab === "security" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b08d3e]" />
          )}
        </button>
      </div>

      {activeTab === "profile" && (
        <div className="space-y-6">
          {loading ? (
            <p className="text-xs text-[#6b6b6b]">Loading settings...</p>
          ) : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          <form className="space-y-6" onSubmit={onSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <p className="text-xs text-[#6b6b6b]">
                  Your contact details for notifications and support.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full border border-[#d9d4c9] bg-[#ffffff] overflow-hidden flex items-center justify-center">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt="Profile photo"
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="h-6 w-6 text-[#14110c]" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={onAvatarFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading || avatarRemoving}
                      className="rounded-full border-[#d9d4c9] text-[#14110c] hover:bg-[#e6e1d8]"
                    >
                      <Camera className="mr-2.5 h-4 w-4 text-[#b08d3e]" />
                      {avatarUploading ? "Uploading..." : "Upload photo"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onRemoveAvatar}
                      disabled={
                        avatarRemoving ||
                        avatarUploading ||
                        (!settings?.profile.avatar.storageKey && !avatarPreviewUrl)
                      }
                      className="rounded-full text-[#6b6b6b] hover:text-red-600 hover:bg-red-500/5 transition-colors"
                    >
                      <Trash2 className="mr-2.5 h-4 w-4" />
                      {avatarRemoving ? "Removing..." : "Remove photo"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-[#6b6b6b]">
                  Allowed: JPG, PNG, WEBP. Max file size: 5MB.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={handleChange("fullName")}
                      placeholder="Alex Founder"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      readOnly
                      className="bg-[#faf8f3]"
                    />
                    <p className="text-xs text-[#6b6b6b]">
                      Email is managed by your login provider.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About</Label>
                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={handleChange("bio")}
                    maxLength={300}
                    rows={3}
                    className={cn(
                      "flex w-full rounded-md border border-[#d9d4c9] bg-[#faf8f3] px-3 py-2 text-sm text-[#14110c] shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-500",
                    )}
                    placeholder="Tell us a bit about your business or role."
                  />
                  <p className="text-xs text-[#6b6b6b]">{form.bio.length}/300</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <p className="text-xs text-[#6b6b6b]">
                  Tell us about your business for better recommendations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business name</Label>
                    <Input
                      id="businessName"
                      value={form.businessName}
                      onChange={handleChange("businessName")}
                      placeholder="Talexia Studio"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      value={form.website}
                      onChange={handleChange("website")}
                      placeholder="https://yourstore.com"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={form.industry}
                      onChange={handleChange("industry")}
                      placeholder="e.g. Hospitality, Retail, Tech"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone <span className="text-rose-400">*</span></Label>
                    {/* ✅ Timezone select — critical for correct post scheduling */}
                    <select
                      id="timezone"
                      value={form.timezone}
                      onChange={(e) => setForm(prev => ({ ...prev, timezone: e.target.value }))}
                      className="flex w-full rounded-md border border-[#d9d4c9] bg-[#faf8f3] px-3 py-2 text-sm text-[#14110c] shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-300 focus:border-lime-500"
                    >
                      <optgroup label="Asia">
                        <option value="Asia/Dhaka">Asia/Dhaka (Bangladesh — UTC+6)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (India — UTC+5:30)</option>
                        <option value="Asia/Karachi">Asia/Karachi (Pakistan — UTC+5)</option>
                        <option value="Asia/Dubai">Asia/Dubai (UAE — UTC+4)</option>
                        <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (Japan — UTC+9)</option>
                        <option value="Asia/Shanghai">Asia/Shanghai (China — UTC+8)</option>
                      </optgroup>
                      <optgroup label="Americas">
                        <option value="America/New_York">America/New_York (ET — UTC-5/4)</option>
                        <option value="America/Chicago">America/Chicago (CT — UTC-6/5)</option>
                        <option value="America/Denver">America/Denver (MT — UTC-7/6)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PT — UTC-8/7)</option>
                        <option value="America/Toronto">America/Toronto (ET — UTC-5/4)</option>
                        <option value="America/Vancouver">America/Vancouver (PT — UTC-8/7)</option>
                        <option value="America/Sao_Paulo">America/Sao_Paulo (BRT — UTC-3)</option>
                      </optgroup>
                      <optgroup label="Europe">
                        <option value="Europe/London">Europe/London (GMT/BST — UTC+0/1)</option>
                        <option value="Europe/Paris">Europe/Paris (CET — UTC+1/2)</option>
                        <option value="Europe/Berlin">Europe/Berlin (CET — UTC+1/2)</option>
                        <option value="Europe/Istanbul">Europe/Istanbul (TRT — UTC+3)</option>
                      </optgroup>
                      <optgroup label="Pacific">
                        <option value="Australia/Sydney">Australia/Sydney (AEST — UTC+10/11)</option>
                        <option value="Pacific/Auckland">Pacific/Auckland (NZST — UTC+12/13)</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="Africa/Cairo">Africa/Cairo (EET — UTC+2)</option>
                        <option value="Africa/Lagos">Africa/Lagos (WAT — UTC+1)</option>
                      </optgroup>
                    </select>
                    <p className="text-xs text-amber-700/80">
                      ⚠️ This must be set correctly — all scheduled posts use this timezone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving || loading}
                className="rounded-full"
              >
                {saving ? "Saving..." : "Save settings"}
              </Button>
              {message ? <p className="text-xs text-[#14110c]">{message}</p> : null}
            </div>
          </form>
        </div>
      )}

      {activeTab === "brand-brief" && (
        <div className="space-y-6">
          {brandBriefQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className="h-8 w-8 text-[#b08d3e] animate-spin" />
              <p className="text-sm text-[#6b6b6b]">Fetching your brand brief...</p>
            </div>
          ) : !brief ? (
            <Card className="border-[#d9d4c9] bg-[#ffffff]">
              <CardContent className="py-12 text-center">
                <p className="text-[#6b6b6b]">No brand brief found. Please complete your onboarding first.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-[#14110c]">Submission Overview</h2>
                <Button
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-bold rounded-full"
                >
                  {isDownloading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {isDownloading ? "Generating..." : "Download PDF"}
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <DetailCard title="I. The basics" items={[
                  { label: "Brand Name", value: renderVal(brief.brandName || brief.restaurantName) },
                  { label: "Business Type", value: renderVal(brief.businessType) },
                  { label: "Primary Location", value: renderVal(brief.primaryLocation || brief.location) },
                  { label: "Website URL", value: renderVal(brief.websiteUrl) },
                  { label: "Industry Category", value: renderVal(brief.industryCategory || brief.cuisineType) },
                ]} />

                <DetailCard title="II. About your brand" items={[
                  { label: "Brand Story", value: renderVal(brief.brandStory || brief.foodDescription) },
                  { label: "Brand Voice", value: renderVal(brief.brandVoiceDescriptors || brief.toneAndVoice) },
                  { label: "Target Audience", value: renderVal(brief.targetAudience) },
                  { label: "Taglines", value: renderVal(brief.preferredPhrases) },
                  { label: "Admired Brands", value: renderVal(brief.customerReviews) },
                  { label: "What to Avoid", value: renderVal(brief.forbiddenPhrases) },
                ]} />

                <DetailCard title="III. Your aesthetic" items={[
                  { label: "Aesthetic Direction", value: renderVal(brief.aestheticDirection || brief.uniqueSellingPoint) },
                  { label: "Staging Preferences", value: renderVal(brief.physicalConstraints || brief.staging) },
                ]} />

                <DetailCard title="IV. Your product" items={[
                  { label: "Product Focus", value: renderVal(brief.productFocus || brief.signatureDishes) },
                  { label: "Signature Collections", value: renderVal(brief.signatureDishDetails) },
                  { label: "Materials & Certifications", value: renderVal(brief.materialsCertifications || brief.materials) },
                  { label: "Seasonal / Promotions", value: renderVal(brief.upcomingPromotions) },
                  { label: "Birthstone Theming", value: renderVal(brief.birthstoneTheming) },
                ]} />

                <DetailCard title="V. Captions & voice" items={[
                  { label: "Sample Captions", value: renderVal(brief.sampleCaptions || brief.captionSample1) },
                  { label: "Caption Targeting", value: renderVal(brief.captionTargeting) },
                  { label: "Language", value: renderVal(brief.language) },
                  { label: "Hashtag Style", value: renderVal(brief.hashtagStyle) },
                  { label: "Sensitive Topics", value: renderVal(brief.excludedItems) },
                ]} />

                <DetailCard title="VI. Publishing" items={[
                  { label: "Platforms", value: renderVal(brief.platforms) },
                  { label: "Timezone", value: renderVal(brief.timezone) },
                  { label: "Posting Days", value: renderVal(brief.preferredPostingDays || brief.actionShotsPossible) },
                  { label: "Posting Windows", value: renderVal(brief.preferredTimeWindows || brief.preferredShootTime) },
                  { label: "Posting Notes", value: renderVal(brief.specialNotes) },
                ]} />

                <DetailCard title="VII. Catalog & source" items={[
                  { label: "Drive Share Emails", value: renderVal(brief.googleDriveEmails) },
                ]} />

                <DetailCard title="VIII. Operational" items={[
                  { label: "Primary Contact Name", value: renderVal(brief.primaryContactName || brief.clientName) },
                  { label: "Primary Contact Email", value: renderVal(brief.primaryContactEmail) },
                  { label: "Preferred Communication", value: renderVal(brief.preferredCommunication) },
                ]} />

                <DetailCard title="IX. Authorization" items={[
                  { label: "Signed As", value: renderVal(brief.authSignedAs || brief.clientName) },
                  { label: "On Behalf Of", value: renderVal(brief.authOnBehalfOf || brief.restaurantNameAuth) },
                  { label: "Submission Date", value: renderVal(brief.authSubmissionDate || brief.submissionDate) },
                  { label: "Talexia Plan", value: renderVal(brief.authTalexiaPlan || brief.talexiaPlan) },
                  { label: "Terms Agreed", value: brief.authIHaveReadAndAgree ? "Yes" : "-" },
                ]} />

                <Card className="border-[#d9d4c9] bg-[#ffffff]">
                  <CardHeader className="pb-3 border-b border-[#d9d4c9]">
                    <CardTitle className="text-sm font-bold text-[#6b6b6b] uppercase tracking-widest flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#b08d3e]" />
                      06. Sample Captions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {[brief.captionSample1, brief.captionSample2, brief.captionSample3].map((cap, i) => (
                      <div key={i} className="p-3 rounded-lg bg-[#ffffff]/60 border border-[#d9d4c9]/50">
                        <p className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest mb-1">Sample {i + 1}</p>
                        <p className="text-sm text-[#14110c] italic">"{cap || "N/A"}"</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "full-management" && (
        <div className="space-y-6">
          {fullManagementQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className="h-8 w-8 text-[#b08d3e] animate-spin" />
              <p className="text-sm text-[#6b6b6b]">Fetching your full management details...</p>
            </div>
          ) : !fullManagementData ? (
            <Card className="border-[#d9d4c9] bg-[#ffffff]">
              <CardContent className="py-12 text-center">
                <p className="text-[#6b6b6b]">No full management details found. Please complete your onboarding first.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#14110c]">Full Management Overview</h2>
                <Button
                  onClick={handleDownloadFullManagementPdf}
                  disabled={isDownloading}
                  className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-bold rounded-full"
                >
                  {isDownloading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {isDownloading ? "Generating..." : "Download PDF"}
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <DetailCard title="01. Business Info" items={[
                  { label: "Business Name", value: fmBusinessName },
                  { label: "Industry", value: fullManagementData.industry },
                  { label: "Website URL", value: fullManagementData.websiteUrl },
                ]} />

                <DetailCard title="02. Strategy & Content" items={[
                  { label: "Target Audience", value: fullManagementData.targetAudience?.join(", ") },
                  { label: "Brand Personality", value: fullManagementData.brandPersonality?.join(", ") },
                  { label: "Sales Model", value: fullManagementData.salesModel?.join(", ") },
                  { label: "Visual Style", value: fullManagementData.visualStylePreference },
                  { label: "Outline Frame", value: fullManagementData.outlineFrame },
                ]} />

                <DetailCard title="03. Platform & Posting" items={[
                  { label: "Platforms to Manage", value: fullManagementData.platformsToManage?.join(", ") },
                  { label: "Posting Frequency", value: fullManagementData.postingFrequencyPreference },
                  { label: "Posting Time", value: fullManagementData.postingTimePreference?.join(", ") },
                  { label: "Posting Access Granted", value: fullManagementData.postingAccessGranted },
                  { label: "Allow CTAs", value: fullManagementData.allowCtas },
                  { label: "Image Usage Permission", value: fullManagementData.imageUsagePermission },
                ]} />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <p className="text-xs text-[#6b6b6b]">
                Manage how you sign in and protect your account.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-[#d9d4c9] bg-[#faf8f3] px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#14110c]">Password</p>
                    <p className="text-xs text-[#6b6b6b]">
                      Update your account password.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      setShowPwForm((v) => !v);
                      setPwError(null);
                      setPwMessage(null);
                      setPwForm({ current: "", next: "", confirm: "" });
                    }}
                  >
                    {showPwForm ? "Cancel" : "Change password"}
                  </Button>
                </div>

                {!showPwForm && pwMessage && (
                  <p className="text-xs text-[#b08d3e] pt-1">{pwMessage}</p>
                )}

                {showPwForm && (
                  <div className="space-y-3 pt-2 border-t border-[#d9d4c9]">
                    {pwError && <p className="text-xs text-red-600">{pwError}</p>}
                    {pwMessage && <p className="text-xs text-[#b08d3e]">{pwMessage}</p>}
                    <div className="space-y-2">
                      <Label htmlFor="currentPw">Current password</Label>
                      <div className="relative">
                        <Input
                          id="currentPw"
                          type={showCurrentPw ? "text" : "password"}
                          value={pwForm.current}
                          onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}
                          placeholder="Enter current password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#14110c]"
                        >
                          {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPw">New password</Label>
                      <div className="relative">
                        <Input
                          id="newPw"
                          type={showNextPw ? "text" : "password"}
                          value={pwForm.next}
                          onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}
                          placeholder="Minimum 8 characters"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNextPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#14110c]"
                        >
                          {showNextPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPw">Confirm new password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPw"
                          type={showConfirmPw ? "text" : "password"}
                          value={pwForm.confirm}
                          onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                          placeholder="Re-enter new password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] hover:text-[#14110c]"
                        >
                          {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="rounded-full"
                      disabled={pwSaving}
                      onClick={async () => {
                        setPwError(null);
                        setPwMessage(null);
                        if (!pwForm.current) { setPwError("Current password is required."); return; }
                        if (pwForm.next.length < 8) { setPwError("New password must be at least 8 characters."); return; }
                        if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
                        setPwSaving(true);
                        try {
                          const res = await fetch("/api/auth/change-password", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ "current-password": pwForm.current, "new-password": pwForm.next, "confirm-password": pwForm.confirm }),
                          });
                          const data = await res.json().catch(() => ({}));
                          if (!res.ok) throw new Error(data?.error || "Failed to change password.");
                          setPwMessage("Password changed successfully.");
                          setPwForm({ current: "", next: "", confirm: "" });
                          setShowPwForm(false);
                        } catch (err: unknown) {
                          setPwError(err instanceof Error ? err.message : "Unable to change password.");
                        } finally {
                          setPwSaving(false);
                        }
                      }}
                    >
                      {pwSaving ? "Saving..." : "Update password"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  );
}

function DetailCard({ title, items }: { title: string, items: { label: string, value: any }[] }) {
  return (
    <Card className="border-[#d9d4c9] bg-[#ffffff]">
      <CardHeader className="pb-3 border-b border-[#d9d4c9]">
        <CardTitle className="text-sm font-bold text-[#6b6b6b] uppercase tracking-widest flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#b08d3e]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest">{item.label}</p>
            <p className="text-sm text-[#14110c] mt-0.5">{item.value || "—"}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return Boolean(url.protocol && url.host);
  } catch {
    return false;
  }
}
