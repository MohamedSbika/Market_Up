/**
 * GET /api/dashboard/billing/[id]/pdf
 * Generates a PDF invoice for the given billing record.
 * Uses pdf-lib for server-side generation.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { BillingRecord } from '@/models/BillingRecord';
import { Company } from '@/models/Company';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { formatDateFR } from '@/lib/utils';
import mongoose from 'mongoose';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await connectDB();

    // Verify ownership — only fetch if companyId matches session
    const record = await BillingRecord.findOne({
      _id:       id,
      companyId: session.user.id,
    }).lean<{
      label: string;
      amount: number;
      tva: number;
      amountTTC: number;
      invoiceNumber: string;
      status: string;
      paidAt?: Date;
      createdAt: Date;
    }>();

    if (!record) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const company = await Company.findById(session.user.id)
      .select('-passwordHash')
      .lean<{ name: string; email: string; rneNumber: string; taxId?: string; city?: string }>();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // ── Build PDF ──────────────────────────────────────────────────────────
    const pdf    = await PDFDocument.create();
    const page   = pdf.addPage([595, 842]); // A4
    const font   = await pdf.embedFont(StandardFonts.Helvetica);
    const fontB  = await pdf.embedFont(StandardFonts.HelveticaBold);

    const blue   = rgb(0, 0.47, 0.83);   // #0078D4
    const dark   = rgb(0.14, 0.14, 0.14); // #242424
    const muted  = rgb(0.38, 0.38, 0.38); // #616161
    const border = rgb(0.88, 0.88, 0.88); // #E0E0E0

    const { width, height } = page.getSize();
    const margin = 56;

    // Header bar
    page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: blue });
    page.drawText('MARKET', { x: margin, y: height - 52, size: 28, font: fontB, color: rgb(1,1,1) });
    page.drawText('UP', { x: margin + 114, y: height - 52, size: 28, font: fontB, color: rgb(0.94, 0.96, 0.99) });

    // Invoice title
    page.drawText('FACTURE', { x: margin, y: height - 110, size: 22, font: fontB, color: dark });
    page.drawText(record.invoiceNumber, { x: margin, y: height - 135, size: 13, font, color: muted });

    // Issuer info (AGGREGAX SUARL)
    const issuerX = width - margin - 200;
    page.drawText('AGGREGAX SUARL', { x: issuerX, y: height - 110, size: 11, font: fontB, color: dark });
    page.drawText('Tunisie',         { x: issuerX, y: height - 126, size: 10, font, color: muted });
    page.drawText('contact@vivasky.media', { x: issuerX, y: height - 141, size: 10, font, color: muted });

    // Divider
    page.drawLine({ start: { x: margin, y: height - 160 }, end: { x: width - margin, y: height - 160 }, thickness: 1, color: border });

    // Billed to
    page.drawText('Facturé à', { x: margin, y: height - 185, size: 9, font: fontB, color: muted });
    page.drawText(company.name, { x: margin, y: height - 200, size: 12, font: fontB, color: dark });
    page.drawText(company.email, { x: margin, y: height - 217, size: 10, font, color: muted });
    if (company.rneNumber) page.drawText(`RNE: ${company.rneNumber}`, { x: margin, y: height - 232, size: 10, font, color: muted });
    if (company.taxId)     page.drawText(`MF: ${company.taxId}`, { x: margin, y: height - 247, size: 10, font, color: muted });

    // Invoice date
    const dateX = width - margin - 160;
    page.drawText('Date de facturation', { x: dateX, y: height - 185, size: 9, font: fontB, color: muted });
    page.drawText(formatDateFR(record.paidAt ?? record.createdAt), { x: dateX, y: height - 200, size: 11, font, color: dark });

    // Table header
    const tableY = height - 300;
    page.drawRectangle({ x: margin, y: tableY, width: width - 2 * margin, height: 28, color: rgb(0.96, 0.96, 0.96) });
    page.drawText('Description',   { x: margin + 10, y: tableY + 9, size: 10, font: fontB, color: dark });
    page.drawText('Montant HT',    { x: width - margin - 190, y: tableY + 9, size: 10, font: fontB, color: dark });
    page.drawText('TVA (19%)',      { x: width - margin - 110, y: tableY + 9, size: 10, font: fontB, color: dark });
    page.drawText('Total TTC',     { x: width - margin - 68, y: tableY + 9, size: 10, font: fontB, color: dark });

    // Table row
    const rowY = tableY - 30;
    page.drawText(record.label, { x: margin + 10, y: rowY + 5, size: 10, font, color: dark, maxWidth: 220 });
    page.drawText(`${record.amount.toFixed(2)} DT`,    { x: width - margin - 190, y: rowY + 5, size: 10, font, color: dark });
    page.drawText(`${record.tva.toFixed(2)} DT`,       { x: width - margin - 110, y: rowY + 5, size: 10, font, color: dark });
    page.drawText(`${record.amountTTC.toFixed(2)} DT`, { x: width - margin - 68,  y: rowY + 5, size: 10, font: fontB, color: dark });

    // Bottom divider
    page.drawLine({ start: { x: margin, y: rowY - 15 }, end: { x: width - margin, y: rowY - 15 }, thickness: 1, color: border });

    // Total box
    const totalY = rowY - 70;
    page.drawRectangle({ x: width - margin - 210, y: totalY, width: 210, height: 42, color: blue });
    page.drawText('TOTAL TTC', { x: width - margin - 198, y: totalY + 26, size: 10, font: fontB, color: rgb(1,1,1) });
    page.drawText(`${record.amountTTC.toFixed(2)} DT`, { x: width - margin - 198, y: totalY + 10, size: 14, font: fontB, color: rgb(1,1,1) });

    // Footer
    page.drawLine({ start: { x: margin, y: 60 }, end: { x: width - margin, y: 60 }, thickness: 1, color: border });
    page.drawText(
      `${record.invoiceNumber} — Généré le ${formatDateFR(new Date())} — vivasky.media`,
      { x: margin, y: 44, size: 8, font, color: muted }
    );

    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${record.invoiceNumber}.pdf"`,
        'Content-Length':      pdfBytes.byteLength.toString(),
      },
    });
  } catch (err) {
    console.error('[GET /api/dashboard/billing/[id]/pdf]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
