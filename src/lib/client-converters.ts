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
