import express from 'express';
import multer from 'multer';
import { receiveEmailWebhook } from '../controllers/emailController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/receive', upload.single('attachment'), receiveEmailWebhook);

export default router;
