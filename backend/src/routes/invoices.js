import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getInvoices } from '../controllers/invoiceController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getInvoices);

export default router;
