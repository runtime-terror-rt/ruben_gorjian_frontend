/**
 * SINGLE SOURCE OF TRUTH — Pricing Catalog for TaleNovaaa
 *
 * This file contains all plan definitions with:
 * - User-facing display data (name, price, features, CTAs)
 * - Internal lookup keys for backend mapping
 * - No internal codes/IDs are ever shown in the UI
 */

export type MasterPlanType = "regular" | "jewelry";
export type PlanCategory = "calendar" | "visual" | "full";

/** Single feature with optional tooltip for UI */
export interface PlanFeature {
  label: string;
  tooltip?: string;
}

export interface PlanDefinition {
  // User-facing fields (SHOWN IN UI)
  name: string;
  priceLabel: string;
  priceStandard: number;
  priceFounder: number;
  /** Features with optional tooltips (tooltip passed to UI tooltip component) */
  features: PlanFeature[];
  ctaLabel: string;
  isFeatured: boolean;
  positioningTag?: string;
  trialDays: number;

  // Internal fields (NEVER SHOWN IN UI)
  lookupKey: string;
  requiresPayment: boolean;

  // Additional metadata
  additionalInfo?: string;
}

export interface PlanCategoryDefinition {
  master: MasterPlanType;
  category: PlanCategory;
  plans: PlanDefinition[];
}

// ============================================================================
// REGULAR BUSINESS PLANS
// ============================================================================

const regularFullPlans: PlanDefinition[] = [
  {
    name: "Essentials",
    priceLabel: "$397/mo",
    priceStandard: 397,
    priceFounder: 397,
    features: [
      { label: "12 luxury-enhanced visuals produced monthly" },
      { label: "Produced from your existing website or catalog photography" },
      { label: "Professional captions written in your brand voice" },
      { label: "Hashtag research per fine jewelry conventions" },
      { label: "Publishing to 2 platforms (choose: Instagram, Facebook, or LinkedIn)" },
      { label: "Monthly content calendar" },
      { label: "48-hour factual error correction window" },
      { label: "Brand Brief authorization model — no per-post approvals required" },
    ],
    ctaLabel: "Subscribe to Essentials",
    isFeatured: false,
    trialDays: 0,
    lookupKey: "ESSENTIALS",
    requiresPayment: true,
  },
  {
    name: "Signature",
    priceLabel: "$597/mo",
    priceStandard: 597,
    priceFounder: 597,
    features: [
      { label: "24 luxury-enhanced visuals produced monthly" },
      { label: "Full image preparation — send us anything, even phone photos" },
      { label: "Professional captions & hashtag research" },
      { label: "Publishing to 3 platforms (Instagram, Facebook, LinkedIn)" },
      { label: "Monthly content plan preview" },
      { label: "Seasonal editorial planning (engagement season, holidays)" },
      { label: "Micro-animation on select visuals" },
      { label: "48-hour factual error correction window" },
      { label: "Brand Brief authorization model — no per-post approvals required" },
    ],
    ctaLabel: "Subscribe to Signature",
    isFeatured: true,
    positioningTag: "Most popular",
    trialDays: 0,
    lookupKey: "SIGNATURE",
    requiresPayment: true,
  },
];

// Reuse regular plans for jewelry until jewelry-specific plans are defined
const jewelryFullPlans = regularFullPlans;

// ============================================================================
// PRICING CATALOG (Single Source of Truth)
// Calendar Only and Visual Calendar plans removed; only Full Management offered.
// ============================================================================

export const pricingCatalog: PlanCategoryDefinition[] = [
  { master: "regular", category: "full", plans: regularFullPlans },
  { master: "jewelry", category: "full", plans: jewelryFullPlans },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPlansForCategory(
  master: MasterPlanType,
  category: PlanCategory
): PlanDefinition[] {
  const catalog = pricingCatalog.find(
    (c) => c.master === master && c.category === category
  );
  return catalog?.plans || [];
}

export function getPlanByLookupKey(lookupKey: string): PlanDefinition | null {
  for (const catalog of pricingCatalog) {
    const plan = catalog.plans.find((p) => p.lookupKey === lookupKey);
    if (plan) return plan;
  }
  return null;
}

export function getCategoryDisplayName(category: PlanCategory): string {
  const map: Record<PlanCategory, string> = {
    calendar: "Calendar Only",
    visual: "Visual Calendar",
    full: "Full Management",
  };
  return map[category] ?? "Full Management";
}

/** Plan codes that represent the top tier (no "Upgrade" CTA shown). */
export const HIGHEST_PLAN_LOOKUP_KEYS: string[] = ["FM-70"];

export function isOnHighestPlan(planCode: string | undefined | null): boolean {
  if (!planCode) return false;
  return HIGHEST_PLAN_LOOKUP_KEYS.includes(planCode);
}
