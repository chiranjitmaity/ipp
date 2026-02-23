import sharp from 'sharp';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

export class SocialService {
    static async process(input: Buffer | Buffer[], toolId: string, options: any = {}): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
        const buffers = Array.isArray(input) ? input : [input];
        const primaryBuffer = buffers[0];

        let outputBuffer: Buffer;
        let contentType = 'image/jpeg';
        let filename = 'processed.jpg';

        switch (toolId) {
            // --- Instagram Resizer ---
            case 'instagram-resize':
                let width = 1080;
                let height = 1080;

                if (options.socialRatio === 'story') {
                    width = 1080;
                    height = 1920;
                } else if (options.socialRatio === 'portrait') {
                    width = 1080;
                    height = 1350;
                } else if (options.socialRatio === 'landscape') {
                    width = 1080;
                    height = 566;
                }

                outputBuffer = await sharp(primaryBuffer)
                    .resize({
                        width,
                        height,
                        fit: 'contain',
                        background: { r: 255, g: 255, b: 255, alpha: 1 }
                    })
                    .jpeg({ quality: 90 })
                    .toBuffer();
                filename = `insta_${options.socialRatio || 'square'}_${Date.now()}.jpg`;
                break;

            // --- Social Size Converter ---
            case 'social-size-converter':
                // Similar to insta but with broader presets
                let targetW = 1200;
                let targetH = 630;
                let platform = 'social';

                if (options.socialPlatform === 'fb-cover') { targetW = 820; targetH = 312; platform = 'fb_cover'; }
                else if (options.socialPlatform === 'twitter-header') { targetW = 1500; targetH = 500; platform = 'twitter_header'; }
                else if (options.socialPlatform === 'linkedin-banner') { targetW = 1584; targetH = 396; platform = 'linkedin_banner'; }
                else if (options.socialPlatform === 'yt-thumbnail') { targetW = 1280; targetH = 720; platform = 'yt_thumb'; }

                outputBuffer = await sharp(primaryBuffer)
                    .resize({
                        width: targetW,
                        height: targetH,
                        fit: 'cover' // Usually cover is better for headers
                    })
                    .jpeg({ quality: 90 })
                    .toBuffer();
                filename = `${platform}_${Date.now()}.jpg`;
                break;

            // --- YT Thumb Downloader ---
            case 'youtube-thumb-download':
                if (!options.url) throw new Error('No URL provided');

                // Extract video ID
                let videoId = '';
                try {
                    const urlObj = new URL(options.url);
                    if (urlObj.hostname === 'youtu.be') {
                        videoId = urlObj.pathname.slice(1);
                    } else {
                        videoId = urlObj.searchParams.get('v') || '';
                    }
                } catch (e) {
                    throw new Error('Invalid URL');
                }

                if (!videoId) throw new Error('Could not extract video ID');

                // Try max res first
                const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                const thumbRes = await fetch(thumbUrl);
                if (!thumbRes.ok) throw new Error('Thumbnail not found');

                outputBuffer = Buffer.from(await thumbRes.arrayBuffer());
                filename = `yt_thumb_${videoId}.jpg`;
                break;

            // --- YT Thumb Maker ---
            case 'youtube-thumb-maker':
                // Basic implementation: Resize to 1280x720 and maybe add some overlay if options provided
                // For now, just robust resize
                outputBuffer = await sharp(primaryBuffer)
                    .resize(1280, 720, { fit: 'cover' })
                    .composite([{
                        input: Buffer.from(`
                            <svg width="1280" height="720">
                                <rect x="0" y="600" width="1280" height="120" fill="rgba(0,0,0,0.5)" />
                                <text x="640" y="680" font-family="Arial" font-size="60" fill="white" text-anchor="middle">
                                    ${options.text || 'New Video'}
                                </text>
                            </svg>
                        `),
                        blend: 'over'
                    }])
                    .jpeg()
                    .toBuffer();
                filename = `yt_maker_${Date.now()}.jpg`;
                break;

            // --- QR Generator / URL to QR ---
            case 'qr-generator':
            case 'url-qr':
                const text = options.url || options.text || 'https://ilovepdftools.com';
                outputBuffer = await QRCode.toBuffer(text, {
                    width: 500,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                contentType = 'image/png';
                filename = `qr_code_${Date.now()}.png`;
                break;

            // --- QR Scanner ---
            case 'qr-scanner':
                const image = sharp(primaryBuffer);
                const metadata = await image.metadata();
                const raw = await image.ensureAlpha().raw().toBuffer();

                if (!metadata.width || !metadata.height) throw new Error('Invalid image');

                const code = jsQR(new Uint8ClampedArray(raw), metadata.width, metadata.height);

                if (code) {
                    outputBuffer = Buffer.from(`QR Code Content:\n${code.data}`);
                    filename = 'scanned_qr.txt';
                    contentType = 'text/plain';
                } else {
                    throw new Error('No QR code found in image');
                }
                break;

            // --- URL Shortener ---
            case 'url-shortener':
                if (!options.url) throw new Error('No URL provided');

                // Use TinyURL API
                const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(options.url)}`);
                if (!tinyRes.ok) throw new Error('Failed to shorten URL');

                const shortUrl = await tinyRes.text();
                outputBuffer = Buffer.from(`Shortened URL:\n${shortUrl}\n\nOriginal URL:\n${options.url}`);
                contentType = 'text/plain';
                filename = 'shortened_url.txt';
                break;

            // --- YouTube Tag Generator ---
            case 'youtube-tag-generator':
                if (!options.text) throw new Error('No topic provided');
                const topic = options.text.trim().toLowerCase();
                const baseWords = topic.split(' ').filter(String);

                const generatedTags = [
                    topic,
                    ...baseWords,
                    `${topic} 2024`,
                    `how to ${topic}`,
                    `${topic} tutorial`,
                    `best ${topic}`,
                    `${topic} explained`,
                    `${topic} tips`,
                    `what is ${topic}`,
                    `${baseWords[0]} tutorial`,
                    `${baseWords[0]} for beginners`,
                    'viral',
                    'trending',
                    'youtube'
                ];

                // Add some variations
                if (baseWords.length > 1) {
                    generatedTags.push(baseWords.join('')); // no spaces
                    generatedTags.push(`${baseWords[1]} ${baseWords[0]}`); // swap
                }

                // Filter out duplicates and limit to reasonable amount
                const uniqueTags = [...new Set(generatedTags)].filter(t => t.length > 2).slice(0, 20);

                outputBuffer = Buffer.from(uniqueTags.join(', '));
                contentType = 'text/plain';
                filename = 'youtube_tags.txt';
                break;

            // --- Hashtag Generator ---
            case 'hashtag-generator':
                if (!options.text) throw new Error('No topic provided');
                const hwTitle = options.text.trim().toLowerCase();
                const hwWords = hwTitle.split(' ').filter(String);

                const hashtags = [
                    `#${hwTitle.replace(/\s+/g, '')}`,
                    ...hwWords.map((w: string) => `#${w.replace(/[^a-z0-9]/g, '')}`),
                    '#viral',
                    '#trending',
                    '#explorepage',
                    '#foryou',
                    '#fyp',
                    `#${hwWords[0]}life`,
                    `#${hwWords[0]}gram`,
                    '#instagood',
                    '#photooftheday',
                    '#like4like',
                    '#followme',
                    '#picoftheday',
                    '#instadaily'
                ];

                const uniqueHashtags = [...new Set(hashtags.filter(h => h.length > 2))].slice(0, 25);

                outputBuffer = Buffer.from(uniqueHashtags.join(' '));
                contentType = 'text/plain';
                filename = 'hashtags.txt';
                break;

            default:
                throw new Error(`Tool ${toolId} not implemented`);
        }

        return { buffer: outputBuffer, contentType, filename };
    }
}
