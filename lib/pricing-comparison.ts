/**
 * Pricing comparison: 3 Full Management plans, feature matrix.
 * Single source of truth for the comparison table UI.
 * Calendar Only and Visual Calendar plans removed.
 */

export const PLAN_KEYS = ["ESSENTIALS", "SIGNATURE"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export const PLAN_NAMES: Record<PlanKey, string> = {
  "ESSENTIALS": "Essentials",
  "SIGNATURE": "Signature",
};

export const MONTHLY_PRICES: Record<PlanKey, number> = {
  "ESSENTIALS": 397,
  "SIGNATURE": 597,
};

/** Cell value: "yes" = ✓, "no" = ✗, "client" = Client (blue), "admin" = ◇ Talexia, or custom text */
export type CellValue = "yes" | "no" | "client" | "admin" | string;

export interface ComparisonRow {
  category: string;
  values: Record<PlanKey, CellValue>;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    category: "Plan Type",
    values: {
      "ESSENTIALS": "Essentials",
      "SIGNATURE": "Signature",
    },
  },
  {
    category: "Monthly Price",
    values: {
      "ESSENTIALS": "$397",
      "SIGNATURE": "$597",
    },
  },
  {
    category: "Description",
    values: {
      "ESSENTIALS": "Twelve editorial-grade visuals produced monthly, published to two connected platforms.",
      "SIGNATURE": "Twenty-four editorial visuals monthly, published across all three platforms.",
    },
  },
  {
    category: "Monthly feed posts",
    values: {
      "ESSENTIALS": "12",
      "SIGNATURE": "24",
    },
  },
  {
    category: "Platforms covered",
    values: {
      "ESSENTIALS": "2 of 3",
      "SIGNATURE": "3 of 3",
    },
  },
  {
    category: "Professional captions & hashtags",
    values: { "ESSENTIALS": "yes", "SIGNATURE": "yes" },
  },
  {
    category: "Monthly content calendar",
    values: { "ESSENTIALS": "yes", "SIGNATURE": "yes" },
  },
  {
    category: "Monthly content plan preview",
    values: { "ESSENTIALS": "no", "SIGNATURE": "yes" },
  },
  {
    category: "Seasonal editorial planning",
    values: { "ESSENTIALS": "no", "SIGNATURE": "yes" },
  },
  {
    category: "Micro-animation on select visuals",
    values: { "ESSENTIALS": "no", "SIGNATURE": "yes" },
  },
  {
    category: "Image preparation (phone photos)",
    values: { "ESSENTIALS": "no", "SIGNATURE": "yes" },
  },
  {
    category: "One-time onboarding fee",
    values: {
      "ESSENTIALS": "None",
      "SIGNATURE": "$97",
    },
  },
];

export const COMPARISON_FOOTER = "All Plans include Talexia Creative Direction";
