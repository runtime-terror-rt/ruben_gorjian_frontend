import { NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";
import { buildBrandBriefPdf, BrandBriefPdfInput } from "@/lib/brand-brief-pdf";

export async function GET() {
  try {
    const res = await fetch(`${getBackendUrl()}/api/brand-brief/me`, {
      headers: await getBackendHeaders(),
      credentials: "include",
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch brand brief details" }, { status: res.status });
    }

    const json = await res.json();
    const data = json.items?.[0];

    if (!data) {
      return NextResponse.json({ error: "No brand brief found for your account" }, { status: 404 });
    }

    const pdfInput: BrandBriefPdfInput = {
      id: data.id || data._id || "-",
      planCode: data.proposal?.planCode || data.planCode || "-",
      planName: data.proposal?.planName || data.planName || "Active Plan",
      submittedByName: data.clientName || data.authSignedAs || "User",
      submittedByEmail: data.proposal?.email || "-",
      createdAt: data.createdAt || new Date().toISOString(),

      brandName: data.brandName || data.restaurantName || "-",
      businessType: data.businessType || "-",
      primaryLocation: data.primaryLocation || data.location || "-",
      websiteUrl: data.websiteUrl || "-",
      industryCategory: data.industryCategory || data.cuisineType || "-",

      brandStory: data.brandStory || data.foodDescription || "-",
      brandVoiceDescriptors: Array.isArray(data.brandVoiceDescriptors) ? data.brandVoiceDescriptors : (Array.isArray(data.toneAndVoice) ? data.toneAndVoice : []),
      targetAudience: data.targetAudience || "-",
      preferredPhrases: data.preferredPhrases || "-",
      customerReviews: data.customerReviews || "-",
      forbiddenPhrases: data.forbiddenPhrases || "-",

      aestheticDirection: data.aestheticDirection ? (Array.isArray(data.aestheticDirection) ? data.aestheticDirection.join(", ") : data.aestheticDirection) : (data.uniqueSellingPoint || "-"),
      physicalConstraints: data.physicalConstraints || data.staging || "-",

      productFocus: data.productFocus ? (Array.isArray(data.productFocus) ? data.productFocus.join(", ") : data.productFocus) : (Array.isArray(data.signatureDishes) ? data.signatureDishes.join(", ") : "-"),
      signatureDishDetails: data.signatureDishDetails || "-",
      materialsCertifications: data.materialsCertifications || data.materials || "-",
      upcomingPromotions: data.upcomingPromotions || "-",
      birthstoneTheming: data.birthstoneTheming || "-",

      sampleCaptions: data.sampleCaptions || data.captionSample1 || "-",
      captionTargeting: data.captionTargeting || "-",
      language: data.language || "-",
      hashtagStyle: data.hashtagStyle || "-",
      excludedItems: data.excludedItems || "-",

      platforms: Array.isArray(data.platforms) ? data.platforms : [],
      timezone: data.timezone || "-",
      preferredPostingDays: data.preferredPostingDays ? (Array.isArray(data.preferredPostingDays) ? data.preferredPostingDays.join(", ") : data.preferredPostingDays) : (data.actionShotsPossible || "-"),
      preferredTimeWindows: data.preferredTimeWindows ? (Array.isArray(data.preferredTimeWindows) ? data.preferredTimeWindows.join(", ") : data.preferredTimeWindows) : (data.preferredShootTime || "-"),
      specialNotes: data.specialNotes || "-",

      googleDriveEmails: data.googleDriveEmails || "-",

      primaryContactName: data.primaryContactName || data.clientName || "-",
      primaryContactEmail: data.primaryContactEmail || "-",
      preferredCommunication: data.preferredCommunication || "-",

      authSignedAs: data.authSignedAs || data.clientName || "-",
      authOnBehalfOf: data.authOnBehalfOf || data.restaurantNameAuth || "-",
      authSubmissionDate: data.authSubmissionDate || data.submissionDate || new Date().toISOString(),
      authTalexiaPlan: data.authTalexiaPlan || data.talexiaPlan || "-",
      authIHaveReadAndAgree: data.authIHaveReadAndAgree || true
    };

    const pdfBuffer = await buildBrandBriefPdf(pdfInput);
    const safeRestaurantName = (pdfInput.brandName || "brand-brief").replace(/\s+/g, "-").toLowerCase();

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="brand-brief-${safeRestaurantName}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("User brand brief PDF generation error", err);
    return NextResponse.json({ 
      error: "Unable to generate PDF", 
      details: err.message,
    }, { status: 500 });
  }
}
