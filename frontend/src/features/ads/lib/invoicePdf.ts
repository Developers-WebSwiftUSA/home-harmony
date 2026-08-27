import { jsPDF } from "jspdf";
import { AdCampaign } from "@/features/ads/types/adCampaign.types";
import { formatAdTypeLabel, formatCampaignPeriod, formatCurrency } from "@/features/ads/lib/promotionDisplay";
import {
  getCampaignPropertyTitle,
  getCustomerLabel,
  invoiceNumber,
} from "@/features/ads/lib/campaignBilling";
import { COMPANY } from "@/lib/company";

const NAVY: [number, number, number] = [24, 31, 42];
const ORANGE: [number, number, number] = [230, 107, 41];
const MUTED: [number, number, number] = [90, 98, 110];
const LINE: [number, number, number] = [220, 224, 230];

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
};

export const downloadCampaignInvoicePdf = (campaign: AdCampaign) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const number = invoiceNumber(campaign._id);
  const amount = Number(campaign.chargedAmount || campaign.totalAmount || 0);
  const customer = getCustomerLabel(campaign);
  const propertyTitle = getCampaignPropertyTitle(campaign);

  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 92, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(0, 92, pageWidth, 6, "F");

  doc.setFillColor(255, 255, 255);
  doc.circle(margin + 16, 46, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...ORANGE);
  doc.text("H", margin + 16, 51, { align: "center" });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(COMPANY.name, margin + 42, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(COMPANY.tagline, margin + 42, 58);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("INVOICE", pageWidth - margin, 40, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(number, pageWidth - margin, 56, { align: "right" });
  doc.text(formatDate(campaign.chargedAt || campaign.approvedAt || campaign.createdAt), pageWidth - margin, 70, {
    align: "right",
  });

  let y = 128;
  doc.setTextColor(...MUTED);
  doc.setFontSize(8);
  doc.text("FROM", margin, y);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(COMPANY.name, margin, y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(COMPANY.address, margin, y + 30);
  doc.text(`${COMPANY.email}  ·  ${COMPANY.phone}`, margin, y + 44);

  doc.setFontSize(8);
  doc.text("BILL TO", pageWidth / 2 + 12, y);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(customer, pageWidth / 2 + 12, y + 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const billLines = [
    campaign.payment?.billingEmail,
    campaign.payment?.billingAddress,
    campaign.payment?.cardLast4 ? `${campaign.payment.cardBrand || "Card"} •••• ${campaign.payment.cardLast4}` : "",
  ].filter(Boolean) as string[];
  billLines.forEach((line, index) => {
    doc.text(line, pageWidth / 2 + 12, y + 30 + index * 14);
  });

  y = 220;
  doc.setFillColor(...ORANGE);
  doc.rect(margin, y, pageWidth - margin * 2, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("DESCRIPTION", margin + 12, y + 18);
  doc.text("AMOUNT", pageWidth - margin - 12, y + 18, { align: "right" });

  y += 28;
  doc.setFillColor(252, 250, 247);
  doc.rect(margin, y, pageWidth - margin * 2, 72, "F");
  doc.setDrawColor(...LINE);
  doc.rect(margin, y, pageWidth - margin * 2, 72);

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${formatAdTypeLabel(campaign.adType)} campaign`, margin + 12, y + 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const details = [
    propertyTitle,
    `${campaign.durationDays} days  ·  ${formatCampaignPeriod(campaign.startDate, campaign.endDate)}`,
    `Payment status: ${(campaign.paymentStatus || "charged").replace(/^./, (c) => c.toUpperCase())}`,
  ];
  details.forEach((line, index) => {
    doc.text(line, margin + 12, y + 40 + index * 12);
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.text(formatCurrency(amount), pageWidth - margin - 12, y + 40, { align: "right" });

  y += 100;
  doc.setDrawColor(...LINE);
  doc.line(pageWidth / 2, y, pageWidth - margin, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text("Total paid", pageWidth / 2, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...ORANGE);
  doc.text(formatCurrency(amount), pageWidth - margin, y, { align: "right" });

  doc.setFillColor(...NAVY);
  doc.rect(0, pageHeight - 56, pageWidth, 56, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(0, pageHeight - 56, pageWidth, 4, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `${COMPANY.name}  ·  ${COMPANY.address}  ·  ${COMPANY.website}`,
    pageWidth / 2,
    pageHeight - 28,
    { align: "center" }
  );
  doc.setTextColor(200, 205, 214);
  doc.text("Thank you for advertising with House Tour Guide.", pageWidth / 2, pageHeight - 16, {
    align: "center",
  });

  doc.save(`${number}.pdf`);
};
