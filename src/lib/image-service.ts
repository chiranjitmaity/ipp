import sharp from 'sharp';

export interface ImageProcessingOptions {
    width?: number;
    height?: number;
    left?: number;
    top?: number;
    quality?: number;
    dpi?: number;
    watermarkText?: string;
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

            case 'image-to-excel':
                const Tesseract = (await import('tesseract.js')).default || await import('tesseract.js');
                const XLSX = (await import('xlsx')).default || await import('xlsx');

                // Recognize text from image buffer
                const { data: { text } } = await Tesseract.recognize(
                    buffer,
                    'eng',
                    // { logger: m => console.log(m) } // Optional logger
                );

                // Create a workbook and worksheet
                const wb = XLSX.utils.book_new();

                // Parse text into rows (simple newline split)
                const rows = text.split('\n').map(line => [line.trim()]).filter(row => row[0].length > 0);

                const ws = XLSX.utils.aoa_to_sheet(rows);
                XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");

                // Write to buffer
                outputBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                filename = `converted_${Date.now()}.xlsx`;
                filename = `converted_${Date.now()}.xlsx`;
                break;

            case 'convert-dpi':
                // Sharp supports withMetadata({ density: ... })
                outputBuffer = await pipeline
                    .withMetadata({ density: options.dpi || 300 })
                    .jpeg()
                    .toBuffer();
                contentType = 'image/jpeg';
                filename = `dpi_${options.dpi || 300}_${Date.now()}.jpg`;
                break;

            case 'watermark-image':
                const watermarkText = options.watermarkText || 'CONFIDENTIAL';
                // Create SVG for watermark
                const svgImage = `
                    <svg width="500" height="100">
                        <style>
                        .title { fill: rgba(255, 255, 255, 0.5); font-size: 40px; font-weight: bold; font-family: sans-serif; }
                        </style>
                        <text x="50%" y="50%" text-anchor="middle" class="title">${watermarkText}</text>
                    </svg>
                `;
                outputBuffer = await pipeline
                    .composite([{ input: Buffer.from(svgImage), gravity: 'center' }])
                    .jpeg()
                    .toBuffer();
                contentType = 'image/jpeg';
                filename = `watermarked_${Date.now()}.jpg`;
                break;

            case 'blur-face':
                // Fallback: Blur entire image significantly (privacy mode)
                // Real face blur requires TensorFlow/FaceAPI
                outputBuffer = await pipeline.blur(15).jpeg().toBuffer();
                contentType = 'image/jpeg';
                filename = `blurred_${Date.now()}.jpg`;
                break;

            case 'grayscale-image':
                outputBuffer = await pipeline.grayscale().jpeg().toBuffer();
                contentType = 'image/jpeg';
                filename = `grayscale_${Date.now()}.jpg`;
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
