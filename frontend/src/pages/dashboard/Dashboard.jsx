import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useInvoices from '../../hooks/useInvoices';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import TextReveal from '../../components/common/TextReveal';
import { motion } from 'framer-motion';
import { 
    FileText, 
    CheckCircle, 
    Clock, 
    MoreHorizontal, 
    Trash2, 
    Edit3,
    AlertCircle,
    Mail
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
    const { data: invoices, isLoading, error, refetch } = useInvoices();
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

    const handleReviewClick = (invoice) => {
        navigate(`/review/${invoice._id}`);
    };

    const getStatusBadge = (invoice) => {
        if (invoice.status === 'processed') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Processed
                </span>
            );
        }
        return (
            <button
                onClick={() => handleReviewClick(invoice)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
                <Clock className="w-3.5 h-3.5" />
                Review Needed
            </button>
        );
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="max-w-7xl mx-auto space-y-8 relative z-10"
        >
            <Toaster position="top-center" />

            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight mb-2", darkMode ? "text-white" : "text-gray-900")}>
                        <TextReveal delay={0.1}>Dashboard</TextReveal>
                    </h1>
                    <p className={cn(darkMode ? "text-gray-400" : "text-gray-500")}>
                        <TextReveal delay={0.2}>Overview of your automated invoice processing.</TextReveal>
                    </p>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Invoices', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Successfully Processed', value: stats.processed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { label: 'Action Required', value: stats.review, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map((stat, index) => (
                    <div 
                        key={index} 
                        className={cn(
                            "relative overflow-hidden rounded-2xl p-6 border shadow-sm transition-all duration-200 hover:shadow-md",
                            darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={cn("text-sm font-medium mb-2", darkMode ? "text-gray-400" : "text-gray-500")}>
                                    {stat.label}
                                </p>
                                <p className={cn("text-3xl font-bold tracking-tight", darkMode ? "text-white" : "text-gray-900")}>
                                    {stat.value}
                                </p>
                            </div>
                            <div className={cn("p-3 rounded-full", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Main Table Section */}
            <motion.div variants={itemVariants} className={cn(
                "rounded-2xl border shadow-sm overflow-hidden",
                darkMode ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-200"
            )}>
                <div className={cn("p-6 border-b", darkMode ? "border-gray-700/50" : "border-gray-100")}>
                    <h2 className={cn("text-lg font-semibold", darkMode ? "text-white" : "text-gray-900")}>
                        Recent Invoices
                    </h2>
                </div>

                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Loading your data...</p>
                    </div>
                ) : invoices && invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className={cn(
                                "text-xs uppercase font-medium tracking-wider",
                                darkMode ? "bg-gray-900/50 text-gray-400" : "bg-gray-50/50 text-gray-500"
                            )}>
                                <tr>
                                    <th className="px-6 py-4">Sender</th>
                                    <th className="px-6 py-4">Invoice #</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={cn(
                                "divide-y",
                                darkMode ? "divide-gray-700/50" : "divide-gray-100"
                            )}>
                                {invoices.map((invoice, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={invoice._id} 
                                        className={cn(
                                            "group transition-colors",
                                            darkMode ? "hover:bg-gray-700/30" : "hover:bg-gray-50"
                                        )}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                    darkMode ? "bg-gray-700" : "bg-gray-100"
                                                )}>
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={cn("font-medium", darkMode ? "text-gray-200" : "text-gray-900")}>
                                                        {invoice.vendorName || 'Unknown Vendor'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {invoice.senderEmail || 'No Email'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={cn("px-6 py-4", darkMode ? "text-gray-300" : "text-gray-600")}>
                                            {invoice.extractedData?.invoiceNumber || <span className="text-gray-400 italic">Pending</span>}
                                        </td>
                                        <td className={cn("px-6 py-4", darkMode ? "text-gray-300" : "text-gray-600")}>
                                            {invoice.extractedData?.invoiceDate || '—'}
                                        </td>
                                        <td className={cn("px-6 py-4 font-medium", darkMode ? "text-white" : "text-gray-900")}>
                                            ${invoice.extractedData?.totalAmount || '0.00'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(invoice)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleReviewClick(invoice)}
                                                    className={cn(
                                                        "p-2 rounded-md transition-colors",
                                                        darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"
                                                    )}
                                                    title="Review / Edit"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(invoice._id)}
                                                    className="p-2 rounded-md transition-colors hover:bg-red-50 hover:text-red-600 text-gray-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed",
                            darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                        )}>
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className={cn("text-lg font-medium mb-1", darkMode ? "text-gray-200" : "text-gray-900")}>
                            No invoices found
                        </h3>
                        <p className={cn("text-sm max-w-sm", darkMode ? "text-gray-400" : "text-gray-500")}>
                            Wait for your email integration to pull in new invoices, or connect your inbox in settings.
                        </p>
                    </div>
                )}
            </motion.div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                title="Delete Invoice"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                confirmText="Delete"
                isDanger={true}
            />
        </motion.div>
    );
}
