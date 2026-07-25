"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, Edit } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  readOnly?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your caption in Markdown...",
  className,
  rows = 6,
  readOnly = false,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const renderPreview = (text: string) => {
    if (!text.trim()) {
      return <div className="text-[#6b6b6b] italic">{placeholder}</div>;
    }

    // Simple markdown rendering without external dependencies
    const html = text
      // Headers
      .replace(
        /^### (.*$)/gim,
        "<h3 class='text-lg font-semibold text-[#14110c] mt-2 mb-1'>$1</h3>"
      )
      .replace(
        /^## (.*$)/gim,
        "<h2 class='text-xl font-semibold text-[#14110c] mt-3 mb-2'>$1</h2>"
      )
      .replace(
        /^# (.*$)/gim,
        "<h1 class='text-2xl font-bold text-[#14110c] mt-4 mb-2'>$1</h1>"
      )
      // Bold
      .replace(
        /\*\*(.*?)\*\*/gim,
        "<strong class='font-semibold text-[#14110c]'>$1</strong>"
      )
      .replace(
        /__(.*?)__/gim,
        "<strong class='font-semibold text-[#14110c]'>$1</strong>"
      )
      // Italic
      .replace(/\*(.*?)\*/gim, "<em class='italic text-[#6b6b6b]'>$1</em>")
      .replace(/_(.*?)_/gim, "<em class='italic text-[#6b6b6b]'>$1</em>")
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/gim,
        "<a href='$2' class='text-[#b08d3e] hover:text-[#8a6d28] underline' target='_blank' rel='noopener noreferrer'>$1</a>"
      )
      // Line breaks
      .replace(/\n/gim, "<br />");

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-end">
        <div className="flex gap-1 border border-[#d9d4c9] rounded-md overflow-hidden bg-[#faf8f3]">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={cn(
              "px-2 py-1 text-xs flex items-center gap-1 transition-colors",
              mode === "edit"
                ? "bg-white text-[#14110c] shadow-sm border border-[#d9d4c9]"
                : "text-[#6b6b6b] hover:text-[#14110c]"
            )}
          >
            <Edit className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={cn(
              "px-2 py-1 text-xs flex items-center gap-1 transition-colors",
              mode === "preview"
                ? "bg-white text-[#14110c] shadow-sm border border-[#d9d4c9]"
                : "text-[#6b6b6b] hover:text-[#14110c]"
            )}
          >
            <Eye className="h-3 w-3" />
            Preview
          </button>
        </div>
      </div>
      {mode === "edit" ? (
        <textarea
          className="w-full rounded-lg border border-[#d9d4c9] bg-white p-2 text-sm text-[#14110c] focus:border-[#b08d3e] focus:outline-none focus:ring-2 focus:ring-[#b08d3e] font-mono"
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      ) : (
        <div className="w-full rounded-lg border border-[#d9d4c9] bg-[#faf8f3] p-3 text-sm text-[#14110c] min-h-[120px] prose prose-sm max-w-none">
          {renderPreview(value)}
        </div>
      )}
      {/* <div className="text-xs text-slate-500">
        Supports Markdown: **bold**, *italic*, [links](url), # headers
      </div> */}
    </div>
  );
}
