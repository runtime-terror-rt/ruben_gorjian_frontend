"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400 [&>option]:bg-slate-900 [&>option]:text-white",
        className
      )}
      {...props}
    />
  );
});
Select.displayName = "Select";
