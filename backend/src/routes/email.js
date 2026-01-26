import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import VendorMap from '../models/VendorMap.js';
import { extractData, calculateConfidence } from '../services/extractionService.js';
import Invoice from '../models/Invoice.js';
import { appendToSheet } from '../services/sheetsService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/test-upload', authenticateToken, upload.single('invoice'), async (req, res, next) => {
    try {
        const { vendorEmail, vendorName } = req.body;
        const pdfBuffer = req.file.buffer;

        console.log(`[Version 2.0] Processing Upload. Email: '${vendorEmail}', Name: '${vendorName}'`);

        console.log(`[Upload] File received: ${req.file.originalname}, Size: ${req.file.size}, Buffer: ${req.file.buffer ? 'Present' : 'MISSING'}`);

        if (!pdfBuffer) {
            return res.status(400).json({ success: false, error: 'File buffer missing. Multer config?' });
        }

        if (!vendorEmail && !vendorName) {
            return res.status(400).json({
                success: false,
                error: 'Please provide either vendor email or vendor name'
            });
        }

        let query = { userId: req.user.userId };
        const conditions = [];

        if (vendorEmail) {
            conditions.push({ senderEmail: vendorEmail.trim().toLowerCase() });
        }
        if (vendorName) {
            conditions.push({ vendorName: { $regex: new RegExp(`^${vendorName.trim()}$`, 'i') } });
        }

        if (conditions.length > 0) {
            query.$or = conditions;
        }

        console.log('Searching for vendor with query:', query);
        const vendor = await VendorMap.findOne(query).lean();

        if (!vendor) {
            console.log('Vendor not found. Creating "Review Needed" invoice.');

            let guessedVendorName = null;
            let heuristicData = {};

            try {
                const { results, fullText } = await extractData(pdfBuffer, []);
                heuristicData = results;
                console.log('Heuristic Extraction Result:', JSON.stringify(heuristicData, null, 2));

                const allVendors = await VendorMap.find({ userId: req.user.userId }).select('vendorName');
                for (const v of allVendors) {
                    if (fullText && fullText.toLowerCase().includes(v.vendorName.toLowerCase())) {
                        console.log(`[Heuristic] Found potential vendor match in text: "${v.vendorName}"`);
                        guessedVendorName = v.vendorName;
                        break;
                    }
                }
            } catch (err) {
                console.error('Heuristic extraction failed:', err);
            }

            const reviewInvoice = await Invoice.create({
                userId: req.user.userId,
                vendorName: guessedVendorName || undefined,
                senderEmail: vendorEmail,
                status: 'review_needed',
                originalFileName: req.file ? req.file.originalname : 'unknown_file.pdf',
                confidenceScore: 0,
                processedAt: new Date(),
                extractedData: heuristicData,
                pdfData: pdfBuffer,
                contentType: 'application/pdf'
            });

            console.log(`[NOTIFICATION] Sending "New Vendor Detected" email TO USER: ${req.user.email} (Vendor: ${vendorEmail || 'Unknown'})`);

            return res.status(201).json({
                success: true,
                message: 'Vendor not found. Invoice saved for review.',
                data: {
                    invoiceId: reviewInvoice._id,
                    status: 'review_needed',
                    reason: 'Unknown Vendor'
                }
            });
        }

        const { results: extractedData } = await extractData(pdfBuffer, vendor.extractionRules);

        const confidence = calculateConfidence(extractedData, vendor.extractionRules);

        const invoice = await Invoice.create({
            userId: req.user.userId,
            vendorId: vendor._id,
            vendorName: vendor.vendorName,
            senderEmail: vendor.senderEmail || vendorEmail,
            extractedData,
            confidenceScore: confidence,
            status: confidence >= 70 ? 'processed' : 'review_needed',
            originalFileName: req.file.originalname,
            processedAt: new Date(),
            pdfData: pdfBuffer,
            contentType: 'application/pdf'
        });

        if (invoice.status === 'processed') {
            try {
                const rowData = [
                    extractedData.invoiceDate || '',
                    vendor.vendorName || '',
                    extractedData.invoiceNumber || '',
                    extractedData.totalAmount || ''
                ];

                await appendToSheet(req.user.userId, rowData);
                console.log('Added to Google Sheet');
            } catch (sheetError) {
                console.error('Failed to update Google Sheet:', sheetError.message);
            }
        } else if (invoice.status === 'review_needed') {
            console.log(`[NOTIFICATION] Sending "Low Confidence Breakdown" email to user: ${req.user.email}`);
        }

        res.status(201).json({
            success: true,
            message: 'Invoice processed successfully',
            data: {
                invoiceId: invoice._id,
                vendorName: vendor.vendorName,
                confidence,
                status: invoice.status,
                extractedData
            }
        });
    } catch (error) {
        next(error);
    }
});


export default router;
