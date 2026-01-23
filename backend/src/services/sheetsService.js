import { google } from 'googleapis';
import { getOAuth2Client } from '../config/googleSheets.js';
import User from '../models/User.js';

export const appendToSheet = async (userId, data) => {
    try {
        const user = await User.findById(userId).select('+googleTokens');

        if (!user || !user.googleTokens || !user.googleTokens.refreshToken) {
            throw new Error('User not connected to Google Sheets');
        }

        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({
            refresh_token: user.googleTokens.refreshToken
        });

        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

        await sheets.spreadsheets.values.append({
            spreadsheetId: user.settings.spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [data]
            }
        });

        return true;
    } catch (error) {
        throw error;
    }
}
