import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice, Proposal } from '../types';

/**
 * Generates a PDF invoice based on provided data.
 */
export const generateInvoicePDF = async (invoiceData: Invoice): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const margin = 20;
    let y = margin;

    // Header
    doc.setFontSize(24);
    doc.text('INVOICE', margin, y);
    doc.setFontSize(10);
    doc.text(`# ${invoiceData.number}`, 150, y);

    y += 15;
    doc.setFontSize(12);
    doc.text('Bill To:', margin, y);
    doc.setFontSize(10);
    doc.text(invoiceData.clientName || 'N/A', margin, y + 5);
    doc.text(invoiceData.clientType || 'N/A', margin, y + 10);

    y += 30;
    // Table Header
    doc.line(margin, y, 190, y);
    y += 5;
    doc.text('Description', margin, y);
    doc.text('Qty', 110, y);
    doc.text('Price', 130, y);
    doc.text('Total', 160, y);
    y += 5;
    doc.line(margin, y, 190, y);

    // Items
    y += 10;
    invoiceData.items.forEach((item) => {
        doc.text(item.description, margin, y);
        doc.text(item.quantity.toString(), 110, y);
        doc.text(`₹${item.price.toLocaleString()}`, 130, y);
        doc.text(`₹${(item.quantity * item.price).toLocaleString()}`, 160, y);
        y += 8;
    });

    y += 10;
    doc.line(margin, y, 190, y);
    y += 10;
    const total = invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount Due:', 110, y);
    doc.text(`₹${total.toLocaleString()}`, 160, y);

    return doc.output('blob');
};

/**
 * Generates a PDF proposal based on provided data.
 * Handles complex signatures (drawn images or typed text).
 */
export const generateProposalPDF = async (proposal: Proposal): Promise<Blob> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('PROPOSAL', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Proposal #: ${proposal.number}`, pageWidth - margin - 40, y);
    y += 10;
    doc.text(`Date: ${proposal.createdDate}`, pageWidth - margin - 40, y);
    y += 5;
    doc.text(`Valid Until: ${proposal.validUntil}`, pageWidth - margin - 40, y);

    y += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(proposal.title, margin, y);

    y += 15;
    doc.setFontSize(12);
    doc.text('Prepared For:', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(proposal.clientName || 'N/A', margin, y + 5);
    doc.text(proposal.clientEmail || 'N/A', margin, y + 10);

    y += 30;
    // Sections
    proposal.sections.forEach((section, index) => {
        if (y > 250) {
            doc.addPage();
            y = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${section.title}`, margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(section.content, pageWidth - 2 * margin);
        doc.text(splitText, margin, y);
        y += splitText.length * 5 + 10;
    });

    // Signatures
    if (y > 220) {
        doc.addPage();
        y = margin;
    }

    y += 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Signatures', margin, y);

    y += 15;
    // Helper to render signature
    const renderSignature = (label: string, signature: string | undefined, x: number, currentY: number) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, currentY);

        const sigY = currentY + 5;
        if (signature?.startsWith('data:image/')) {
            try {
                doc.addImage(signature, 'PNG', x, sigY, 50, 20);
            } catch (e) {
                console.error('Failed to add signature image:', e);
                doc.setFont('courier', 'italic');
                doc.text(signature.slice(0, 20) + '...', x, sigY + 10);
            }
        } else if (signature) {
            doc.setFont('courier', 'italic');
            doc.setFontSize(16);
            doc.text(signature, x, sigY + 12);
            doc.setFontSize(10);
        } else {
            doc.setFont('helvetica', 'italic');
            doc.text('Pending Action', x, sigY + 10);
        }
    };

    renderSignature('Service Provider', proposal.senderSignature, margin, y);
    renderSignature('Client', proposal.clientSignature, pageWidth / 2 + 10, y);

    y += 35;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Signed At: ${proposal.senderSignedAt || 'Not signed'}`, margin, y);
    doc.text(`Signed At: ${proposal.clientSignedAt || 'Not signed'}`, pageWidth / 2 + 10, y);

    y += 15;
    doc.text('This document is legally binding under the Indian Contract Act, 1872.', margin, y);

    return doc.output('blob');
};
