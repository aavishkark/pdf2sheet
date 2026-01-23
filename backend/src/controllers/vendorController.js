import VendorMap from '../models/VendorMap.js';

export const createVendor = async (req, res, next) => {
    try {
        const { vendorName, senderEmail, fieldMappings, extractionRules } = req.body;
        const userId = req.user.userId;

        const existingVendor = await VendorMap.findOne({ userId, senderEmail });
        if (existingVendor) {
            return res.status(400).json({
                success: false,
                error: 'Vendor mapping for this email already exists'
            });
        }

        const vendorMap = await VendorMap.create({
            userId,
            vendorName,
            senderEmail,
            fieldMappings,
            extractionRules
        });

        res.status(201).json({
            success: true,
            data: vendorMap
        });
    } catch (error) {
        next(error);
    }
};

export const getVendors = async (req, res, next) => {
    try {
        const vendors = await VendorMap.find({ userId: req.user.userId })
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    } catch (error) {
        next(error);
    }
};

export const getVendor = async (req, res, next) => {
    try {
        const vendor = await VendorMap.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor mapping not found'
            });
        }

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        next(error);
    }
};

export const updateVendor = async (req, res, next) => {
    try {
        let vendor = await VendorMap.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor mapping not found'
            });
        }

        req.body.version = vendor.version + 1;

        vendor = await VendorMap.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        next(error);
    }
};

export const deleteVendor = async (req, res, next) => {
    try {
        const vendor = await VendorMap.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor mapping not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
