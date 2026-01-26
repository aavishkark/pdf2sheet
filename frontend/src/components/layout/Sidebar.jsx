import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        const handleStorageChange = () => {
            setDarkMode(localStorage.getItem('darkMode') === 'true');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/vendors', label: 'Vendors' },
        { path: '/settings', label: 'Settings' },
        { path: '/simulate', label: 'Simulate Inbox' }
    ];

    return (
        <div className={`w-64 h-screen ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r flex flex-col transition-colors duration-300`}>
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-pink-500">PDF2SHEET</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Invoice Automation</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                                : darkMode
                                    ? 'text-gray-300 hover:bg-gray-800'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>Need help?</p>
                <a
                    href="#"
                    className={`text-sm ${darkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-500 hover:text-pink-600'} transition`}
                >
                    View Documentation →
                </a>
            </div>
        </div>
    );
}
