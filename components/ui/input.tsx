"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#d9d4c9] bg-[#faf8f3] px-3 py-2 text-sm text-[#14110c] shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#b08d3e] focus:border-[#b08d3e]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
