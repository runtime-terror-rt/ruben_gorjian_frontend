import { apiDelete, apiGet, apiPatch } from "@/lib/api";

export type UpdateUserSettingsInput = {
  fullName: string;
  businessName: string;
  bio: string;
  industry: string;
  website: string;
  timezone: string;
  avatar?: {
    storageKey?: string | null;
    contentType?: string | null;
    remove?: boolean;
  };
};

export type UserSettingsResponse = {
  profile: {
    fullName: string;
    email: string;
    bio: string;
    avatar: {
      storageKey: string | null;
      contentType: string | null;
      url: string | null;
      version: number | null;
    };
  };
  business: {
    name: string;
    website: string | null;
    industry: string | null;
    timezone: string | null;
  };
};

export async function getUserSettings(): Promise<UserSettingsResponse> {
  return apiGet<UserSettingsResponse>("/api/user/settings");
}

export async function updateUserSettings(input: UpdateUserSettingsInput & { avatarFile?: File | null }): Promise<UserSettingsResponse> {
  if (input.avatarFile) {
    const formData = new FormData();
    formData.append("profile", JSON.stringify({
      fullName: input.fullName,
      bio: input.bio || null,
    }));
    formData.append("business", JSON.stringify({
      name: input.businessName,
      website: input.website || null,
      industry: input.industry || null,
      timezone: input.timezone || null,
    }));
    formData.append("avatar", input.avatarFile);

    const response = await fetch("/api/user/settings", {
      method: "PATCH",
      body: formData,
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update settings");
    }
    
    return response.json();
  }

  return apiPatch<UserSettingsResponse>("/api/user/settings", {
    profile: {
      fullName: input.fullName,
      bio: input.bio || null,
      avatar: input.avatar,
    },
    business: {
      name: input.businessName,
      website: input.website || null,
      industry: input.industry || null,
      timezone: input.timezone || null,
    },
  });
}

export async function removeUserAvatar(): Promise<UserSettingsResponse> {
  return apiDelete<UserSettingsResponse>("/api/user/settings");
}
