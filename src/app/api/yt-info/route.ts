import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const videoUrl = url.searchParams.get('url');

        if (!videoUrl || !ytdl.validateURL(videoUrl)) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        const info = await ytdl.getInfo(videoUrl);

        // Filter out formats that don't make sense or are broken
        // We want: standard mp4s with audio+video, and high quality audio only.

        // A helper to sort formats by resolution
        const sortFormats = (a: ytdl.videoFormat, b: ytdl.videoFormat) => {
            const resA = parseInt(a.qualityLabel || '0');
            const resB = parseInt(b.qualityLabel || '0');
            return resB - resA;
        };

        // 1. Get Video+Audio formats (MP4)
        const videoFormatsRaw = ytdl.filterFormats(info.formats, 'videoandaudio')
            .filter(f => f.container === 'mp4' && f.qualityLabel)
            .sort(sortFormats);

        // Deduplicate resolutions (e.g. if there are two 720p options, keep the best one)
        const seenRes = new Set();
        const videoFormats = videoFormatsRaw.filter(f => {
            if (seenRes.has(f.qualityLabel)) return false;
            seenRes.add(f.qualityLabel);
            return true;
        }).map(f => ({
            itag: f.itag,
            resolution: f.qualityLabel,
            type: 'video',
            container: f.container,
            hasAudio: true,
            hasVideo: true,
            label: `Video (${f.qualityLabel}) - MP4`
        }));

        // 2. Get Audio Only formats (highest quality MP3 or WebM audio to convert/download)
        const audioOnlyFormats = ytdl.filterFormats(info.formats, 'audioonly')
            .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

        let bestAudioFormat = null;
        if (audioOnlyFormats.length > 0) {
            const af = audioOnlyFormats[0];
            bestAudioFormat = {
                itag: af.itag,
                resolution: 'Audio',
                type: 'audio',
                container: 'mp3', // We'll force content-type to audio/mpeg in the downloader
                hasAudio: true,
                hasVideo: false,
                label: `Audio Only (MP3)`
            };
        }

        const availableFormats = [...videoFormats];
        if (bestAudioFormat) availableFormats.push(bestAudioFormat);

        // Basic details
        const details = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails.length > 0
                ? info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url
                : null,
            duration: info.videoDetails.lengthSeconds,
            author: info.videoDetails.author.name,
            formats: availableFormats
        };

        return NextResponse.json(details);

    } catch (error: any) {
        console.error('YouTube Info Fetch Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch video info' }, { status: 500 });
    }
}
