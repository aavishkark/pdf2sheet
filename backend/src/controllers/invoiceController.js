import Invoice from '../models/Invoice.js';
import VendorMap from '../models/VendorMap.js';
import { appendToSheet } from '../services/sheetsService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

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

        let invoice = await Invoice.findOne({ _id: id, userId: req.user.userId });

        if (!invoice) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

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

        if (updates.status === 'processed') {
            try {
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
            }
        }

        res.json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getInvoicePdf = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[PDF Serve] Request for Invoice ID: ${id}`);

        const invoice = await Invoice.findOne({ _id: id, userId: req.user.userId });

        if (!invoice) {
            console.log('[PDF Serve] Invoice not found in DB');
            return res.status(404).json({ success: false, error: 'PDF not found' });
        }

        console.log(`[PDF Serve] DB Record Found. FilePath: ${invoice.filePath}`);

        if (!invoice.filePath) {
            console.log('[PDF Serve] No filePath in invoice record');
            return res.status(404).json({ success: false, error: 'PDF not found' });
        }

        const filePath = path.join(UPLOADS_DIR, invoice.filePath);
        console.log(`[PDF Serve] Checking absolute path: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            console.log('[PDF Serve] File does not exist on disk');
            return res.status(404).json({ success: false, error: 'File on disk not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(filePath);

    } catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).json({ success: false, error: 'Failed to serve PDF' });
    }
};

const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';

    let date = new Date(dateStr);

    if (isNaN(date.getTime())) {
        return dateStr;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

export const processAndLearn = async (req, res) => {
    try {
        const { id } = req.params;
        const { extractedData, vendorName } = req.body;
        const userId = req.user.userId;

        const invoice = await Invoice.findOne({ _id: id, userId });
        if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });

        if (extractedData) {
            if (extractedData.invoiceDate) extractedData.invoiceDate = formatDateToDDMMYYYY(extractedData.invoiceDate);
            if (extractedData.dueDate) extractedData.dueDate = formatDateToDDMMYYYY(extractedData.dueDate);

            invoice.extractedData = { ...invoice.extractedData, ...extractedData };
        }
        if (vendorName) invoice.vendorName = vendorName;
        invoice.status = 'processed';
        invoice.processedAt = new Date();

        await invoice.save();

        if (invoice.senderEmail && vendorName) {
            const existingMap = await VendorMap.findOne({ senderEmail: invoice.senderEmail });
            if (!existingMap) {
                await VendorMap.create({
                    vendorName: vendorName,
                    senderEmail: invoice.senderEmail,
                    extractionRules: []
                });
                console.log(`[Learn] New VendorMap created for ${vendorName} (${invoice.senderEmail})`);
            }
        }

        try {
            const rowData = [
                invoice.vendorName || '',
                invoice.extractedData.invoiceNumber || '',
                invoice.extractedData.invoiceDate || '',
                invoice.extractedData.totalAmount || '',
                invoice.extractedData.dueDate || ''
            ];
            await appendToSheet(userId, rowData);
            console.log(`[Sheet] Synced invoice ${id}`);
            res.json({ success: true, message: 'Invoice processed and rules learned & Synced to Sheet!' });

        } catch (sheetErr) {
            console.error('[Sheet] Sync failed:', sheetErr);
            res.json({
                success: true,
                message: 'Invoice processed, but Sheet Sync Failed: ' + (sheetErr.message || 'Unknown Error'),
                warning: true
            });
        }

    } catch (error) {
        console.error('Process error:', error);
        res.status(500).json({ success: false, error: 'Failed to process invoice' });
    }
};

export const deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await Invoice.findOne({ _id: id, userId: req.user.userId });

        if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });

        if (invoice.filePath) {
            const filePath = path.resolve(invoice.filePath);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (fsErr) {
                console.error('Failed to delete file:', fsErr);
            }
        }

        await Invoice.deleteOne({ _id: id });

        res.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete invoice' });
    }
};
