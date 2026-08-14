import PDFDocument from "pdfkit/js/pdfkit.standalone";

export type BrandBriefPdfInput = {
  id: string;
  planCode: string;
  planName: string;
  submittedByName: string;
  submittedByEmail: string;
  createdAt: Date | string;

  brandName: string;
  businessType: string;
  primaryLocation: string;
  websiteUrl: string;
  industryCategory: string;

  brandStory: string;
  brandVoiceDescriptors: string[];
  targetAudience: string;
  preferredPhrases: string;
  customerReviews: string;
  forbiddenPhrases: string;

  aestheticDirection: string;
  physicalConstraints: string;

  productFocus: string;
  signatureDishDetails: string;
  materialsCertifications: string;
  upcomingPromotions: string;
  birthstoneTheming: string;

  sampleCaptions: string;
  captionTargeting: string;
  language: string;
  hashtagStyle: string;
  excludedItems: string;

  platforms: string[];
  timezone: string;
  preferredPostingDays: string;
  preferredTimeWindows: string;
  specialNotes: string;

  googleDriveEmails: string;

  primaryContactName: string;
  primaryContactEmail: string;
  preferredCommunication: string;

  authSignedAs: string;
  authOnBehalfOf: string;
  authSubmissionDate: Date | string;
  authTalexiaPlan: string;
  authIHaveReadAndAgree: boolean;
};

type TableRow = {
  label: string;
  value: string;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LABEL_WIDTH = 168;
const VALUE_WIDTH = CONTENT_WIDTH - LABEL_WIDTH;
const CELL_PADDING = 8;
const ROW_MIN_HEIGHT = 28;

function formatDate(date: Date | string): string {
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function formatLongDate(date: Date | string): string {
  if (typeof date === "string") return date.replace("T", " ").replace(".000Z", " UTC");
  return date.toISOString().replace("T", " ").replace(".000Z", " UTC");
}

function valueOrNA(value?: string | null): string {
  return value?.trim() ? value.trim() : "-";
}

function formatList(values?: string[] | null): string {
  return values && values.length ? values.join(", ") : "-";
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string) {
  const titleHeight = 20;
  const boxTop = doc.y;
  doc.save();
  doc.rect(MARGIN, boxTop, CONTENT_WIDTH, titleHeight).fill("#0f172a");
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(11);
  doc.text(title, MARGIN + 12, boxTop + 5, { width: CONTENT_WIDTH - 24, align: "left" });
  doc.restore();
  doc.moveDown(1.4);
}

function drawTableRow(doc: PDFKit.PDFDocument, row: TableRow, index: number) {
  const rowY = doc.y;
  const valueText = String(row.value || "-");
  
  let valueHeight = 0;
  try {
    valueHeight = doc.heightOfString(valueText, {
      width: VALUE_WIDTH - CELL_PADDING * 2,
      align: "left",
    });
  } catch (e) {
    console.error("Error calculating string height:", e);
    valueHeight = 20;
  }

  const rowHeight = Math.max(ROW_MIN_HEIGHT, valueHeight + CELL_PADDING * 2);

  if (rowY + rowHeight > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
  }

  const currentY = doc.y;
  const alternate = index % 2 === 0;
  const labelFill = alternate ? "#f8fafc" : "#eef2f7";
  const valueFill = alternate ? "#ffffff" : "#f8fafc";

  doc.save();
  doc.rect(MARGIN, currentY, LABEL_WIDTH, rowHeight).fillAndStroke(labelFill, "#dbe3ee");
  doc.rect(MARGIN + LABEL_WIDTH, currentY, VALUE_WIDTH, rowHeight).fillAndStroke(valueFill, "#dbe3ee");
  doc.restore();

  doc.fillColor("#334155").font("Helvetica-Bold").fontSize(10);
  doc.text(row.label, MARGIN + CELL_PADDING, currentY + CELL_PADDING, {
    width: LABEL_WIDTH - CELL_PADDING * 2,
    height: rowHeight - CELL_PADDING * 2,
    align: "left",
  });

  doc.fillColor("#0f172a").font("Helvetica").fontSize(10);
  doc.text(valueText, MARGIN + LABEL_WIDTH + CELL_PADDING, currentY + CELL_PADDING, {
    width: VALUE_WIDTH - CELL_PADDING * 2,
    height: rowHeight - CELL_PADDING * 2,
    align: "left",
  });

  doc.y = currentY + rowHeight;
}

function drawTable(doc: PDFKit.PDFDocument, rows: TableRow[]) {
  rows.forEach((row, index) => drawTableRow(doc, row, index));
  doc.moveDown(0.7);
}

function drawSummaryBlock(doc: PDFKit.PDFDocument, input: BrandBriefPdfInput) {
  drawSectionTitle(doc, "Submission Summary");
  drawTable(doc, [
    { label: "Submission ID", value: input.id },
    { label: "Plan", value: `${input.planName} (${input.planCode})` },
    { label: "Submitted By", value: `${input.submittedByName} <${input.submittedByEmail}>` },
    { label: "Created At", value: formatLongDate(input.createdAt) },
  ]);
}

export async function buildBrandBriefPdf(input: BrandBriefPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: MARGIN });
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#0f172a").text("Brand Brief Submission", { align: "left" });
    doc.moveDown(0.35);
    doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Prepared for Talexia internal review and client record keeping.");
    doc.moveDown(0.8);

    drawSummaryBlock(doc, input);

    drawSectionTitle(doc, "I. The basics");
    drawTable(doc, [
      { label: "Brand Name", value: valueOrNA(input.brandName) },
      { label: "Business Type", value: valueOrNA(input.businessType) },
      { label: "Primary Location", value: valueOrNA(input.primaryLocation) },
      { label: "Website URL", value: valueOrNA(input.websiteUrl) },
      { label: "Industry Category", value: valueOrNA(input.industryCategory) },
    ]);

    drawSectionTitle(doc, "II. About your brand");
    drawTable(doc, [
      { label: "Brand Story", value: valueOrNA(input.brandStory) },
      { label: "Brand Voice", value: formatList(input.brandVoiceDescriptors) },
      { label: "Target Audience", value: valueOrNA(input.targetAudience) },
      { label: "Taglines", value: valueOrNA(input.preferredPhrases) },
      { label: "Admired Brands", value: valueOrNA(input.customerReviews) },
      { label: "What to Avoid", value: valueOrNA(input.forbiddenPhrases) },
    ]);

    drawSectionTitle(doc, "III. Your aesthetic");
    drawTable(doc, [
      { label: "Aesthetic Direction", value: valueOrNA(input.aestheticDirection) },
      { label: "Staging Preferences", value: valueOrNA(input.physicalConstraints) },
    ]);

    drawSectionTitle(doc, "IV. Your product");
    drawTable(doc, [
      { label: "Product Focus", value: valueOrNA(input.productFocus) },
      { label: "Signature Collections", value: valueOrNA(input.signatureDishDetails) },
      { label: "Materials & Certs", value: valueOrNA(input.materialsCertifications) },
      { label: "Seasonal / Promotions", value: valueOrNA(input.upcomingPromotions) },
      { label: "Birthstone Theming", value: valueOrNA(input.birthstoneTheming) },
    ]);

    drawSectionTitle(doc, "V. Captions & voice");
    drawTable(doc, [
      { label: "Sample Captions", value: valueOrNA(input.sampleCaptions) },
      { label: "Caption Targeting", value: valueOrNA(input.captionTargeting) },
      { label: "Language", value: valueOrNA(input.language) },
      { label: "Hashtag Style", value: valueOrNA(input.hashtagStyle) },
      { label: "Sensitive Topics", value: valueOrNA(input.excludedItems) },
    ]);

    drawSectionTitle(doc, "VI. Publishing");
    drawTable(doc, [
      { label: "Platforms", value: formatList(input.platforms) },
      { label: "Timezone", value: valueOrNA(input.timezone) },
      { label: "Posting Days", value: valueOrNA(input.preferredPostingDays) },
      { label: "Posting Windows", value: valueOrNA(input.preferredTimeWindows) },
      { label: "Posting Notes", value: valueOrNA(input.specialNotes) },
    ]);

    drawSectionTitle(doc, "VII. Catalog & source");
    drawTable(doc, [
      { label: "Drive Share Emails", value: valueOrNA(input.googleDriveEmails) },
    ]);

    drawSectionTitle(doc, "VIII. Operational");
    drawTable(doc, [
      { label: "Primary Contact Name", value: valueOrNA(input.primaryContactName) },
      { label: "Primary Contact Email", value: valueOrNA(input.primaryContactEmail) },
      { label: "Preferred Comm", value: valueOrNA(input.preferredCommunication) },
    ]);

    drawSectionTitle(doc, "IX. Authorization");
    drawTable(doc, [
      { label: "Signed As", value: valueOrNA(input.authSignedAs) },
      { label: "On Behalf Of", value: valueOrNA(input.authOnBehalfOf) },
      { label: "Submission Date", value: formatDate(input.authSubmissionDate) },
      { label: "Talexia Plan", value: valueOrNA(input.authTalexiaPlan) },
      { label: "Terms Agreed", value: input.authIHaveReadAndAgree ? "Yes" : "-" },
    ]);

    doc.end();
  });
}
