import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';

export async function convertImageToExcelClient(files: File[], onProgress?: (progress: number) => void): Promise<string> {
    if (files.length === 0) throw new Error("No files provided");
    const file = files[0];

    const worker = await createWorker('eng', 1, {
        logger: m => {
            if (m.status === 'recognizing text' && onProgress) {
                onProgress(m.progress * 100);
            }
        }
    });

    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    // Create Excel Workbook
    const wb = XLSX.utils.book_new();
    const rows = text.split('\n').map(line => [line.trim()]).filter(row => row[0].length > 0);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");

    // Write to binary string
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    return window.URL.createObjectURL(blob);
}

export async function convertImageToTextClient(files: File[], onProgress?: (progress: number) => void): Promise<string> {
    if (files.length === 0) throw new Error("No files provided");
    const file = files[0];

    const worker = await createWorker('eng', 1, {
        logger: m => {
            if (m.status === 'recognizing text' && onProgress) {
                onProgress(m.status === 'recognizing text' ? m.progress * 100 : 0);
            }
        }
    });

    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    const blob = new Blob([text], { type: 'text/plain' });
    return window.URL.createObjectURL(blob);
}

export async function removeBackgroundClient(file: File, config: {
    color?: string;
    backgroundImage?: File;
}, onProgress?: (progress: number) => void): Promise<string> {
    // Dynamic import to avoid SSR issues
    const { removeBackground } = await import('@imgly/background-removal');

    // Configuration for local asset handling if needed, 
    // but default works by fetching from CDN (requires internet).
    // To make it offline capable, we'd need to copy public/static/js/ bi-models.

    // Process the image
    const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
            // Simple progress estimation
            if (onProgress) onProgress((current / total) * 100);
        }
    });

    // If no custom background, return the transparent PNG
    if (!config.color && !config.backgroundImage) {
        return window.URL.createObjectURL(blob);
    }

    // Compositing for custom background
    return new Promise((resolve, reject) => {
        const url = window.URL.createObjectURL(blob);
        const img = new Image();
        img.onload = async () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error("Canvas context failed")); return; }

            // 1. Draw Background
            if (config.backgroundImage) {
                const bgUrl = window.URL.createObjectURL(config.backgroundImage);
                const bgImg = new Image();
                await new Promise((r) => { bgImg.onload = r; bgImg.src = bgUrl; });
                // Draw background to cover canvas (aspect fill/crop or stretch? Stretch is easier, crop is better)
                // Let's do simple stretch for now or center crop
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                window.URL.revokeObjectURL(bgUrl);
            } else if (config.color) {
                ctx.fillStyle = config.color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // 2. Draw Foreground (Removed BG image)
            ctx.drawImage(img, 0, 0);

            // 3. Export
            canvas.toBlob((b) => {
                if (b) resolve(window.URL.createObjectURL(b));
                else reject(new Error("Canvas export failed"));
            }, 'image/png');

            window.URL.revokeObjectURL(url);
        };
        img.onerror = reject;
        img.src = url;
    });
}
