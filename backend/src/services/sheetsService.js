import { google } from 'googleapis';
import { getOAuth2Client } from '../config/googleSheets.js';
import User from '../models/User.js';

export const appendToSheet = async (userId, data) => {
    try {
        const user = await User.findById(userId).select('+googleTokens');

        console.log('Sheet Service - Full User Object:', JSON.stringify(user, null, 2));
        console.log('Sheet Service - Google Tokens:', user.googleTokens);

        console.log('Sheet Service - User Settings:', user.settings);

        if (!user || !user.googleTokens || !user.googleTokens.refresh_token) {
            throw new Error('User not connected to Google Sheets');
        }

        if (!user.settings || !user.settings.spreadsheetId) {
            throw new Error('Spreadsheet ID not configured in settings');
        }

        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({
            refresh_token: user.googleTokens.refresh_token
        });

        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

        console.log('Appending to spreadsheet:', user.settings.spreadsheetId);

        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: user.settings.spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [data]
            }
        });

        console.log('Google Sheets API Response:', JSON.stringify(response.data, null, 2));

        return true;
    } catch (error) {
        throw error;
    }
}
