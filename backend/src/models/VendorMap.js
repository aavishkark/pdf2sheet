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
        enum: ['regex', 'coordinate', 'keyword_proximity'],
        default: 'keyword_proximity'
    },
    coordinates: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        pageIndex: { type: Number, default: 0 }
    },
    keyword: { type: String },
    searchDirection: {
        type: String,
        enum: ['right', 'below', 'auto'],
        default: 'right'
    },
    regexPattern: { type: String },
    removePattern: { type: String },
    confidence: { type: Number, default: 0 }
});

const vendorMapSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
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
