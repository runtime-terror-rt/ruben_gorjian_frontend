"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  User,
  Lock,
  Camera,
  Trash2,
  ShieldCheck,
  Settings as SettingsIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSessionContext } from "@/context/SessionContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { cn } from "@/lib/utils";

// --- Types ---

interface ProfileData {
  fullName: string;
  email: string;
  bio: string | null;
  avatar: {
    url: string | null;
    version: number | null;
    storageKey: string | null;
    contentType: string | null;
  };
}

interface UserSettingsResponse {
  profile: ProfileData;
  business: {
    name: string | null;
    website: string | null;
    industry: string | null;
    timezone: string | null;
  };
}

// System settings types (from existing file)
type RoutingMode = "FORCE_NATIVE" | "FORCE_UPLOAD_POST";
type ApplyScope = "USERS_ONLY" | "ALL_USERS";
type GlobalRoutingSummary = {
  scope: ApplyScope;
  globalDefault: {
    mode: RoutingMode;
    useInstagram: boolean;
    useFacebook: boolean;
    useTiktok: boolean;
  };
  totalUsers: number;
  modeCounts: { [key in RoutingMode]: number };
};

// --- Main Component ---

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { updateSession } = useSessionContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- State for Profile ---
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    bio: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- State for Password Change ---
  const [passwordForm, setPasswordForm] = useState({
    "current-password": "",
    "new-password": "",
    "confirm-password": "",
  });

  // --- State for System Settings (Legacy) ---
  const [draftGlobalDefault, setDraftGlobalDefault] = useState<
    GlobalRoutingSummary["globalDefault"] | null
  >(null);
  const [userChosenScope, setUserChosenScope] = useState<ApplyScope | null>(
    null,
  );

  // --- Queries ---
  const settingsQuery = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => apiGet<UserSettingsResponse>("/api/user/settings"),
  });

  const globalRoutingQuery = useQuery({
    queryKey: ["admin-global-publishing-routing"],
    queryFn: () =>
      apiGet<GlobalRoutingSummary>("/api/admin/publishing-routing/global"),
  });

  // --- Sync Profile Form ---
  useEffect(() => {
    if (settingsQuery.data) {
      setProfileForm({
        fullName: settingsQuery.data.profile.fullName || "",
        bio: settingsQuery.data.profile.bio || "",
      });
    }
  }, [settingsQuery.data]);

  // --- Mutations ---
  const updateProfileMutation = useMutation({
    mutationFn: (payload: any) =>
      apiPatch<UserSettingsResponse>("/api/user/settings", payload),
    onSuccess: (data) => {
      toast.success("Profile updated", {
        description: "Your administrative profile has been saved.",
        position: "top-right",
      });
      queryClient.setQueryData(["user-settings"], data);
      updateSession(data as any);
      setAvatarPreview(null);
    },
    onError: (err: Error) => {
      toast.error("Update failed", {
        description: err.message,
        position: "top-right",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: any) =>
      apiPost<{ success: boolean; message: string }>(
        "/api/auth/change-password",
        payload,
      ),
    onSuccess: (data) => {
      toast.success("Password secured", {
        description:
          data.message || "Your password has been updated successfully.",
        position: "top-right",
      });
      setPasswordForm({
        "current-password": "",
        "new-password": "",
        "confirm-password": "",
      });
    },
    onError: (err: Error) => {
      toast.error("Security update failed", {
        description: err.message,
        position: "top-right",
      });
    },
  });

  const applyGlobalMutation = useMutation({
    mutationFn: (payload: any) =>
      apiPut<any>("/api/admin/publishing-routing/global", payload),
    onSuccess: (data) => {
      toast.success("Settings synchronized", {
        description: `Applied system configuration to ${data.targetUsersCount} users.`,
        position: "top-right",
      });
      setDraftGlobalDefault(null);
      setUserChosenScope(null);
      queryClient.invalidateQueries({
        queryKey: ["admin-global-publishing-routing"],
      });
    },
    onError: (err: Error) => {
      toast.error("System update failed", {
        description: err.message,
        position: "top-right",
      });
    },
  });

  // --- Handlers ---
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFile) {
      const formData = new FormData();
      formData.append("profile", JSON.stringify({
        fullName: profileForm.fullName,
        bio: profileForm.bio || null,
      }));
      // Admins don't have business info as per user request
      formData.append("avatar", selectedFile);

      try {
        const response = await fetch("/api/user/settings", {
          method: "PATCH",
          body: formData,
        });
        
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Failed to update admin profile");
        }
        
        const data = await response.json();
        toast.success("Profile updated", {
          description: "Your administrative profile has been saved.",
          position: "top-right",
        });
        queryClient.setQueryData(["user-settings"], data);
        updateSession(data as any);
        setAvatarPreview(null);
        setSelectedFile(null);
      } catch (err: any) {
        toast.error("Update failed", {
          description: err.message,
          position: "top-right",
        });
      }
      return;
    }

    updateProfileMutation.mutate({
      profile: {
        fullName: profileForm.fullName,
        bio: profileForm.bio || null,
      },
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm["new-password"] !== passwordForm["confirm-password"]) {
      toast.error("Passwords mismatch", {
        description: "The new password and confirmation do not match.",
        position: "top-right",
      });
      return;
    }
    // changePasswordMutation.mutate({
    //   currentPassword: passwordForm["current-password"],
    //   newPassword: passwordForm["new-password"]
    // });
    changePasswordMutation.mutate({
      "current-password": passwordForm["current-password"],
      "new-password": passwordForm["new-password"],
      "confirm-password": passwordForm["confirm-password"],
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File oversized", {
        description: "The selected image exceeds the 5MB limit.",
        position: "top-right",
      });
      return;
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onRemoveAvatar = () => {
    updateProfileMutation.mutate({
      profile: {
        ...profileForm,
        avatar: { remove: true },
      },
    });
  };

  // --- Layout Helper ---
  const avatarUrl =
    avatarPreview ||
    (settingsQuery.data?.profile.avatar.url
      ? `${settingsQuery.data.profile.avatar.url}${settingsQuery.data.profile.avatar.version ? `?v=${settingsQuery.data.profile.avatar.version}` : ""}`
      : null);

  const serverScope = globalRoutingQuery.data?.scope ?? "USERS_ONLY";
  const effectiveApplyTo = userChosenScope ?? serverScope;
  const effectiveGlobalDefault = draftGlobalDefault ??
    globalRoutingQuery.data?.globalDefault ?? {
      mode: "FORCE_NATIVE" as RoutingMode,
      useInstagram: true,
      useFacebook: true,
      useTiktok: true,
    };

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-[#14110c]">Settings</h1>
        <p className="text-sm text-[#6b6b6b]">Manage your administrative profile and system-wide configurations.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-[#ffffff] border border-[#d9d4c9] p-1 h-12 rounded-2xl">
          <TabsTrigger
            value="profile"
            className="rounded-xl px-8 data-[state=active]:bg-[#b08d3e] data-[state=active]:text-[#14110c] font-bold transition-all"
          >
            <User className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-xl px-8 data-[state=active]:bg-[#b08d3e] data-[state=active]:text-[#14110c] font-bold transition-all"
          >
            <Lock className="h-4 w-4 mr-2" /> Security
          </TabsTrigger>
          {/* <TabsTrigger
            value="system"
            className="rounded-xl px-8 data-[state=active]:bg-[#b08d3e] data-[state=active]:text-[#14110c] font-bold transition-all"
          >
            <SettingsIcon className="h-4 w-4 mr-2" /> System
          </TabsTrigger> */}
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-[#ffffff] border-[#d9d4c9] backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-[#14110c]">Admin Profile</CardTitle>
              <CardDescription className="text-[#6b6b6b]">
                Your public identity within the management dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full border-2 border-[#d9d4c9] bg-[#faf8f3] flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-[#b08d3e]/50">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="h-10 w-10 text-[#14110c]" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#b08d3e] text-[#14110c] flex items-center justify-center shadow-lg hover:bg-[#e6e1d8] transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#14110c] tracking-wide uppercase">
                    Profile Photo
                  </h4>
                  <p className="text-xs text-[#6b6b6b] max-w-[200px]">
                    Allowed JPG, PNG or WEBP. Max size of 5MB.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRemoveAvatar}
                      className="text-red-600 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3 mr-2" /> Remove Photo
                    </Button>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleProfileSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-[#6b6b6b] pl-1">
                    Full Name
                  </Label>
                  <Input
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        fullName: e.target.value,
                      })
                    }
                    className="bg-[#faf8f3] border-[#d9d4c9] rounded-xl h-11 focus:ring-[#b08d3e]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-[#6b6b6b] pl-1">
                    Email Address
                  </Label>
                  <Input
                    value={settingsQuery.data?.profile.email || ""}
                    disabled
                    className="bg-[#faf8f3] border-[#d9d4c9] rounded-xl h-11 text-[#6b6b6b] cursor-not-allowed italic"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-[#6b6b6b] pl-1">
                    Bio / About Me
                  </Label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full bg-[#faf8f3] border border-[#d9d4c9] rounded-xl p-3 text-sm text-[#14110c] focus:outline-none focus:ring-2 focus:ring-[#b08d3e] transition-all"
                    placeholder="Brief description about your role or background..."
                  />
                </div>
                <div>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="bg-[#b08d3e] hover:bg-[#e6e1d8] text-[#14110c] font-black px-10 h-11 rounded-xl transition-all shadow-[0_10px_20px_rgba(163,230,53,0.2)]"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-[#ffffff] border-[#d9d4c9] backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-[#14110c]">Security & Password</CardTitle>
              <CardDescription className="text-[#6b6b6b]">
                Update your password to keep your administrative account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-[#6b6b6b] pl-1">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm["current-password"]}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          "current-password": e.target.value,
                        })
                      }
                      className="bg-[#faf8f3] border-[#d9d4c9] rounded-xl h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      className="absolute right-3 top-3 text-[#6b6b6b] hover:text-[#14110c]"
                    >
                      {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-[#6b6b6b] pl-1">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword.new ? "text" : "password"}
                        value={passwordForm["new-password"]}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            "new-password": e.target.value,
                          })
                        }
                        className="bg-[#faf8f3] border-[#d9d4c9] rounded-xl h-11 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                        className="absolute right-3 top-3 text-[#6b6b6b] hover:text-[#14110c]"
                      >
                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-[#6b6b6b] pl-1">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordForm["confirm-password"]}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            "confirm-password": e.target.value,
                          })
                        }
                        className="bg-[#faf8f3] border-[#d9d4c9] rounded-xl h-11 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                        className="absolute right-3 top-3 text-[#6b6b6b] hover:text-[#14110c]"
                      >
                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-4 bg-[#b08d3e]/5 p-4 rounded-2xl border border-[#b08d3e]/10">
                  <AlertCircle className="h-5 w-5 text-[#b08d3e] flex-shrink-0" />
                  <p className="text-[10px] text-[#6b6b6b] leading-relaxed font-medium">
                    Changing your password will immediately terminate any other
                    active sessions. You will need to log back in on other
                    devices.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="ghost"
                    disabled={changePasswordMutation.isPending}
                    className="bg-[#e6e1d8] hover:bg-[#d9d4c9] text-[#14110c] hover:text-[#14110c] font-black px-10 h-11 rounded-xl transition-all"
                  >
                    {changePasswordMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYSTEM TAB (LEGACY) */}
        <TabsContent value="system" className="space-y-6">
          <Card className="bg-[#ffffff] border-[#d9d4c9] backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="text-[#14110c] flex items-center gap-2">
                System Global Routing
              </CardTitle>
              <CardDescription className="text-[#6b6b6b]">
                Configure core system behavior and posting channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-[#e6e1d8] border-[#d9d4c9] text-[#14110c]"
                >
                  Total Users: {globalRoutingQuery.data?.totalUsers ?? "—"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-[#b08d3e]/10 border-[#b08d3e]/20 text-[#b08d3e]"
                >
                  Native Count:{" "}
                  {globalRoutingQuery.data?.modeCounts?.FORCE_NATIVE ?? "—"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-600/10 border-blue-500/20 text-[#14110c]"
                >
                  Upload-Post:{" "}
                  {globalRoutingQuery.data?.modeCounts?.FORCE_UPLOAD_POST ??
                    "—"}
                </Badge>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-[#6b6b6b] pl-1">
                    Default Posting Channel
                  </Label>
                  <Select
                    value={effectiveGlobalDefault.mode}
                    onChange={(e) =>
                      setDraftGlobalDefault({
                        ...effectiveGlobalDefault,
                        mode: e.target.value as RoutingMode,
                      })
                    }
                    className="bg-[#faf8f3] border-[#d9d4c9] rounded-xl h-11"
                  >
                    <option value="FORCE_NATIVE">Force Native (Default)</option>
                    <option value="FORCE_UPLOAD_POST">Force Upload-Post</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-[#6b6b6b] pl-1">
                    Apply To Scope
                  </Label>
                  <Select
                    value={effectiveApplyTo}
                    onChange={(e) =>
                      setUserChosenScope(e.target.value as ApplyScope)
                    }
                    className="bg-[#faf8f3] border-[#d9d4c9] rounded-xl h-11"
                  >
                    <option value="USERS_ONLY">General Users Only</option>
                    <option value="ALL_USERS">
                      All Accounts (incl. Admins)
                    </option>
                  </Select>
                </div>
              </div>

              {effectiveGlobalDefault.mode === "FORCE_UPLOAD_POST" && (
                <div className="rounded-2xl border border-[#d9d4c9] bg-[#faf8f3] p-6 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6b6b]">
                    Platform Toggles (Upload-Post Only)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      {
                        id: "useInstagram",
                        label: "Instagram",
                        field: "useInstagram",
                      },
                      {
                        id: "useFacebook",
                        label: "Facebook",
                        field: "useFacebook",
                      },
                      {
                        id: "useTiktok",
                        label: "TikTok",
                        field: "useTiktok",
                      },
                    ].map((p) => (
                      <label
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#d9d4c9] bg-[#ffffff] group cursor-pointer hover:border-[#b08d3e]/50 transition-all"
                      >
                        <span className="text-sm font-bold text-[#14110c] group-hover:text-[#14110c]">
                          {p.label}
                        </span>
                        <Checkbox
                          checked={(effectiveGlobalDefault as any)[p.field]}
                          onCheckedChange={(val) =>
                            setDraftGlobalDefault({
                              ...effectiveGlobalDefault,
                              [p.field]: !!val,
                            })
                          }
                          className="border-[#d9d4c9] data-[state=checked]:bg-[#b08d3e] data-[state=checked]:border-[#b08d3e]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={() =>
                    applyGlobalMutation.mutate({
                      mode: effectiveGlobalDefault.mode,
                      applyTo: effectiveApplyTo,
                      useInstagram: effectiveGlobalDefault.useInstagram,
                      useFacebook: effectiveGlobalDefault.useFacebook,
                      useTiktok: effectiveGlobalDefault.useTiktok,
                    })
                  }
                  disabled={applyGlobalMutation.isPending}
                  className="bg-[#faf8f3] hover:bg-[#ffffff] text-[#14110c] font-black px-10 h-11 rounded-xl transition-all"
                >
                  {applyGlobalMutation.isPending
                    ? "Applying..."
                    : `Apply Globally to ${effectiveApplyTo === "ALL_USERS" ? "Everyone" : "Users"}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
