import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendorMapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VendorMap'
    },
    senderEmail: {
        type: String,
        required: false,
        lowercase: true,
        trim: true
    },
    vendorName: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'failed', 'review_needed'],
        default: 'pending'
    },
    extractedData: {
        invoiceNumber: String,
        invoiceDate: String,
        totalAmount: String,
        dueDate: String,
        lineItems: []
    },
    confidenceScore: {
        type: Number,
        default: 0
    },
    originalFileName: String,
    processedAt: Date,
    pdfData: {
        type: Buffer,
        required: false
    },
    contentType: {
        type: String,
        default: 'application/pdf'
    }
}, {
    timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
