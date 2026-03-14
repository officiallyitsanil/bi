import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/dbConnect';
// import GlobalConfig from '@/models/GlobalConfig';

// For now: serve from dummy JSON (later: fetch from DB)
import globalConfig from '@/dummy/global-configs.json';

export async function GET() {
    try {
        // TODO: Later - fetch from DB
        // await dbConnect();
        // const config = await GlobalConfig.findOne().sort({ createdAt: -1 }).lean();
        // if (!config) return NextResponse.json({ success: false, message: 'Config not found' }, { status: 404 });
        // return NextResponse.json({ success: true, config });

        const config = {
            isFullNavVisible: globalConfig.isFullNavVisible ?? false,
            whatsappNo: globalConfig.whatsappNo ?? null,
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
