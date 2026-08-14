import { NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";
import { buildBrandBriefPdf, BrandBriefPdfInput } from "@/lib/brand-brief-pdf";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the brand brief details from the backend
    const res = await fetch(`${getBackendUrl()}/api/brand-brief/admin/submissions/${id}`, {
      headers: await getBackendHeaders(),
      credentials: "include",
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch brand brief details" }, { status: res.status });
    }

    const json = await res.json();
    const data = json.data || json.item || json;

    if (!data || (!data.id && !data._id)) {
      console.error("No data found for submission ID:", id, json);
      return NextResponse.json({ error: "No data found for this submission" }, { status: 404 });
    }

    // Map the API data to the PDF input format with robust fallbacks
    const pdfInput: BrandBriefPdfInput = {
      id: data.id || data._id || id,
      planCode: data.planCode || data.pendingPlanCode || "-",
      planName: data.planName || "Active Plan",
      submittedByName: data.user?.name || data.authSignedAs || data.clientName || "Unknown User",
      submittedByEmail: data.user?.email || "-",
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

    // Generate the PDF buffer
    const pdfBuffer = await buildBrandBriefPdf(pdfInput);

    // Safe filename generation
    const safeRestaurantName = (data.restaurantName || "brand-brief").replace(/\s+/g, '-').toLowerCase();

    // Return the PDF response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="brand-brief-${safeRestaurantName}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("Brand brief PDF generation error", err);
    return NextResponse.json({ 
      error: "Unable to generate PDF", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
