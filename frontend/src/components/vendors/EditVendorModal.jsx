import { useState, useEffect } from 'react';
import { useUpdateVendor, useDeleteVendor } from '../../hooks/useVendors';
import FieldMappingRow from './FieldMappingRow';
import PdfPreview from '../mapping/PdfPreview';
import toast from 'react-hot-toast';

export default function EditVendorModal({ isOpen, onClose, vendor }) {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });
    const [vendorName, setVendorName] = useState('');
    const [fieldMappings, setFieldMappings] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // PDF Preview State
    const [previewFile, setPreviewFile] = useState(null);

    const updateVendor = useUpdateVendor();
    const deleteVendor = useDeleteVendor();

    useEffect(() => {
        const handleStorageChange = () => {
            setDarkMode(localStorage.getItem('darkMode') === 'true');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        if (vendor) {
            setVendorName(vendor.vendorName || '');

            const mappings = [];
            if (vendor.fieldMappings) {
                Object.entries(vendor.fieldMappings).forEach(([key, value]) => {
                    if (key !== 'lineItems') {
                        mappings.push({
                            name: key,
                            extractionRule: value.extractionRule || '',
                            keywords: Array.isArray(value.keywords) ? value.keywords.join(', ') : ''
                        });
                    }
                });
            }
            setFieldMappings(mappings);
        }
    }, [vendor]);

    const addField = () => {
        setFieldMappings([...fieldMappings, { name: '', extractionRule: '', keywords: '' }]);
    };

    const updateField = (index, updatedField) => {
        const newMappings = [...fieldMappings];
        newMappings[index] = updatedField;
        setFieldMappings(newMappings);
    };

    const removeField = (index) => {
        setFieldMappings(fieldMappings.filter((_, i) => i !== index));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPreviewFile(file);
        } else {
            toast.error('Please upload a valid PDF file');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!vendorName.trim()) {
            toast.error('Please enter a vendor name');
            return;
        }

        const mappings = {};
        fieldMappings.forEach(field => {
            if (field.name) {
                const mapping = {};
                if (field.extractionRule) mapping.extractionRule = field.extractionRule;
                if (field.keywords) mapping.keywords = field.keywords.split(',').map(k => k.trim());

                if (Object.keys(mapping).length > 0) {
                    mappings[field.name] = mapping;
                }
            }
        });

        try {
            await updateVendor.mutateAsync({
                id: vendor._id,
                data: {
                    vendorName,
                    fieldMappings: mappings
                }
            });
            toast.success('Vendor updated successfully');
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update vendor');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteVendor.mutateAsync(vendor._id);
            toast.success('Vendor deleted successfully');
            setShowDeleteConfirm(false);
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to delete vendor');
        }
    };

    if (!isOpen || !vendor) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden transition-colors duration-300`}>
                {/* Header */}
                <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between bg-inherit z-10 shrink-0`}>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Visual Mapping Interface
                    </h2>
                    <button
                        onClick={onClose}
                        className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: PDF Preview */}
                    <div className={`w-1/2 p-4 border-r ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'} flex flex-col`}>
                        <div className="mb-4">
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                1. Reference Invoice
                            </h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                                Upload a sample PDF from this vendor to see what fields to map.
                            </p>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className={`block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-pink-50 file:text-pink-700
                                    hover:file:bg-pink-100`} />
                        </div>

                        <div className="flex-1 bg-gray-200/50 dark:bg-black/20 rounded-xl overflow-hidden relative">
                            {previewFile ? (
                                <PdfPreview file={previewFile} />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <p>No PDF uploaded</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Mapping Form */}
                    <div className="w-1/2 flex flex-col overflow-hidden">
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                    2. Map Fields
                                </h3>
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Vendor Name
                                </label>
                                <input
                                    type="text"
                                    value={vendorName}
                                    onChange={(e) => setVendorName(e.target.value)}
                                    placeholder="e.g., ACME Corporation"
                                    className={`w-full px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition`}
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Field Mappings
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addField}
                                        className={`text-sm ${darkMode ? 'text-pink-400 hover:text-pink-300' : 'text-pink-500 hover:text-pink-600'} font-medium transition flex items-center gap-1`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Field
                                    </button>
                                </div>

                                {fieldMappings.length === 0 ? (
                                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-xl text-center transition-colors duration-300`}>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            No fields added yet. Click "Add Field" to get started.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {fieldMappings.map((field, index) => (
                                            <FieldMappingRow
                                                key={index}
                                                field={field}
                                                onUpdate={(updated) => updateField(index, updated)}
                                                onRemove={() => removeField(index)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* Footer Controls */}
                        <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} bg-inherit shrink-0`}>
                            <div className="flex gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={handleSubmit} // Submit via button click since form is scrolling
                                    disabled={updateVendor.isPending}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updateVendor.isPending ? 'Updating...' : 'Update Vendor'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`flex-1 py-3 px-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'} font-semibold rounded-xl transition`}
                                >
                                    Cancel
                                </button>
                            </div>

                            {!showDeleteConfirm ? (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-2 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm"
                                >
                                    Delete Vendor
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                                        Confirm deletion?
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={deleteVendor.isPending}
                                            className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition text-sm disabled:opacity-50"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className={`flex-1 py-2 px-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-900'} font-semibold rounded-xl transition text-sm`}
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
