import { getOAuth2Client } from '../config/googleSheets.js';
import User from '../models/User.js';

export const getAuthUrl = (req, res) => {
    const oauth2Client = getOAuth2Client();

    const scopes = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });

    res.json({ url });
};

export const oauthCallback = async (req, res) => {
    const { code, userId } = req.body;

    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        await User.findByIdAndUpdate(userId, {
            googleTokens: tokens
        });

        res.json({ success: true, message: 'Google Sheets connected successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateSpreadsheetId = async (req, res) => {
    try {
        const { spreadsheetId } = req.body;

        await User.findByIdAndUpdate(req.user.userId, {
            'settings.spreadsheetId': spreadsheetId
        });

        res.json({ success: true, message: 'Spreadsheet ID updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
