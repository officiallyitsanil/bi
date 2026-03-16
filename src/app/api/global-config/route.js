import { NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import GlobalConfig from '@/models/GlobalConfig';

export async function GET() {
    try {
        await dbConnect();
        const doc = await GlobalConfig.findOne().sort({ createdAt: -1 }).lean();
        if (!doc) {
            return NextResponse.json({
                success: true,
                config: { isFullNavVisible: false, whatsappNo: null },
            });
        }
        const config = {
            isFullNavVisible: doc.isFullNavVisible ?? false,
            whatsappNo: doc.whatsappNo != null ? doc.whatsappNo : null,
        };
        return NextResponse.json({ success: true, config });
    } catch (error) {
        console.error('[global-config]', error);
        return NextResponse.json(
            { success: false, message: error?.message || 'Failed to fetch global config' },
            { status: 500 }
        );
    }
}
