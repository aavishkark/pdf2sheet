import { useState, useEffect } from 'react';
import useInvoices from '../../hooks/useInvoices';
import toast, { Toaster } from 'react-hot-toast';
import ReviewInvoiceModal from '../../components/invoices/ReviewInvoiceModal';

export default function Dashboard() {
    const { data: invoices, isLoading, error, refetch } = useInvoices(); // Add refetch
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

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

    useEffect(() => {
        if (error) {
            toast.error('Failed to load invoices');
        }
    }, [error]);

    const stats = {
        total: invoices?.length || 0,
        processed: invoices?.filter(inv => inv.status === 'processed')?.length || 0,
        review: invoices?.filter(inv => inv.status === 'review_needed')?.length || 0
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleUpdateInvoice = async (id, updates) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/invoices/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });
        refetch(); // Reload data
    };

    const handleReviewClick = (invoice) => {
        setSelectedInvoice(invoice);
        setIsReviewOpen(true);
    };

    const getStatusBadge = (invoice) => {
        if (invoice.status === 'processed') {
            return <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">Processed</span>;
        }
        return (
            <button
                onClick={() => handleReviewClick(invoice)}
                className="px-3 py-1 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 transition rounded-full text-xs font-semibold flex items-center gap-1"
            >
                Review Needed
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
        );
    };

    return (
        <div className="max-w-7xl">
            <Toaster position="top-center" />

            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Welcome back!
                </h1>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Here's what's happening with your invoices
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg transition-colors duration-300`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Invoices</p>
                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg transition-colors duration-300`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Processed</p>
                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.processed}</p>
                        </div>
                    </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-2xl shadow-lg transition-colors duration-300`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Needs Review</p>
                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stats.review}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg transition-colors duration-300`}>
                <div className="p-6 border-b border-gray-700">
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Recent Invoices
                    </h2>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading invoices...</p>
                    </div>
                ) : invoices && invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Invoice #</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Confidence</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {invoices.map((invoice) => (
                                    <tr key={invoice._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                                            {invoice.vendorName || 'Unknown Vendor'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {invoice.extractedData?.invoiceNumber || 'N/A'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {invoice.extractedData?.invoiceDate || 'N/A'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                                            ${invoice.extractedData?.totalAmount || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {Math.round((invoice.confidenceScore || 0) * 100)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(invoice)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No invoices yet</p>
                    </div>
                )}
            </div>

            <ReviewInvoiceModal
                isOpen={isReviewOpen}
                invoice={selectedInvoice}
                onClose={() => setIsReviewOpen(false)}
                onUpdate={handleUpdateInvoice}
            />
        </div>
    );
}
