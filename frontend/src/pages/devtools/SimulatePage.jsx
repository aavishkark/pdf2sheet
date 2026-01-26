import React, { useState, useEffect } from 'react';
import SimulateEmail from '../../components/DevTools/SimulateEmail';
import { Toaster } from 'react-hot-toast';

export default function SimulatePage() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    useEffect(() => {
        const handleStorageChange = () => {
            setDarkMode(localStorage.getItem('darkMode') === 'true');
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('theme-change', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('theme-change', handleStorageChange);
        };
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Toaster position="top-center" />
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Simulate Inbox
                </h1>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Manually upload invoice PDFs to simulate receiving an email from a vendor.
                </p>
            </div>

            <SimulateEmail darkMode={darkMode} />
        </div>
    );
}
