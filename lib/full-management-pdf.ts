import PDFDocument from "pdfkit/js/pdfkit.standalone";

export type FullManagementPdfInput = {
  businessName: string;
  industry: string;
  websiteUrl: string;
  targetAudience: string[];
  brandPersonality: string[];
  salesModel: string[];
  visualStylePreference: string;
  outlineFrame: string;
  platformsToManage: string[];
  postingFrequencyPreference: string;
  postingTimePreference: string[];
  postingAccessGranted: string;
  allowCtas: string;
  imageUsagePermission: string;
  submissionDate?: Date | string;
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
  if (!date) return "N/A";
  if (typeof date === "string") return date.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function valueOrNA(value?: string | null): string {
  return value?.trim() ? value.trim() : "N/A";
}

function formatList(values?: string[] | null): string {
  return values && values.length ? values.join(", ") : "N/A";
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
  const valueText = String(row.value || "N/A");
  
  let valueHeight = 0;
  try {
    valueHeight = doc.heightOfString(valueText, {
      width: VALUE_WIDTH - CELL_PADDING * 2,
      align: "left",
    });
  } catch (e) {
    console.error("Error calculating string height:", e);
    valueHeight = 20; // Fallback height
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

export async function buildFullManagementPdf(input: FullManagementPdfInput): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: MARGIN });
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.font("Helvetica-Bold").fontSize(20).fillColor("#0f172a").text("Full Management Onboarding", { align: "left" });
    doc.moveDown(0.35);
    doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Prepared for Talexia internal review and client record keeping.");
    doc.moveDown(0.8);

    drawSectionTitle(doc, "01. Business Info");
    drawTable(doc, [
      { label: "Business Name", value: input.businessName },
      { label: "Industry", value: input.industry },
      { label: "Website URL", value: valueOrNA(input.websiteUrl) },
    ]);

    drawSectionTitle(doc, "02. Strategy & Content");
    drawTable(doc, [
      { label: "Target Audience", value: formatList(input.targetAudience) },
      { label: "Brand Personality", value: formatList(input.brandPersonality) },
      { label: "Sales Model", value: formatList(input.salesModel) },
      { label: "Visual Style", value: input.visualStylePreference },
      { label: "Outline Frame", value: input.outlineFrame },
    ]);

    drawSectionTitle(doc, "03. Platform & Posting");
    drawTable(doc, [
      { label: "Platforms to Manage", value: formatList(input.platformsToManage) },
      { label: "Posting Frequency", value: input.postingFrequencyPreference },
      { label: "Posting Time", value: formatList(input.postingTimePreference) },
      { label: "Posting Access Granted", value: input.postingAccessGranted },
      { label: "Allow CTAs", value: input.allowCtas },
      { label: "Image Usage Permission", value: input.imageUsagePermission },
    ]);

    if (input.submissionDate) {
      drawSectionTitle(doc, "Submission Details");
      drawTable(doc, [
        { label: "Submission Date", value: formatDate(input.submissionDate) },
      ]);
    }

    doc.end();
  });
}
