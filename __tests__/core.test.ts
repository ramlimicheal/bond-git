
import { describe, it, expect } from 'vitest';
import { generateInvoicePDF } from '../utils/pdfGenerator';
// import { PaymentGateway } from '../components/PaymentGateway'; // Cannot import TSX in non-DOM test env easily without setup

describe('Billenty Core Functions', () => {

    it('should have a PDF generator utility', () => {
        expect(generateInvoicePDF).toBeDefined();
        expect(typeof generateInvoicePDF).toBe('function');
    });

    it('should return a promise from PDF generator', () => {
        const result = generateInvoicePDF({
            id: '123',
            number: 'INV-123',
            clientName: 'Test Client',
            clientType: 'Testing',
            items: []
        } as any);
        expect(result).toBeInstanceOf(Promise);
    });

});
