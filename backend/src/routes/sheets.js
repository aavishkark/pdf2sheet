import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAuthUrl, oauthCallback, updateSpreadsheetId } from '../controllers/sheetsController.js';

const router = express.Router();

router.get('/auth-url', authenticateToken, getAuthUrl);
router.post('/callback', authenticateToken, oauthCallback);
router.put('/settings', authenticateToken, updateSpreadsheetId);

export default router;
