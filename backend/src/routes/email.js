import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.js';
import VendorMap from '../models/VendorMap.js';
import { readPdfBuffer } from '../utils/pdfHelper.js';
import { extractData, calculateConfidence } from '../utils/extractData.js';
import Invoice from '../models/Invoice.js';
import { appendToSheet } from '../services/sheetsService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/test-upload', authenticateToken, upload.single('invoice'), async (req, res, next) => {
    try {
        const { vendorEmail, vendorName } = req.body;
        const pdfBuffer = req.file?.buffer;

        if (!pdfBuffer) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file'
            });
        }

        if (!vendorEmail && !vendorName) {
            return res.status(400).json({
                success: false,
                error: 'Please provide either vendor email or vendor name'
            });
        }

        let query = { userId: req.user.userId };
        if (vendorEmail) {
            query.senderEmail = vendorEmail;
        } else {
            query.vendorName = { $regex: new RegExp(`^${vendorName.trim()}$`, 'i') };
        }

        console.log('Searching for vendor with query:', query);
        const vendor = await VendorMap.findOne(query).lean();

        if (!vendor) {
            console.log('Vendor not found. Creating "Review Needed" invoice.');

            const reviewInvoice = await Invoice.create({
                userId: req.user.userId,
                senderEmail: vendorEmail,
                status: 'review_needed',
                originalFileName: req.file ? req.file.originalname : 'unknown_file.pdf',
                confidenceScore: 0,
                processedAt: new Date(),
                extractedData: {}
            });

            console.log(`[NOTIFICATION] Sending "New Vendor Detected" email to user: ${req.user.email}`);

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

        const pdfText = await readPdfBuffer(pdfBuffer);
        const extractedData = extractData(pdfText, vendor.fieldMappings);
        const confidence = calculateConfidence(extractedData, vendor.fieldMappings);

        const invoice = await Invoice.create({
            userId: req.user.userId,
            vendorId: vendor._id,
            vendorName: vendor.vendorName,
            senderEmail: vendor.senderEmail || vendorEmail,
            extractedData,
            confidenceScore: confidence,
            status: confidence >= 70 ? 'processed' : 'review_needed',
            originalFileName: req.file.originalname,
            processedAt: new Date()
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
