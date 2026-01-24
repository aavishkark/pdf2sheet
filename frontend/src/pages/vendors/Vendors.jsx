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

    const getFieldCount = (vendor) => {
        if (!vendor.fieldMappings) return 0;
        return Object.keys(vendor.fieldMappings).filter(key => key !== 'lineItems').length;
    };

    return (
        <div className="max-w-7xl">
            <Toaster position="top-center" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Vendors
                    </h1>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Configure vendor-specific extraction rules
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-105 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Vendor
                </button>
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
                                        {getFieldCount(vendor)} field{getFieldCount(vendor) !== 1 ? 's' : ''} mapped
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                {vendor.fieldMappings && Object.keys(vendor.fieldMappings).filter(key => key !== 'lineItems').slice(0, 3).map((fieldName) => (
                                    <div key={fieldName} className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center gap-2`}>
                                        <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        {fieldName}
                                    </div>
                                ))}
                                {getFieldCount(vendor) > 3 && (
                                    <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        +{getFieldCount(vendor) - 3} more
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setEditingVendor(vendor)}
                                className={`w-full py-2.5 px-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'} font-medium rounded-xl transition flex items-center justify-center gap-2`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Configuration
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
                        No vendors configured yet
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                        Add your first vendor to start configuring extraction rules
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-105 inline-flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Your First Vendor
                    </button>
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
