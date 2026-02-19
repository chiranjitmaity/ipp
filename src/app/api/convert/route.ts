import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/image-service';
import { PDFService } from '@/lib/pdf-service';
import { VideoService } from '@/lib/video-service';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];
        const toolId = formData.get('toolId') as string;

        // Extract common options
        const targetSize = formData.get('targetSize') as string;
        const width = formData.get('width') as string;
        const height = formData.get('height') as string;
        const left = formData.get('left') as string;
        const top = formData.get('top') as string;
        const quality = formData.get('quality') as string;

        // Fallback for single file
        const singleFile = formData.get('file') as File;
        const processedFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);

        if (processedFiles.length === 0 || !toolId) {
            return NextResponse.json({ error: 'Missing file(s) or tool ID' }, { status: 400 });
        }

        const buffers = await Promise.all(processedFiles.map(async (f) => Buffer.from(await f.arrayBuffer())));
        let result: { buffer: Buffer; contentType: string; filename: string };

        if (toolId === 'image-to-excel') {
            result = await ImageService.process(buffers[0], toolId);
        } else if (toolId.includes('pdf') || toolId.includes('word') || toolId.includes('excel') || toolId.includes('ppt') || toolId.includes('text')) {
            // PDF or Document related tools
            result = await PDFService.process(buffers, toolId, { targetSize: targetSize ? parseFloat(targetSize) : undefined });
        } else if (toolId.includes('mp4') || toolId.includes('mp3') || toolId.includes('video')) {
            // Video or Audio related tools
            result = await VideoService.process(buffers[0], toolId);
        } else {
            // Image related tools
            result = await ImageService.process(buffers[0], toolId, {
                width: width ? parseInt(width) : undefined,
                height: height ? parseInt(height) : undefined,
                left: left ? parseInt(left) : undefined,
                top: top ? parseInt(top) : undefined,
                quality: quality ? parseInt(quality) : undefined
            });
        }

        return new NextResponse(new Uint8Array(result.buffer), {
            status: 200,
            headers: {
                'Content-Type': result.contentType,
                'Content-Disposition': `attachment; filename="${result.filename}"`,
            },
        });

    } catch (error: unknown) {
        console.error('API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
