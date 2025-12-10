"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";

export default function PDFViewerContent({ pdf, onClose }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfLoading, setPdfLoading] = useState(true);
    const [pdfError, setPdfError] = useState(null);
    const [useIframe, setUseIframe] = useState(true); // Default to iframe for reliability

    // Set up PDF.js worker on component mount
    useEffect(() => {
        if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
            // Try to set up worker, if it fails, fallback to iframe
            try {
                pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/legacy/build/pdf.worker.min.js`;
            } catch (error) {
                console.warn('Failed to set up PDF worker, using iframe fallback:', error);
                setUseIframe(true);
            }
        }
    }, []);

    useEffect(() => {
        if (pdf) {
            setPageNumber(1);
            setNumPages(null);
            setPdfLoading(true);
            setPdfError(null);
        }
    }, [pdf]);

    if (!pdf) return null;

    return (
        <div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] p-4"
            onClick={onClose}
        >
            <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
                        {pdf.originalName || pdf.filename || 'PDF Document'}
                    </h3>
                    <div className="flex items-center gap-2">
                        {numPages && (
                            <span className="text-sm text-gray-600 px-2">
                                Page {pageNumber} of {numPages}
                            </span>
                        )}
                        <a
                            href={pdf.url}
                            download
                            className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                            Download
                        </a>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 text-xl font-bold transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                
                {/* PDF Navigation Controls - Only show for react-pdf viewer */}
                {!useIframe && numPages && numPages > 1 && (
                    <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 border-b">
                        <button
                            onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                            disabled={pageNumber <= 1}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {pageNumber} of {numPages}
                        </span>
                        <button
                            onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                            disabled={pageNumber >= numPages}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                )}
                
                {/* PDF Viewer */}
                <div className="flex-1 overflow-auto bg-gray-200 p-2 md:p-4 flex items-center justify-center relative">
                    {pdfLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading PDF...</p>
                            </div>
                        </div>
                    )}
                    {pdfError && (
                        <div className="text-center p-8">
                            <p className="text-red-600 mb-4">Error loading PDF: {pdfError}</p>
                            <a
                                href={pdf.url}
                                download
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer inline-block"
                            >
                                Download PDF Instead
                            </a>
                        </div>
                    )}
                    {!pdfError && !useIframe && (
                        <div className="max-w-full w-full flex justify-center">
                            <Document
                                file={pdf.url}
                                onLoadSuccess={({ numPages }) => {
                                    setNumPages(numPages);
                                    setPdfLoading(false);
                                    setPdfError(null);
                                }}
                                onLoadError={(error) => {
                                    console.warn('react-pdf failed, using iframe fallback:', error);
                                    setUseIframe(true);
                                    setPdfLoading(false);
                                }}
                                loading={
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading PDF...</p>
                                    </div>
                                }
                                error={
                                    <div className="text-center p-8">
                                        <p className="text-red-600 mb-4">Failed to load PDF</p>
                                        <button
                                            onClick={() => setUseIframe(true)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer inline-block mr-2"
                                        >
                                            Use Simple Viewer
                                        </button>
                                        <a
                                            href={pdf.url}
                                            download
                                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer inline-block"
                                        >
                                            Download PDF
                                        </a>
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                    className="shadow-lg"
                                    width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 80, window.innerHeight - 200, 800) : 800}
                                    scale={typeof window !== 'undefined' && window.innerWidth < 768 ? 0.8 : 1}
                                />
                            </Document>
                        </div>
                    )}
                    {!pdfError && useIframe && (
                        <div className="w-full h-full">
                            <iframe
                                src={`${pdf.url}#toolbar=1&navpanes=1&scrollbar=1`}
                                className="w-full h-full border-0"
                                title="PDF Viewer"
                                onLoad={() => {
                                    setPdfLoading(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

