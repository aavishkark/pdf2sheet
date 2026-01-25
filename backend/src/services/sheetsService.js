import { google } from 'googleapis';
import User from '../models/User.js';

const connectSheets = async (auth) => {
    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
};

export const appendRow = async (auth, spreadsheetId, values) => {
    try {
        const sheets = await connectSheets(auth);
        const request = {
            spreadsheetId,
            range: 'Sheet1!A:Z',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [values],
            },
        };
        const response = await sheets.spreadsheets.values.append(request);
        return response.data;
    } catch (err) {
        console.error('Sheets Append Error:', err);
        throw err;
    }
};

export const appendToSheet = async (userId, rowData) => {
    try {
        const user = await User.findById(userId).select('+googleAccessToken +googleRefreshToken');
        if (!user || !user.googleSheetId) {
            throw new Error('User not found or Spreadsheet not connected');
        }

        const auth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        auth.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        return await appendRow(auth, user.googleSheetId, rowData);

    } catch (error) {
        console.error('Error in appendToSheet:', error);
        throw error;
    }
};
