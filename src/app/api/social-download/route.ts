import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, platform } = body;

        if (!url) {
            return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
        }

        const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

        if (!RAPIDAPI_KEY) {
            // We return an explicit error instructing them to get an API key.
            return NextResponse.json({
                error: 'RAPIDAPI_KEY is missing in your .env.local file. Instagram/TikTok downloads require a RapidAPI key to bypass platform restrictions. Please sign up for a free Social Media Downloader API on RapidAPI.'
            }, { status: 501 });
        }

        // Example implementation using the popular "Social Media Video Downloader" API on RapidAPI
        // https://rapidapi.com/mahmudulhasan5809/api/social-media-video-downloader
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'social-media-video-downloader.p.rapidapi.com'
            }
        };

        const apiRequest = await fetch(`https://social-media-video-downloader.p.rapidapi.com/smvd/get/all?url=${encodeURIComponent(url)}`, options);
        if (!apiRequest.ok) {
            throw new Error(`API Request failed with status: ${apiRequest.status}. Please check your RapidAPI key and subscription.`);
        }
        const data = await apiRequest.json();

        // Map the RapidAPI response to our frontend expected format
        if (data.links && data.links.length > 0) {
            // Find the highest quality video or first available video link
            const videoLink = data.links.find((l: any) => l.type === 'video') || data.links[0];

            return NextResponse.json({
                title: data.title || `${platform} Video`,
                thumbnail: data.picture || data.thumbnail || '',
                downloadUrl: videoLink.link || data.url,
                format: 'mp4'
            });
        }

        return NextResponse.json({
            error: 'Could not extract video from the provided link. Ensure it is a public post.'
        }, { status: 400 });

    } catch (error: any) {
        console.error(`Social Download Error:`, error);
        return NextResponse.json({ error: error.message || 'Failed to process video url' }, { status: 500 });
    }
}
