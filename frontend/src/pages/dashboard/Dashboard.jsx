import { useState, useEffect } from 'react';
import useInvoices from '../../hooks/useInvoices';
import toast, { Toaster } from 'react-hot-toast';
import ReviewInvoiceModal from '../../components/invoices/ReviewInvoiceModal';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';

import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { data: invoices, isLoading, error, refetch } = useInvoices();
    const navigate = useNavigate();
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



    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            await api.delete(`/invoices/${deleteId}`);
            toast.success('Invoice deleted');
            refetch();
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete invoice');
        }
    };

    const handleUpdateInvoice = async (id, updates) => {
        try {
            await api.put(`/invoices/${id}`, updates);
            toast.success('Invoice updated successfully');
            refetch();
        } catch (error) {
            console.error('Failed to update invoice:', error);
            toast.error('Failed to update invoice');
        }
    };

    const handleReviewClick = (invoice) => {
        navigate(`/review/${invoice._id}`);
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
                            <thead className={darkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}>
                                <tr>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sender Email</th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Invoice #</th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date</th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Due Date</th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Amount</th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Confidence</th>
                                    <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status</th>
                                    <th className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {invoices.map((invoice) => (
                                    <tr key={invoice._id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition`}>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                                            <div className="flex flex-col">
                                                <span>{invoice.senderEmail || 'No Email'}</span>
                                                {invoice.vendorName && <span className="text-xs text-gray-500">{invoice.vendorName}</span>}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {invoice.extractedData?.invoiceNumber || 'N/A'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {invoice.extractedData?.invoiceDate || 'N/A'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {invoice.extractedData?.dueDate || 'N/A'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>
                                            ${invoice.extractedData?.totalAmount || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {invoice.confidenceScore || 0}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(invoice)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center space-x-3">
                                                <button
                                                    onClick={() => handleReviewClick(invoice)}
                                                    className="text-blue-500 hover:text-blue-700 transition"
                                                    title="Edit / Review"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(invoice._id)}
                                                    className="text-red-500 hover:text-red-700 transition"
                                                    title="Delete"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
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

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                confirmText="Delete"
                isDanger={true}
            />

            <ReviewInvoiceModal
                isOpen={isReviewOpen}
                invoice={selectedInvoice}
                onClose={() => setIsReviewOpen(false)}
                onUpdate={handleUpdateInvoice}
            />
        </div>
    );
}
