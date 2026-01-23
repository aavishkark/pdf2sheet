import { readPdfBuffer } from '../utils/pdfHelper.js';
import { extractData, calculateConfidence } from '../utils/extractData.js';
import VendorMap from '../models/VendorMap.js';

export const processPdf = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded'
        });
    }

    try {
        let text = await readPdfBuffer(req.file.buffer);

        if (req.body.vendorId) {
            let vendor = await VendorMap.findById(req.body.vendorId).lean();

            if (vendor) {
                let mappings = vendor.fieldMappings;
                let extracted = extractData(text, mappings);
                let confidence = calculateConfidence(extracted, mappings);

                return res.json({
                    success: true,
                    text: text,
                    data: extracted,
                    confidence: confidence
                });
            }
        }

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
