import sharp from 'sharp';

export interface ImageProcessingOptions {
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    quality?: number;
}

export class ImageService {
    static async process(buffer: Buffer, toolId: string, options: ImageProcessingOptions = {}): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
        let outputBuffer: Buffer;
        let contentType: string = 'image/jpeg';
        let filename: string = 'processed_image.jpg';

        const pipeline = sharp(buffer);

        switch (toolId) {
            case 'compress-image':
                outputBuffer = await pipeline.jpeg({ quality: options.quality || 60 }).toBuffer();
                contentType = 'image/jpeg';
                filename = `compressed_${Date.now()}.jpg`;
                break;

            case 'jpg-to-png':
                outputBuffer = await pipeline.png().toBuffer();
                contentType = 'image/png';
                filename = `converted_${Date.now()}.png`;
                break;

            case 'png-to-jpg':
            case 'webp-to-jpg':
                outputBuffer = await pipeline.jpeg().toBuffer();
                contentType = 'image/jpeg';
                filename = `converted_${Date.now()}.jpg`;
                break;

            case 'resize-image':
                const width = options.width || (options.height ? undefined : 800);
                const height = options.height;

                outputBuffer = await pipeline.resize(width, height, {
                    fit: (width && height) ? 'fill' : 'inside'
                }).toBuffer();

                contentType = 'image/jpeg';
                filename = `resized_${width || 'auto'}x${height || 'auto'}_${Date.now()}.jpg`;
                break;

            case 'crop-image':
                // For crop, we need valid coordinates. Default to 0,0,500,500 if missing.
                outputBuffer = await pipeline.extract({
                    left: options.left || 0,
                    top: options.top || 0,
                    width: options.width || 500,
                    height: options.height || 500
                }).toBuffer();
                contentType = 'image/jpeg';
                filename = `cropped_${Date.now()}.jpg`;
                break;

            default:
                outputBuffer = await pipeline.jpeg().toBuffer();
                contentType = 'image/jpeg';
                filename = `processed_${toolId}_${Date.now()}.jpg`;
                break;
        }

        return { buffer: outputBuffer, contentType, filename };
    }
}
