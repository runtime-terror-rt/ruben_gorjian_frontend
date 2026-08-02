"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-semibold text-[#14110c] leading-none peer-disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}
