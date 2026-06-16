import { describe, it, expect, vi } from 'vitest';
import { generateInvoicePDF, generateProposalPDF } from '../utils/pdfGenerator';
import { Invoice, Proposal } from '../types';

describe('BILLENTY E2E Flow Logic', () => {

    const mockInvoice: Invoice = {
        id: '1',
        number: 'INV-2026-001',
        status: 'Pending',
        clientName: 'Test Client',
        clientType: 'Software Development',
        issuedDate: '07 Feb 2026',
        dueDate: '21 Feb 2026',
        amountPaid: 0,
        amountDue: 50000,
        items: [
            { id: '1', description: 'Web Development', quantity: 1, price: 50000 }
        ]
    };

    const mockProposal: Proposal = {
        id: 'prop-1',
        number: 'PROP-2026-001',
        title: 'Project Alpha',
        status: 'Draft',
        clientName: 'Test Client',
        clientEmail: 'test@client.com',
        projectType: 'Web Development',
        createdDate: '07 Feb 2026',
        validUntil: '07 Mar 2026',
        totalValue: 50000,
        sections: [
            { id: '1', title: 'Scope', content: 'Testing scope' }
        ],
        senderSignature: 'Service Provider Name',
        senderSignedAt: '07 Feb 2026'
    };

    it('should generate a valid Blob for Invoice PDF', async () => {
        const blob = await generateInvoicePDF(mockInvoice);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/pdf');
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should generate a valid Blob for Proposal PDF', async () => {
        const blob = await generateProposalPDF(mockProposal);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/pdf');
        expect(blob.size).toBeGreaterThan(0);
    });

    it('should handle dataURL signatures in Proposal PDF', async () => {
        const proposalWithSig = {
            ...mockProposal,
            clientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            clientSignedAt: '07 Feb 2026'
        };
        const blob = await generateProposalPDF(proposalWithSig);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(0);
    });
});
