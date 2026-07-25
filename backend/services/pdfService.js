const PDFDocument = require('pdfkit');

const generatePDFReport = (res, title, headers, rows) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${title.toLowerCase().replace(/ /g, '_')}_report.pdf`
  );

  doc.pipe(res);

  // Document Header
  doc
    .fillColor('#2563EB')
    .fontSize(22)
    .text('ZENFLOW ENTERPRISE', 30, 30, { align: 'left' });
  
  doc
    .fillColor('#4B5563')
    .fontSize(10)
    .text('Enterprise Workforce & Project Management Platform', 30, 55);

  doc
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .moveTo(30, 72)
    .lineTo(565, 72)
    .stroke();

  // Report Title & Date
  doc
    .fillColor('#1F2937')
    .fontSize(14)
    .text(title, 30, 90, { underline: true });
  
  doc
    .fillColor('#6B7280')
    .fontSize(9)
    .text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 30, 110);

  // Draw Table
  let currentY = 135;
  const startX = 30;
  const tableWidth = 535;
  const colWidth = tableWidth / headers.length;
  const rowHeight = 22;

  // Draw Table Headers
  doc.rect(startX, currentY, tableWidth, rowHeight).fill('#2563EB');
  doc.fillColor('#FFFFFF').fontSize(9);
  
  headers.forEach((header, index) => {
    doc.text(
      header,
      startX + index * colWidth + 5,
      currentY + 6,
      { width: colWidth - 10, align: 'left' }
    );
  });

  currentY += rowHeight;

  // Draw Table Data
  doc.fontSize(8);
  rows.forEach((row, rowIndex) => {
    if (currentY > 750) {
      doc.addPage();
      currentY = 40;
      
      doc.rect(startX, currentY, tableWidth, rowHeight).fill('#2563EB');
      doc.fillColor('#FFFFFF').fontSize(9);
      headers.forEach((header, index) => {
        doc.text(
          header,
          startX + index * colWidth + 5,
          currentY + 6,
          { width: colWidth - 10, align: 'left' }
        );
      });
      currentY += rowHeight;
      doc.fontSize(8);
    }

    const fillColor = rowIndex % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
    doc.rect(startX, currentY, tableWidth, rowHeight).fill(fillColor);
    
    doc
      .strokeColor('#F3F4F6')
      .lineWidth(0.5)
      .rect(startX, currentY, tableWidth, rowHeight)
      .stroke();

    doc.fillColor('#374151');
    row.forEach((cellVal, colIndex) => {
      const cellText = cellVal !== undefined && cellVal !== null ? cellVal.toString() : '';
      doc.text(
        cellText,
        startX + colIndex * colWidth + 5,
        currentY + 7,
        { width: colWidth - 10, height: rowHeight - 8, ellipsis: true }
      );
    });

    currentY += rowHeight;
  });

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fillColor('#9CA3AF')
      .fontSize(8)
      .text(
        `Page ${i + 1} of ${range.count}`,
        30,
        810,
        { align: 'center', width: 535 }
      );
  }

  doc.end();
};

module.exports = {
  generatePDFReport,
};
