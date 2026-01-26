import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { useQueryClient } from '@tanstack/react-query'; // Import QueryClient
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import api from '../../services/api';
import toast from 'react-hot-toast';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const VisualMapper = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient(); // Initialize QueryClient
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

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

    const [mappings, setMappings] = useState({
        vendorName: { value: '', rule: null },
        invoiceDate: { value: '', rule: null },
        totalAmount: { value: '', rule: null },
        invoiceNumber: { value: '', rule: null },
        dueDate: { value: '', rule: null }
    });

    const [selectedField, setSelectedField] = useState(null);
    const pdfWrapperRef = useRef(null);

    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await api.get(`/invoices`);
                const foundInvoice = res.data.data.find(inv => inv._id === invoiceId);

                if (foundInvoice) {
                    setInvoice(foundInvoice);

                    setMappings(prev => ({
                        ...prev,
                        vendorName: { ...prev.vendorName, value: foundInvoice.vendorName || '' },
                        invoiceDate: { ...prev.invoiceDate, value: foundInvoice.extractedData?.invoiceDate || '' },
                        invoiceNumber: { ...prev.invoiceNumber, value: foundInvoice.extractedData?.invoiceNumber || '' },
                        totalAmount: { ...prev.totalAmount, value: foundInvoice.extractedData?.totalAmount || '' },
                        dueDate: { ...prev.dueDate, value: foundInvoice.extractedData?.dueDate || '' }
                    }));

                    try {
                        const pdfRes = await api.get(`/invoices/${invoiceId}/pdf`, {
                            responseType: 'blob'
                        });
                        const blobUrl = URL.createObjectURL(pdfRes.data);
                        setPdfUrl(blobUrl);
                    } catch (pdfErr) {
                        console.error("PDF Fetch Error:", pdfErr);
                        setErrorMsg(pdfErr.message || 'Failed to fetch PDF file');
                        toast.error('Could not download PDF file');
                    }

                } else {
                    toast.error('Invoice not found');
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error fetching invoice');
            } finally {
                setLoading(false);
            }
        };

        if (invoiceId) fetchInvoice();

        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        }
    }, [invoiceId, navigate]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleFieldSelect = (field) => {
        setSelectedField(field);
        toast(`Select value for ${field.replace(/([A-Z])/g, ' $1')}`, { icon: '👆' });
    };

    const handlePdfClick = (e) => {
    };

    const handleTextSelection = () => {
        if (!selectedField) return;

        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            setMappings(prev => ({
                ...prev,
                [selectedField]: { ...prev[selectedField], value: text }
            }));
            toast.success(`Captured "${text}" for ${selectedField.replace(/([A-Z])/g, ' $1')}`);

            selection.removeAllRanges();
            setSelectedField(null);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                vendorName: mappings.vendorName.value,
                extractedData: {
                    invoiceDate: mappings.invoiceDate.value,
                    invoiceNumber: mappings.invoiceNumber.value,
                    totalAmount: mappings.totalAmount.value,
                    dueDate: mappings.dueDate.value
                }
            };

            const response = await api.post(`/invoices/${invoiceId}/process`, payload);

            if (response.data.warning) {
                toast((t) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-yellow-600">Saved, but Sync Failed!</span>
                        <span className="text-sm">{response.data.message.split('Failed: ')[1]}</span>
                    </div>
                ), { icon: '⚠️', duration: 5000 });
            } else {
                toast.success('Saved & Synced to Sheets!');
            }

            // Invalidate cache so Dashboard updates
            queryClient.invalidateQueries(['invoices']);

            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save invoice');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div
                className={`w-2/3 h-full relative flex flex-col items-center p-4 overflow-y-auto ${darkMode ? 'bg-gray-700' : 'bg-gray-600'}`}
                ref={pdfWrapperRef}
                onMouseUp={handleTextSelection}
                style={{ cursor: selectedField ? 'crosshair' : 'text' }}
            >
                <div className="mb-4 bg-white rounded shadow p-2 flex gap-4 sticky top-0 z-10 w-fit text-gray-900">
                    <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="px-2 font-bold hover:bg-gray-100 rounded">-</button>
                    <span className="font-mono min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="px-2 font-bold hover:bg-gray-100 rounded">+</button>
                </div>

                {pdfUrl && (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(error) => toast.error(`PDF Error: ${error.message}`)}
                        className="shadow-2xl"
                        loading={<div className="text-white">Loading PDF...</div>}
                        error={<div className="text-red-300">Failed to load PDF.</div>}
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <div key={`page_${index + 1}`} className="mb-4 relative" onClick={handlePdfClick}>
                                <Page
                                    pageNumber={index + 1}
                                    scale={scale}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={false}
                                />
                            </div>
                        ))}
                    </Document>
                )}
            </div>

            <div className={`w-1/3 h-full p-6 shadow-xl z-20 overflow-y-auto transition-colors duration-300 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Review Invoice</h2>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {invoice?.status}
                    </span>
                </div>

                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Vendor: <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{invoice?.senderEmail || 'Unknown'}</span>
                </p>

                <div className="space-y-4">
                    {Object.keys(mappings).map((key) => (
                        <div
                            key={key}
                            onClick={() => handleFieldSelect(key)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedField === key
                                ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 dark:ring-indigo-700'
                                : `border-gray-200 hover:border-indigo-300 ${darkMode ? 'border-gray-700 hover:border-indigo-500' : ''}`
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={`font-semibold capitalize ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                {mappings[key].value && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        Mapped
                                    </span>
                                )}
                            </div>
                            <div className={`text-sm italic truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {mappings[key].value || 'Click to select from PDF...'}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-lg font-bold text-white transition-all
                            ${isSaving
                                ? 'bg-indigo-400 cursor-wait'
                                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl cursor-pointer'}`}
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : 'Save Rules & Process'}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`w-full border font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer
                            ${darkMode
                                ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisualMapper;
