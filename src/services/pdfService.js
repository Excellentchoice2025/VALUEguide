const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');
const fs = require('fs-extra');
const path = require('path');

class PDFService {
  constructor() {
    this.templatePath = process.env.PDF_TEMPLATE_PATH;
  }
  
  async createProtectedPDF(customerEmail, orderId) {
    // Read the template PDF
    const templateBytes = await fs.readFile(this.templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    
    // Visible footer watermark
    const watermarkText = `Licensed exclusively to: ${customerEmail} (Order: ${orderId})`;
    
    // Report piracy notice
    const reportText = `This document is protected by copyright. Unauthorized distribution is prohibited.
If you received this without purchasing, report to valueguides.co/report-violation for a 50% discount.`;
    
    // Apply watermarks to every page
    for (const page of pages) {
      const { width, height } = page.getSize();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Footer watermark
      page.drawText(watermarkText, {
        x: 50,
        y: 20,
        size: 8,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.9
      });
      
      // Piracy notice
      page.drawText(reportText, {
        x: 50,
        y: 10,
        size: 6,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.9
      });
      
      // Diagonal watermark
      const diagonalText = `${customerEmail} - ${orderId}`;
      page.drawText(diagonalText, {
        x: width / 2 - 150,
        y: height / 2,
        size: 24,
        font: helveticaBold,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.2,
        rotate: degrees(45)
      });
    }
    
    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, '../../public/generated', `travel-planner-${orderId}.pdf`);
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, pdfBytes);
    
    return outputPath;
  }
}

module.exports = new PDFService();