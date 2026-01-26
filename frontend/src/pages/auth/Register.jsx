import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            toast.success('Account created! You can now log in.');
            navigate('/login');
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.details && errorData.details.length > 0) {
                errorData.details.forEach(detail => {
                    toast.error(detail.message);
                });
            } else {
                toast.error(errorData?.error || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'} flex items-center justify-center p-4 transition-colors duration-300`}>
            <Toaster position="top-center" />

            <button
                onClick={() => setDarkMode(!darkMode)}
                className={`fixed top-6 right-6 p-3 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-600'} shadow-lg hover:scale-110 transition-transform duration-200 z-50`}
                aria-label="Toggle dark mode"
            >
                {darkMode ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                )}
            </button>

            <div className={`w-full max-w-5xl ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 transition-colors duration-300`}>
                <div className="p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <div className="text-pink-500 font-bold text-sm mb-2">PDF2SHEET</div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Create your account</p>
                        <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sign Up</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    First name
                                </label>
                                <input
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-blue-50/50 border-blue-100 text-gray-900 placeholder-gray-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition`}
                                    placeholder="first name"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Last name
                                </label>
                                <input
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-blue-50/50 border-blue-100 text-gray-900 placeholder-gray-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition`}
                                    placeholder="last name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-blue-50/50 border-blue-100 text-gray-900 placeholder-gray-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition`}
                                placeholder="name@domain.com"
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-blue-50/50 border-blue-100 text-gray-900 placeholder-gray-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition`}
                                placeholder="••••••••"
                            />
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Must be at least 6 characters</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating account...' : 'SIGN UP'}
                            {!loading && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Already have an account?{' '}
                            <Link to="/login" className="text-pink-500 hover:text-pink-600 font-semibold transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <div className={`hidden md:flex ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900' : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'} items-center justify-center p-12 relative overflow-hidden transition-colors duration-300`}>
                    <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-blue-900/30' : 'bg-gradient-to-br from-blue-200/30 via-purple-200/30 to-pink-200/30'}`}></div>
                    <div className="relative z-10 text-center">
                        <div className={`w-80 h-80 mx-auto mb-6 ${darkMode ? 'bg-gray-800/20' : 'bg-white/20'} backdrop-blur-sm rounded-3xl flex items-center justify-center`}>
                            <svg className={`w-64 h-64 ${darkMode ? 'text-pink-400' : 'text-pink-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                            Join Thousands of Users
                        </h2>
                        <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            Automate invoice processing in seconds
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
