import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pdfUrl = searchParams.get('url');
        const forceDownload = searchParams.get('download') === '1';
        const filename = searchParams.get('filename') || 'document.pdf';

        if (!pdfUrl) {
            return NextResponse.json(
                { error: 'PDF URL is required' },
                { status: 400 }
            );
        }

        // Validate URL - allow known domains and standard PDF sources
        const allowedDomains = ['admin.buildersinfo.in', 'africau.edu', 'mozilla.github.io', 'www.w3.org', 'localhost', '127.0.0.1'];
        const isAllowed = pdfUrl.startsWith('/') ||
            pdfUrl.startsWith('http://localhost') ||
            pdfUrl.startsWith('http://127.0.0.1') ||
            allowedDomains.some(d => pdfUrl.includes(d)) ||
            (pdfUrl.startsWith('https://') && pdfUrl.toLowerCase().includes('.pdf'));
        if (!isAllowed) {
            return NextResponse.json(
                { error: 'Invalid PDF URL' },
                { status: 400 }
            );
        }

        // Fetch the PDF from the external API
        const response = await fetch(pdfUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf, */*',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch PDF: ${response.status} ${response.statusText}` },
                { status: response.status }
            );
        }

        // Get the PDF as a blob/buffer
        const pdfBuffer = await response.arrayBuffer();

        // Return the PDF with proper headers
        const contentDisposition = forceDownload
            ? `attachment; filename="${filename.replace(/"/g, '')}"`
            : `inline; filename="${filename.replace(/"/g, '')}"`;

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': contentDisposition,
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error proxying PDF:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch PDF' },
            { status: 500 }
        );
    }
}

