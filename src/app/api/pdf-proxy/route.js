import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pdfUrl = searchParams.get('url');

        if (!pdfUrl) {
            return NextResponse.json(
                { error: 'PDF URL is required' },
                { status: 400 }
            );
        }

        // Validate that the URL is from the expected domain for security
        if (!pdfUrl.includes('admin.buildersinfo.in') && !pdfUrl.startsWith('/') && !pdfUrl.startsWith('http://localhost') && !pdfUrl.startsWith('http://127.0.0.1')) {
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
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="document.pdf"`,
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

