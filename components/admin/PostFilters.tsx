"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Users, X, Filter, Mail, Search } from "lucide-react";
import ClientSelectionModal from "./ClientSelectionModal";

export interface FilterState {
  sessionStatus: string;
  status: string;
  platform: string;
  userId: string;
  userEmail: string;
}

interface PostFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  type?: "posts" | "sessions";
}

const PLATFORMS = [
  { label: "All Platforms", value: "all" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "TikTok", value: "tiktok" },
  { label: "LinkedIn", value: "linkedin" },
];

const POST_STATUSES = [
  { label: "All Posting Status", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Publishing", value: "publishing" },
  { label: "Posted", value: "posted" },
  { label: "Failed", value: "failed" },
];

const SESSION_STATUSES = [
  { label: "All Session Status", value: "all" },
  { label: "Booked", value: "booked" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "canceled" },
];

export default function PostFilters({ onFilterChange, initialFilters, type = "posts" }: PostFiltersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [localUserEmail, setLocalUserEmail] = useState(initialFilters?.userEmail || "");
  
  const filters = initialFilters || {
    sessionStatus: "all",
    status: "all",
    platform: "all",
    userId: "",
    userEmail: "",
  };

  useEffect(() => {
    setLocalUserEmail(filters.userEmail);
  }, [filters.userEmail]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localUserEmail !== filters.userEmail) {
        onFilterChange({
          ...filters,
          userEmail: localUserEmail,
          // If user clears the email manually, we MUST clear the userId from the modal too
          userId: localUserEmail === "" ? "" : filters.userId,
        });
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [localUserEmail, onFilterChange, filters]);

  const updateDropdown = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setLocalUserEmail("");
    onFilterChange({
      sessionStatus: "all",
      status: "all",
      platform: "all",
      userId: "",
      userEmail: "",
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#ffffff] border border-[#d9d4c9] rounded-xl backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#6b6b6b] text-sm font-semibold uppercase tracking-wider">
          <Filter className="h-4 w-4 text-[#b08d3e]" />
          Filter Management
        </div>
        {(filters.platform !== "all" ||
          filters.sessionStatus !== "all" ||
          filters.status !== "all" ||
          localUserEmail ||
          filters.userId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 text-[#6b6b6b] hover:text-rose-400 hover:bg-rose-400/10 gap-2 text-xs font-bold"
            >
              <X className="h-3.5 w-3.5" />
              Reset All
            </Button>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* User Search (Email + Modal Trigger) */}
        <div className="md:col-span-5 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-[#b08d3e] transition-colors" />
          </div>
          <Input
            placeholder="Search by user email..."
            value={localUserEmail}
            onChange={(e) => setLocalUserEmail(e.target.value)}
            className="pl-10 pr-12 bg-[#faf8f3] border-[#d9d4c9] focus:ring-lime-500/20 focus:border-lime-500/50 h-11 text-sm transition-all"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsModalOpen(true)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-500 hover:text-[#b08d3e] hover:bg-[#b08d3e]/10"
            title="Browse Clients"
          >
            <Users className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Platform Dropdown - Only show for Posts */}
        {type === "posts" && (
          <div className="md:col-span-3">
            <Select
              value={filters.platform}
              onChange={(e) => updateDropdown("platform", e.target.value)}
              className="bg-[#faf8f3] border-[#d9d4c9] h-11 text-[#14110c] text-sm font-medium focus:ring-lime-500/20"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Status Dropdown */}
        <div className={type === "posts" ? "md:col-span-4" : "md:col-span-7"}>
          {type === "posts" ? (
            <Select
              value={filters.status}
              onChange={(e) => updateDropdown("status", e.target.value)}
              className="bg-[#faf8f3] border-[#d9d4c9] h-11 text-[#14110c] text-sm font-medium focus:ring-lime-500/20"
            >
              {POST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          ) : (
            <Select
              value={filters.sessionStatus}
              onChange={(e) => updateDropdown("sessionStatus", e.target.value)}
              className="bg-[#faf8f3] border-[#d9d4c9] h-11 text-[#14110c] text-sm font-medium focus:ring-lime-500/20"
            >
              {SESSION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      <ClientSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(client) => {
          setLocalUserEmail(client.email);
          onFilterChange({
            ...filters,
            userId: client.id,
            userEmail: client.email,
          });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
