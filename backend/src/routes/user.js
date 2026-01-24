import express from 'express';
import { getUserProfile, updateUserSettings } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);
router.put('/settings', authenticateToken, updateUserSettings);

export default router;
