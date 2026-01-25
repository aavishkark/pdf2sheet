import mongoose from 'mongoose';

const extractionRuleSchema = new mongoose.Schema({
    targetField: {
        type: String,
        required: true,
        enum: ['invoiceDate', 'invoiceNumber', 'totalAmount', 'vendorName', 'dueDate']
    },
    method: {
        type: String,
        required: true,
        enum: ['regex', 'coordinate', 'keyword_proximity']
    },
    removePattern: { type: String },
    regexPattern: { type: String },
    coordinates: {
        x: Number,
        y: Number,
        w: Number,
        h: Number,
        page: { type: Number, default: 1 }
    },

    keyword: { type: String },
    searchDirection: {
        type: String,
        enum: ['right', 'below', 'auto'],
        default: 'right'
    }
});

const vendorMapSchema = new mongoose.Schema({
    vendorName: {
        type: String,
        required: true,
        trim: true
    },
    senderEmail: {
        type: String,
        lowercase: true,
        trim: true,
        index: true
    },
    domain: {
        type: String,
        lowercase: true,
        trim: true
    },
    layoutSignature: {
        type: String,
    },
    extractionRules: [extractionRuleSchema],
    confidenceThreshold: {
        type: Number,
        default: 80
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


const VendorMap = mongoose.model('VendorMap', vendorMapSchema);

export default VendorMap;
