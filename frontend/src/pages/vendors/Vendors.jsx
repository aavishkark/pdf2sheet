
import { useState, useEffect } from 'react';
import { useVendors } from '../../hooks/useVendors';
import AddVendorModal from '../../components/vendors/AddVendorModal';
import EditVendorModal from '../../components/vendors/EditVendorModal';
import toast, { Toaster } from 'react-hot-toast';

export default function Vendors() {
    const { data: vendors, isLoading, error } = useVendors();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);

    useEffect(() => {
        const handleStorageChange = () => {
            setDarkMode(localStorage.getItem('darkMode') === 'true');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (error) {
            toast.error('Failed to load vendors');
        }
    }, [error]);

    return (
        <div className="max-w-7xl">
            <Toaster position="top-center" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Vendors
                    </h1>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        View learned extraction rules and confidence scores
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading vendors...</p>
                </div>
            ) : vendors && vendors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                        <div
                            key={vendor._id}
                            className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} p-6 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                                        {vendor.vendorName}
                                    </h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {vendor.extractionRules ? vendor.extractionRules.length : 0} fields mapped
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {vendor.extractionRules && vendor.extractionRules.slice(0, 3).map((rule, idx) => (
                                    <div key={idx} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                                        <span className={`w-2 h-2 rounded-full ${rule.method === 'coordinate' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                        {rule.targetField}
                                    </div>
                                ))}
                                {vendor.extractionRules && vendor.extractionRules.length > 3 && (
                                    <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        +{vendor.extractionRules.length - 3} more
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setEditingVendor(vendor)}
                                className={`w-full py-2.5 px-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} font-medium rounded-xl transition flex items-center justify-center gap-2`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-12 text-center transition-colors duration-300`}>
                    <div className={`w-24 h-24 mx-auto mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center transition-colors duration-300`}>
                        <svg className={`w-12 h-12 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        No vendors discovered yet
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                        Upload an invoice to automatically create a vendor key.
                    </p>
                </div>
            )}

            <AddVendorModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
            />

            <EditVendorModal
                isOpen={!!editingVendor}
                onClose={() => setEditingVendor(null)}
                vendor={editingVendor}
            />
        </div>
    );
}
