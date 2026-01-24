import User from '../models/User.js';

export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const hasGoogleTokens = !!(user.googleTokens && user.googleTokens.access_token);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                hasGoogleConnection: hasGoogleTokens,
                googleEmail: user.googleTokens?.email || null,
                spreadsheetId: user.settings?.spreadsheetId || null
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserSettings = async (req, res, next) => {
    try {
        const { spreadsheetId } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            {
                'settings.spreadsheetId': spreadsheetId
            },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        res.status(200).json({
            success: true,
            data: {
                spreadsheetId: user.settings.spreadsheetId
            }
        });
    } catch (error) {
        next(error);
    }
};
