import { useState, useEffect } from 'react';
import { useUpdateSettings } from '../../hooks/useUser';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function GoogleSheetsSection({ user }) {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    const [spreadsheetId, setSpreadsheetId] = useState('');
    const updateSettings = useUpdateSettings();

    useEffect(() => {
        const handleStorageChange = () => {
            setDarkMode(localStorage.getItem('darkMode') === 'true');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (user?.spreadsheetId) {
            setSpreadsheetId(user.spreadsheetId);
        }
    }, [user]);

    const handleConnect = () => {
        const userId = user?._id;
        window.location.href = `${import.meta.env.VITE_API_URL}/sheets/auth?userId=${userId}`;
    };

    const handleDisconnect = async () => {
        try {
            const response = await api.post('/sheets/disconnect');

            if (response.status === 200) {
                toast.success('Disconnected from Google Sheets');
                window.location.reload();
            } else {
                toast.error('Failed to disconnect');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to disconnect');
        }
    };

    const handleSaveSpreadsheet = async () => {
        if (!spreadsheetId.trim()) {
            toast.error('Please enter a spreadsheet ID');
            return;
        }

        try {
            await updateSettings.mutateAsync({ spreadsheetId });
            toast.success('Spreadsheet ID saved successfully');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save spreadsheet ID');
        }
    };

    const handleTestConnection = () => {
        if (user?.hasGoogleConnection && spreadsheetId) {
            toast.success('Connection test feature coming soon');
        } else {
            toast.error('Please connect Google Sheets and enter a spreadsheet ID first');
        }
    };

    return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 transition-colors duration-300`}>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                Google Sheets Connection
            </h2>

            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                                Connection Status
                            </label>
                            {user?.hasGoogleConnection ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className={`text-lg font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                        Connected
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    <span className={`text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Not Connected
                                    </span>
                                </div>
                            )}
                        </div>

                        {user?.hasGoogleConnection ? (
                            <button
                                onClick={handleDisconnect}
                                className={`px-4 py-2 ${darkMode ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'} rounded-xl transition font-medium`}
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-105 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Connect Google Sheets
                            </button>
                        )}
                    </div>

                    {user?.googleEmail && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                            Connected as: <span className="font-medium">{user.googleEmail}</span>
                        </p>
                    )}
                </div>

                <div className={`pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Spreadsheet ID
                    </label>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-3`}>
                        Get this from your Google Sheets URL: https://docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={spreadsheetId}
                            onChange={(e) => setSpreadsheetId(e.target.value)}
                            placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                            className={`flex-1 px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition font-mono text-sm`}
                            disabled={!user?.hasGoogleConnection}
                        />
                        <button
                            onClick={handleSaveSpreadsheet}
                            disabled={!user?.hasGoogleConnection || updateSettings.isPending}
                            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {updateSettings.isPending ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    {user?.hasGoogleConnection && (
                        <button
                            onClick={handleTestConnection}
                            className={`mt-3 px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} rounded-xl transition font-medium text-sm`}
                        >
                            Test Connection
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
