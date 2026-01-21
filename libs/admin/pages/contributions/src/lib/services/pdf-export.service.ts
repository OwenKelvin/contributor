import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF to include autoTable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}

@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  constructor() {}

  /**
   * Exports contribution reports data to a PDF document.
   * @param reportData - The data to be included in the report.
   * @param filters - Active filters used for the report.
   * @param dateRange - Date range applied to the report.
   */
  exportContributionsReportToPdf(
    reportData: any[],
    filters: any,
    dateRange: { start: string; end: string },
  ): void {
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: 'Contribution Report',
      subject: 'Detailed Contribution Report',
      author: 'Nyots Admin',
    });

    // --- Header ---
    this.addHeader(doc, filters, dateRange);

    // --- Report Content (Tables) ---
    this.addReportContent(doc, reportData);

    // --- Footer ---
    this.addFooter(doc);

    // Save the PDF
    doc.save(
      `contribution_report_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  }

  private addHeader(
    doc: jsPDF,
    filters: any,
    dateRange: { start: string; end: string },
  ): void {
    // Logo (placeholder)
    // doc.addImage('path/to/your/logo.png', 'PNG', 10, 10, 50, 20);

    // Title
    doc.setFontSize(22);
    doc.text('Contribution Report', doc.internal.pageSize.getWidth() / 2, 20, {
      align: 'center',
    });

    doc.setFontSize(10);
    doc.text(
      'Nyots Admin Interface',
      doc.internal.pageSize.getWidth() / 2,
      27,
      { align: 'center' },
    );

    // Filters and Date Range
    doc.setFontSize(10);
    let y = 40;
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, y);
    y += 7;
    doc.text(`Date Range: ${dateRange.start} - ${dateRange.end}`, 14, y);
    y += 7;
    doc.text(`Filters: ${this.formatFilters(filters)}`, 14, y);

    doc.line(14, y + 5, doc.internal.pageSize.getWidth() - 14, y + 5); // Separator line
  }

  private addReportContent(doc: jsPDF, reportData: any[]): void {
    // Start table content below the header
    let startY = 60; // Adjust based on header height

    // Example: Assuming reportData is an array of objects, each representing a row
    // and all objects have the same keys for columns.
    if (reportData.length === 0) {
      doc.text(
        'No data available for this report.',
        doc.internal.pageSize.getWidth() / 2,
        startY,
        { align: 'center' },
      );
      return;
    }

    const headers = Object.keys(reportData[0]).map((key) => ({
      title: this.capitalizeFirstLetter(key),
      dataKey: key,
    }));
    const body = reportData.map((row) => Object.values(row));

    autoTable(doc, {
      head: [headers.map((h) => h.title)],
      body: body as any,
      startY: startY,
      theme: 'grid',
      headStyles: { fillColor: '#e2e8f0', textColor: '#2d3748' }, // Tailwind gray-200, gray-800
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      columnStyles: {
        // Example: style specific columns
        // 0: { cellWidth: 30 },
      },
      didDrawPage: (data) => {
        console.log("Check data to fix footer", data)
        // Add footer on each page
        this.addFooter(doc, data.pageNumber, (data as any).pageCount);
      },
      willDrawCell: (data) => {
        // Alternating row colors
        if (data.section === 'body' && data.row.index % 2 === 0) {
          data.cell.styles.fillColor = '#f8fafc'; // Tailwind gray-50
        }
      },
    });
  }

  private addFooter(
    doc: jsPDF,
    pageNumber: number = 1,
    pageCount: number = 1,
  ): void {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);

    // Generated Timestamp
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, pageHeight - 10);

    // Page Number
    doc.text(
      `Page ${pageNumber} of ${pageCount}`,
      doc.internal.pageSize.getWidth() - 14,
      pageHeight - 10,
      { align: 'right' },
    );
  }

  private formatFilters(filters: any): string {
    return Object.entries(filters)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      )
      .map(([key, value]) => `${this.capitalizeFirstLetter(key)}: ${value}`)
      .join(', ');
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
