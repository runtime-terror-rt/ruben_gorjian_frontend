import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] max-h-[300px] w-full rounded-md border border-[#d9d4c9] bg-[#ffffff] px-3 py-2 text-sm text-[#14110c] placeholder:text-[#6b6b6b] focus:outline-none focus:ring-2 focus:ring-[#b08d3e] focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto",
          className
        )}
        ref={ref}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
