import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAuthUrl, oauthCallback, updateSpreadsheetId, disconnectSheets } from '../controllers/sheetsController.js';
import { getOAuth2Client } from '../config/googleSheets.js';
import { google } from 'googleapis';
import User from '../models/User.js';

const router = express.Router();

router.get('/auth', (req, res) => {
    const oauth2Client = getOAuth2Client();
    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state: req.query.userId || ''
    });
    res.redirect(url);
});

router.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Received tokens from Google:', tokens);

        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        if (state) {
            console.log('Updating user tokens for userId:', state);
            const userUpdate = await User.findByIdAndUpdate(state, {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
                googleEmail: userInfo.data.email,
                'settings.hasGoogleConnection': true
            }, { new: true });
            console.log('User update validation:', userUpdate ? 'Success' : 'User invalid');
        }

        res.redirect(`${process.env.FRONTEND_URL}/settings?connected=true`);
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/settings?error=oauth_failed`);
    }
});



router.get('/auth-url', authenticateToken, getAuthUrl);
router.post('/callback-manual', authenticateToken, oauthCallback);
router.put('/settings', authenticateToken, updateSpreadsheetId);
router.post('/disconnect', authenticateToken, disconnectSheets);

export default router;
