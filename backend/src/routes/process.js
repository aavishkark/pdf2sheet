import express from 'express';
import multer from 'multer';
import { processPdf } from '../controllers/processController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);

router.post('/upload', upload.single('pdf'), processPdf);

export default router;
