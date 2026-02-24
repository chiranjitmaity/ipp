import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const videoUrl = url.searchParams.get('url');
        const formatType = url.searchParams.get('format') || 'mp4';
        const itag = url.searchParams.get('itag');

        if (!videoUrl || !ytdl.validateURL(videoUrl)) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        // Get video info to determine title for the filename
        const info = await ytdl.getInfo(videoUrl);
        const safeTitle = info.videoDetails.title.replace(/[^\w\s-]/gi, '').trim().substring(0, 50);

        // Determine options based on selected format or specific itag if provided
        let ytdlOptions: ytdl.downloadOptions = {
            // Increase buffer size to prevent network stream from aborting prematurely
            highWaterMark: 1 << 25
        };
        let contentType = 'video/mp4';
        let filename = `${safeTitle}.mp4`;

        if (itag) {
            ytdlOptions.quality = itag;
            // Need to check if this is an audio-only stream
            if (formatType === 'mp3') {
                contentType = 'application/octet-stream';
                filename = `${safeTitle}.mp3`;
            } else {
                contentType = 'video/mp4';
                filename = `${safeTitle}.mp4`;
            }
        } else if (formatType === 'mp3') {
            // Force it to grab an audio format that is encapsulated in mp4 (which is broadly playable on all OS)
            ytdlOptions.filter = (format) => format.container === 'mp4' && !format.hasVideo && format.hasAudio;
            ytdlOptions.quality = 'highestaudio';
            contentType = 'application/octet-stream';
            filename = `${safeTitle}.mp3`;
        } else {
            ytdlOptions.filter = (format) => format.container === 'mp4' && format.hasVideo && format.hasAudio;
            ytdlOptions.quality = 'highest';
        }

        // Create the stream
        const stream = ytdl(videoUrl, ytdlOptions);

        // The exact Content-Length might not be known immediately when streaming
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);

        // Convert Node.js Readable stream to Web stream response
        const webStream = new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => controller.enqueue(chunk));
                stream.on('end', () => controller.close());
                stream.on('error', (err) => controller.error(err));
            },
            cancel() {
                stream.destroy();
            },
        });

        return new NextResponse(webStream, { headers });

    } catch (error: any) {
        console.error('YouTube Download Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to download video' }, { status: 500 });
    }
}
