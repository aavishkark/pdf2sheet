import Invoice from '../models/Invoice.js';
import VendorMap from '../models/VendorMap.js';
import User from '../models/User.js';
import { extractData, calculateConfidence } from '../services/extractionService.js';

export const receiveEmailWebhook = async (req, res) => {
    try {
        let sender = req.body.sender;
        let subject = req.body.subject;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No PDF attachment found'
            });
        }

        let user = await User.findOne({
            'settings.forwardingEmail': req.body.to
        });

        if (!user) {
            if (req.body.userId) {
                user = await User.findById(req.body.userId);
            }
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found for this forwarding address'
            });
        }

        let vendor = await VendorMap.findOne({
            userId: user._id,
            senderEmail: sender
        });

        let extractedData = {};
        let confidence = 0;

        const { results } = await extractData(req.file.buffer, vendor ? vendor.extractionRules : []);
        extractedData = results;
        confidence = calculateConfidence(extractedData, vendor ? vendor.extractionRules : []);

        let status = 'review_needed';
        if (confidence > 80) {
            status = 'processed';
        }

        let invoice = await Invoice.create({
            userId: user._id,
            vendorMapId: vendor ? vendor._id : null,
            senderEmail: sender,
            originalFileName: req.file.originalname,
            status: status,
            extractedData: extractedData,
            confidenceScore: confidence,
            processedAt: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Email processed successfully',
            invoiceId: invoice._id,
            data: extractedData,
            confidence: confidence
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}
