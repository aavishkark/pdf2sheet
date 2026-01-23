import mongoose from 'mongoose';

const fieldMappingSchema = new mongoose.Schema({
    pdfFieldName: {
        type: String,
        trim: true
    },
    sheetColumn: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z]+$/, 'Column must be letters (e.g., A, B, AA)']
    },
    extractionRule: {
        type: String,
        required: false
    },
    keywords: [{
        type: String,
        trim: true
    }],
    required: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const vendorMapSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    vendorName: {
        type: String,
        required: [true, 'Vendor name is required'],
        trim: true
    },
    senderEmail: {
        type: String,
        required: [true, 'Sender email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    senderDomain: {
        type: String,
        trim: true,
        lowercase: true
    },
    fieldMappings: {
        invoiceNumber: fieldMappingSchema,
        invoiceDate: fieldMappingSchema,
        totalAmount: fieldMappingSchema,
        vendorName: fieldMappingSchema,
        lineItems: [fieldMappingSchema]
    },
    extractionRules: {
        dateFormat: {
            type: String,
            default: 'MM/DD/YYYY'
        },
        currencySymbol: {
            type: String,
            default: '$'
        }
    },
    confidence: {
        lastScore: {
            type: Number,
            default: 0
        },
        successRate: {
            type: Number,
            default: 100
        },
        totalProcessed: {
            type: Number,
            default: 0
        }
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

vendorMapSchema.index({ userId: 1, senderEmail: 1 }, { unique: true });

vendorMapSchema.pre('save', async function () {
    if (this.isModified('senderEmail')) {
        const parts = this.senderEmail.split('@');
        if (parts.length === 2) {
            this.senderDomain = parts[1];
        }
    }
});

const VendorMap = mongoose.model('VendorMap', vendorMapSchema);

export default VendorMap;
