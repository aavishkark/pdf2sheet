import express from 'express';
import {
    createVendor,
    getVendors,
    getVendor,
    updateVendor,
    deleteVendor
} from '../controllers/vendorController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.route('/')
    .get(getVendors)
    .post(createVendor);

router.route('/:id')
    .get(getVendor)
    .put(updateVendor)
    .delete(deleteVendor);

export default router;
