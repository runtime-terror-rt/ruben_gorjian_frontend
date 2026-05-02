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
      planCode: data.planCode || data.pendingPlanCode || "N/A",
      planName: data.planName || "Enterprise Plan",
      submittedByName: data.user?.name || "Unknown User",
      submittedByEmail: data.user?.email || "Unknown Email",
      restaurantName: data.restaurantName || "Unnamed Restaurant",
      location: data.location || "N/A",
      businessType: data.businessType || "N/A",
      cuisineType: data.cuisineType || "N/A",
      dietaryCertifications: Array.isArray(data.dietaryCertifications) ? data.dietaryCertifications : [],
      websiteUrl: data.websiteUrl,
      instagramHandle: data.instagramHandle || "N/A",
      facebookPageUrl: data.facebookPageUrl,
      tiktokHandle: data.tiktokHandle,
      onlineOrderingUrl: data.onlineOrderingUrl,
      foodDescription: data.foodDescription || "N/A",
      uniqueSellingPoint: data.uniqueSellingPoint || "N/A",
      customerReviews: data.customerReviews || "N/A",
      forbiddenPhrases: data.forbiddenPhrases,
      preferredPhrases: data.preferredPhrases,
      captionSample1: data.captionSample1 || "N/A",
      captionSample2: data.captionSample2 || "N/A",
      captionSample3: data.captionSample3 || "N/A",
      toneAndVoice: Array.isArray(data.toneAndVoice) ? data.toneAndVoice : [],
      captionTargeting: data.captionTargeting || "N/A",
      language: data.language || "N/A",
      signatureDishes: Array.isArray(data.signatureDishes) ? data.signatureDishes : [],
      signatureDishDetails: data.signatureDishDetails || "N/A",
      excludedItems: data.excludedItems,
      upcomingPromotions: data.upcomingPromotions,
      hashtagStyle: data.hashtagStyle || "N/A",
      confirmMinDishes: data.confirmMinDishes || "N/A",
      actionShotsPossible: data.actionShotsPossible,
      preferredShootTime: data.preferredShootTime,
      physicalConstraints: data.physicalConstraints,
      specialNotes: data.specialNotes,
      clientName: data.clientName || "N/A",
      restaurantNameAuth: data.restaurantNameAuth || data.restaurantName || "N/A",
      submissionDate: data.submissionDate || new Date().toISOString(),
      talexiaPlan: data.talexiaPlan || "N/A",
      createdAt: data.createdAt || new Date().toISOString(),
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
