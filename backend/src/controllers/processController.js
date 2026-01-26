import { extractData, calculateConfidence } from '../services/extractionService.js';
import VendorMap from '../models/VendorMap.js';

export const processPdf = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded'
        });
    }

    try {
        const { results: extracted, fullText: text } = await extractData(req.file.buffer, []);

        if (req.body.vendorId) {
            let vendor = await VendorMap.findById(req.body.vendorId).lean();

            if (vendor) {
                const { results: vendorExtracted } = await extractData(req.file.buffer, vendor.extractionRules || []);
                let confidence = calculateConfidence(vendorExtracted, vendor.extractionRules || []);

                return res.json({
                    success: true,
                    text: text,
                    data: vendorExtracted,
                    confidence: confidence
                });
            }
        }

        let confidence = calculateConfidence(extracted, []);
        res.json({
            success: true,
            text: text,
            data: extracted,
            confidence: confidence
        });

        res.json({
            success: true,
            text: text
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
}
