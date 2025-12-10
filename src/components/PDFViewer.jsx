"use client";

import dynamic from "next/dynamic";

// Dynamically import react-pdf with no SSR to avoid browser API issues during SSR
const PDFViewerContent = dynamic(
    () => import("./PDFViewerContent"),
    { 
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Loading PDF Viewer...</p>
                </div>
            </div>
        )
    }
);

export default function PDFViewer({ pdf, onClose }) {
    if (!pdf) return null;
    return <PDFViewerContent pdf={pdf} onClose={onClose} />;
}

