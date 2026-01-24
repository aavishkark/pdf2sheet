import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getInvoices, updateInvoice } from '../controllers/invoiceController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getInvoices);
router.put('/:id', updateInvoice);

export default router;
