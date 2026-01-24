import Invoice from '../models/Invoice.js';

import { appendToSheet } from '../services/sheetsService.js';

export const getInvoices = async (req, res) => {
    try {
        let invoices = await Invoice.find({ userId: req.user.userId })
            .populate('vendorMapId', 'vendorName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: invoices.length,
            data: invoices
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}

export const updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Ensure user owns invoice
        let invoice = await Invoice.findOne({ _id: id, userId: req.user.userId });

        if (!invoice) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        // Update fields
        if (updates.extractedData) {
            invoice.extractedData = { ...invoice.extractedData, ...updates.extractedData };
        }
        if (updates.status) {
            invoice.status = updates.status;
        }
        if (updates.vendorName) {
            invoice.vendorName = updates.vendorName;
        }

        await invoice.save();

        // If status changed to 'processed', sync to Google Sheet
        if (updates.status === 'processed') {
            try {
                // Fetch vendor to get clean name if possible
                const rowData = [
                    invoice.extractedData.invoiceDate || '',
                    invoice.vendorName || updates.vendorName || '',
                    invoice.extractedData.invoiceNumber || '',
                    invoice.extractedData.totalAmount || ''
                ];

                await appendToSheet(req.user.userId, rowData);
                console.log(`[Review] Manually approved invoice ${id} added to sheet.`);
            } catch (sheetError) {
                console.error('Failed to sync manually approved invoice:', sheetError);
                // Don't fail the request, but log warning
            }
        }

        res.json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
