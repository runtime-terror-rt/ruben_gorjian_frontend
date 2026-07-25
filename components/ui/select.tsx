"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-[#d9d4c9] bg-[#ffffff] px-3 py-2 text-sm text-[#14110c] shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#b08d3e] focus:border-[#b08d3e] [&>option]:bg-[#ffffff] [&>option]:text-[#14110c]",
        className
      )}
      {...props}
    />
  );
});
Select.displayName = "Select";
