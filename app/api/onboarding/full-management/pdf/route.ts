import { NextResponse } from "next/server";
import { getBackendUrl, getBackendHeaders } from "@/lib/server-backend";
import { buildFullManagementPdf, FullManagementPdfInput } from "@/lib/full-management-pdf";

export async function GET() {
  try {
    // Fetch the full management details for the current user
    const res = await fetch(`${getBackendUrl()}/onboarding/full-management`, {
      headers: await getBackendHeaders(),
      credentials: "include",
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch full management details" }, { status: res.status });
    }

    const json = await res.json();
    // Expected structure: { data: { ... }, businessName: string, completed: boolean }
    const data = json.data;

    if (!data) {
      return NextResponse.json({ error: "No full management data found for your account" }, { status: 404 });
    }

    // Map the API data to the PDF input format
    const pdfInput: FullManagementPdfInput = {
      businessName: json.businessName || data.businessName || "Unnamed Business",
      industry: data.industry || "N/A",
      websiteUrl: data.websiteUrl || "N/A",
      targetAudience: Array.isArray(data.targetAudience) ? data.targetAudience : [],
      brandPersonality: Array.isArray(data.brandPersonality) ? data.brandPersonality : [],
      salesModel: Array.isArray(data.salesModel) ? data.salesModel : [],
      visualStylePreference: data.visualStylePreference || "N/A",
      outlineFrame: data.outlineFrame || "N/A",
      platformsToManage: Array.isArray(data.platformsToManage) ? data.platformsToManage : [],
      postingFrequencyPreference: data.postingFrequencyPreference || "N/A",
      postingTimePreference: Array.isArray(data.postingTimePreference) ? data.postingTimePreference : [],
      postingAccessGranted: data.postingAccessGranted || "N/A",
      allowCtas: data.allowCtas || "N/A",
      imageUsagePermission: data.imageUsagePermission || "N/A",
      submissionDate: data.draftSavedAt || new Date().toISOString(),
    };

    // Generate the PDF buffer
    const pdfBuffer = await buildFullManagementPdf(pdfInput);

    // Safe filename generation
    const safeBusinessName = (pdfInput.businessName || "full-management").replace(/\s+/g, '-').toLowerCase();

    // Return the PDF response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="full-management-${safeBusinessName}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("Full management PDF generation error", err);
    return NextResponse.json({ 
      error: "Unable to generate PDF", 
      details: err.message,
    }, { status: 500 });
  }
}
