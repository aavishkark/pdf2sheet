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
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token,
            'settings.hasGoogleConnection': true
        });

        res.json({ success: true, message: 'Google Sheets connected successfully' });
    } catch (error) {
        console.error('OAuth Callback Error:', error);
        res.status(500).json({ success: false, error: 'Failed to connect Google Sheets' });
    }
};

export const updateSpreadsheetId = async (req, res) => {
    try {
        const { spreadsheetId } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) return res.status(404).json({ error: 'User not found' });

        user.googleSheetId = spreadsheetId;
        await user.save();

        res.json({ success: true, message: 'Spreadsheet ID updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update spreadsheet ID' });
    }
};

export const disconnectSheets = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        user.googleAccessToken = null;
        user.googleRefreshToken = null;
        user.googleSheetId = null;
        user.settings.hasGoogleConnection = false;
        await user.save();
        res.json({ success: true, message: 'Disconnected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to disconnect' });
    }
};
