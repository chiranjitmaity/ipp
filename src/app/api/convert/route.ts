import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/lib/image-service';
import { PDFService } from '@/lib/pdf-service';
import { VideoService } from '@/lib/video-service';
import { DocumentService } from '@/lib/document-service';
import { SecurityService } from '@/lib/security-service';
import { SocialService } from '@/lib/social-service';
import { TOOLS, TOOL_CATEGORIES } from '@/data/tools';

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
        const dpi = formData.get('dpi') as string;


        // Page Number options
        const pageNumberPosition = formData.get('pageNumberPosition') as string;
        const pageNumberStart = formData.get('pageNumberStart') as string;
        const pageNumberFormat = formData.get('pageNumberFormat') as string;
        const pageNumberSize = formData.get('pageNumberSize') as string;

        const pageNumberMargin = formData.get('pageNumberMargin') as string;

        // Remove Watermark options
        const watermarkText = formData.get('watermarkText') as string;

        // Add Signature options
        const signatureFile = formData.get('signatureFile') as File;
        const signatureX = formData.get('signatureX') as string;
        const signatureY = formData.get('signatureY') as string;

        // Header & Footer options
        const headerText = formData.get('headerText') as string;
        const footerText = formData.get('footerText') as string;
        const headerFontSize = formData.get('headerFontSize') as string;
        const headerMargin = formData.get('headerMargin') as string;

        // Fallback for single file
        const singleFile = formData.get('file') as File;
        const processedFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);

        const isFileLessTool = toolId === 'youtube-thumb-download' ||
            toolId === 'url-shortener' ||
            toolId === 'qr-generator' ||
            toolId === 'url-qr';

        if ((processedFiles.length === 0 && !isFileLessTool) || !toolId) {
            return NextResponse.json({ error: 'Missing file(s) or tool ID' }, { status: 400 });
        }

        const buffers = await Promise.all(processedFiles.map(async (f) => Buffer.from(await f.arrayBuffer())));
        let result: { buffer: Buffer; contentType: string; filename: string };

        // Find tool definition to determine category
        const tool = TOOLS.find(t => t.id === toolId);

        // Default to ImageService if tool definitions not found (legacy fallback), 
        // but try to be smart about it based on toolId naming conventions if needed.

        if (tool?.category === TOOL_CATEGORIES.PDF || toolId === 'remove-pdf-permission') {
            result = await PDFService.process(buffers, toolId, {
                targetSize: targetSize ? parseFloat(targetSize) : undefined,
                // ... (pass password too if needed by PDFService, which isn't in options yet)
                // Wait, PDFService.process options interface doesn't have password.
                // I need to add password to ProcessingOptions in PDFService first? 
                // Or just pass it as generic options.
                // route.ts passes a specific object. I should add password to it.

                pageNumberPosition,
                pageNumberStart: pageNumberStart ? parseInt(pageNumberStart) : undefined,
                pageNumberFormat,
                pageNumberSize: pageNumberSize ? parseInt(pageNumberSize) : undefined,
                pageNumberMargin: pageNumberMargin ? parseInt(pageNumberMargin) : undefined,
                headerText,
                footerText,
                headerFontSize: headerFontSize ? parseInt(headerFontSize) : undefined,
                headerMargin: headerMargin ? parseInt(headerMargin) : undefined,
                watermarkText,
                password: formData.get('password') as string
            });
        } else if (tool?.category === TOOL_CATEGORIES.SECURITY) {
            const password = formData.get('password') as string;
            const expiration = formData.get('expiration') as string;
            const expectedHash = formData.get('expectedHash') as string;
            result = await SecurityService.process(buffers, toolId, {
                password,
                expiration: expiration ? parseInt(expiration) : undefined,
                expectedHash
            });
        } else if (tool?.category === TOOL_CATEGORIES.DOCUMENT) {
            // Some document tools are actually handled by PDFService (conversions to PDF)
            if (toolId.endsWith('-to-pdf')) {
                result = await PDFService.process(buffers, toolId);
            } else {
                result = await DocumentService.process(buffers, toolId);
            }
        } else if (tool?.category === TOOL_CATEGORIES.MOBILE_SOCIAL) {
            // Extract specific options for Social Tools
            const socialPlatform = formData.get('socialPlatform') as string;
            const socialRatio = formData.get('socialRatio') as string;
            const text = formData.get('text') as string; // For QR/Text
            const url = formData.get('url') as string; // For Downloader/Shortener

            result = await SocialService.process(buffers, toolId, {
                socialPlatform,
                socialRatio,
                text,
                url
            });
        } else if (toolId.includes('video') || toolId.includes('mp4') || toolId.includes('mp3')) {
            result = await VideoService.process(buffers[0], toolId);
        } else {
            // Default to Image Service (includes IMAGE category)
            result = await ImageService.process(buffers, toolId, {
                width: width ? parseInt(width) : undefined,
                height: height ? parseInt(height) : undefined,
                left: left ? parseInt(left) : undefined,
                top: top ? parseInt(top) : undefined,
                quality: quality ? parseInt(quality) : undefined,
                dpi: dpi ? parseInt(dpi) : undefined,
                watermarkText: watermarkText || undefined,
                targetSizeKB: targetSize ? parseInt(targetSize) : undefined,
                // New Watermark Options
                wmType: formData.get('wmType') as 'text' | 'image',
                wmText: formData.get('wmText') as string,
                wmColor: formData.get('wmColor') as string,
                wmOpacity: formData.get('wmOpacity') ? parseInt(formData.get('wmOpacity') as string) : undefined,
                wmPosition: formData.get('wmPosition') as string,
                wmSize: formData.get('wmSize') ? parseInt(formData.get('wmSize') as string) : undefined,
                watermarkImageBuffer: (formData.get('watermarkImage') as File) ? Buffer.from(await (formData.get('watermarkImage') as File).arrayBuffer()) : undefined,
                format: formData.get('format') as any
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
