import Invoice from '../models/Invoice.js';

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
