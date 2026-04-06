'use client';

import { useState } from 'react';

interface CertificateButtonProps {
  userName: string;
  badgeName: string;
  pathwayTitle: string;
  earnedDate: string;
  badgeColor: string;
}

export default function CertificateButton({
  userName,
  badgeName,
  pathwayTitle,
  earnedDate,
  badgeColor,
}: CertificateButtonProps) {
  const [generating, setGenerating] = useState(false);

  const generateCertificate = async () => {
    setGenerating(true);

    // Dynamic import to keep bundle small
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, w, h, 'F');

    // Border
    const borderColor = hexToRgb(badgeColor);
    doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
    doc.setLineWidth(3);
    doc.rect(30, 30, w - 60, h - 60);
    doc.setLineWidth(1);
    doc.rect(36, 36, w - 72, h - 72);

    // Top decorative line
    doc.setFillColor(borderColor.r, borderColor.g, borderColor.b);
    doc.rect(30, 30, w - 60, 8, 'F');

    // Institution
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('QUINSIGAMOND COMMUNITY COLLEGE', w / 2, 90, { align: 'center' });

    // Certificate title
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('PROFESSIONAL DEVELOPMENT', w / 2, 112, { align: 'center' });

    // Main heading
    doc.setFontSize(36);
    doc.setTextColor(borderColor.r, borderColor.g, borderColor.b);
    doc.text('Certificate of Completion', w / 2, 165, { align: 'center' });

    // Divider line
    doc.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
    doc.setLineWidth(1);
    doc.line(w / 2 - 120, 182, w / 2 + 120, 182);

    // "This certifies that"
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('This certifies that', w / 2, 215, { align: 'center' });

    // Name
    doc.setFontSize(30);
    doc.setTextColor(15, 45, 74); // qcc-dark
    doc.text(userName, w / 2, 258, { align: 'center' });

    // Name underline
    const nameWidth = doc.getTextWidth(userName);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(w / 2 - nameWidth / 2 - 20, 266, w / 2 + nameWidth / 2 + 20, 266);

    // "has successfully completed"
    doc.setFontSize(14);
    doc.setTextColor(100, 116, 139);
    doc.text('has successfully completed the learning pathway', w / 2, 300, { align: 'center' });

    // Pathway title
    doc.setFontSize(22);
    doc.setTextColor(borderColor.r, borderColor.g, borderColor.b);
    doc.text(pathwayTitle, w / 2, 338, { align: 'center' });

    // Badge name
    doc.setFontSize(16);
    doc.setTextColor(15, 45, 74);
    doc.text(`and has earned the "${badgeName}" badge`, w / 2, 372, { align: 'center' });

    // Date
    const formattedDate = new Date(earnedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Completed on ${formattedDate}`, w / 2, 420, { align: 'center' });

    // Bottom decorative line
    doc.setFillColor(borderColor.r, borderColor.g, borderColor.b);
    doc.rect(30, h - 38, w - 60, 8, 'F');

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Quinsigamond Community College | Professional Development Dashboard', w / 2, h - 52, { align: 'center' });

    // Save
    const filename = `QCC_Certificate_${pathwayTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${userName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    doc.save(filename);
    setGenerating(false);
  };

  return (
    <button
      onClick={generateCertificate}
      disabled={generating}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-qcc-sky hover:text-qcc-sky-hover transition-colors disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      {generating ? 'Generating...' : 'Download Certificate'}
    </button>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 31, g: 90, b: 150 }; // default qcc-blue
}
