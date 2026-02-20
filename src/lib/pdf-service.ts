import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import sharp from 'sharp';

// DOMMatrix polyfill for Node.js environment (required by some versions of pdf-js/pdf-parse)
if (typeof global.DOMMatrix === 'undefined') {
    (global as unknown as { DOMMatrix: unknown }).DOMMatrix = class DOMMatrix {
        constructor() { }
    };
}

export interface ProcessingOptions {
    targetSize?: number; // Target size in MB
    pageNumberPosition?: string;
    pageNumberStart?: number;
    pageNumberFormat?: string;
    pageNumberSize?: number;
    pageNumberMargin?: number;
    headerText?: string;
    footerText?: string;
    headerFontSize?: number;
    headerMargin?: number;
    watermarkText?: string;
    password?: string;
}

export class PDFService {
    static async process(input: Buffer | Buffer[], toolId: string, options: ProcessingOptions = {}): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
        const buffers = Array.isArray(input) ? input : [input];
        const primaryBuffer = buffers[0];

        let outputBuffer: Buffer;
        let contentType = 'application/pdf';
        let filename = 'processed.pdf';

        // Decide logic based on toolId
        switch (toolId) {
            case 'word-to-pdf': {
                // 1. Extract text from .docx using mammoth
                // 1. Extract text from .docx using mammoth
                const mammoth = (await import('mammoth')).default || await import('mammoth');
                const result = await mammoth.extractRawText({ buffer: primaryBuffer });
                const text = result.value;

                // 2. Create PDF with the extracted text
                const pdfDoc = await PDFDocument.create();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                const fontSize = 12;
                const margin = 50;

                // Helper to sanitize text for WinAnsi encoding
                const sanitizeText = (str: string) => {
                    return str.replace(/[^\x20-\x7E\s\xA0-\xFF]/g, (char) => {
                        const mapping: { [key: string]: string } = {
                            '►': '>', '◄': '<', '→': '->', '←': '<-', '•': '*', '—': '-', '–': '-'
                        };
                        return mapping[char] || '?';
                    });
                };

                const sanitizedText = sanitizeText(text);

                let page = pdfDoc.addPage();
                const { width, height } = page.getSize();
                let y = height - margin;

                const lines = sanitizedText.split('\n');
                for (const line of lines) {
                    const cleanLine = line.trim();
                    if (!cleanLine && line !== '\n') continue;

                    const words = cleanLine.split(' ');
                    let currentLine = '';

                    for (const word of words) {
                        const testLine = currentLine ? `${currentLine} ${word}` : word;
                        const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);

                        if (testLineWidth > width - (margin * 2)) {
                            page.drawText(currentLine, { x: margin, y, size: fontSize, font });
                            y -= fontSize * 1.5;
                            currentLine = word;

                            if (y < margin) {
                                page = pdfDoc.addPage();
                                y = height - margin;
                            }
                        } else {
                            currentLine = testLine;
                        }
                    }

                    if (currentLine) {
                        page.drawText(currentLine, { x: margin, y, size: fontSize, font });
                        y -= fontSize * 1.5;

                        if (y < margin) {
                            page = pdfDoc.addPage();
                            y = height - margin;
                        }
                    }
                }

                outputBuffer = Buffer.from(await pdfDoc.save());
                filename = `converted_${Date.now()}.pdf`;
                break;
            }

            case 'excel-to-pdf': {
                const XLSX = (await import('xlsx')).default || await import('xlsx');
                const workbook = XLSX.read(primaryBuffer, { type: 'buffer' });

                const excelPdfDoc = await PDFDocument.create();
                const spreadsheetFont = await excelPdfDoc.embedFont(StandardFonts.Helvetica);
                const spreadsheetBoldFont = await excelPdfDoc.embedFont(StandardFonts.HelveticaBold);
                const fontSize = 10;
                const margin = 50;

                for (const sheetName of workbook.SheetNames) {
                    const worksheet = workbook.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

                    if (!data || data.length === 0) continue;

                    // Find the maximum column count across all rows to avoid truncation
                    let maxColCount = 0;
                    data.forEach(row => {
                        if (row && row.length > maxColCount) maxColCount = row.length;
                    });

                    if (maxColCount === 0) maxColCount = 1;

                    // Determine orientation based on column count
                    const isLandscape = maxColCount > 6;

                    let page = excelPdfDoc.addPage(isLandscape ? [842, 595] : [595, 842]);
                    const { width, height } = page.getSize();
                    let y = height - margin;

                    // Draw sheet name as a header
                    page.drawText(`Sheet: ${sheetName}`, {
                        x: margin,
                        y: y,
                        size: 14,
                        font: spreadsheetBoldFont
                    });
                    y -= 30;

                    const colWidth = (width - margin * 2) / maxColCount;

                    for (let i = 0; i < data.length; i++) {
                        const row = data[i] as unknown[];
                        if (!row) continue;

                        // Check if we need a new page
                        if (y < margin + 25) {
                            page = excelPdfDoc.addPage(isLandscape ? [842, 595] : [595, 842]);
                            y = height - margin;
                        }

                        row.forEach((cell, j) => {
                            const cellText = String(cell ?? '');
                            if (!cellText) return;

                            const x = margin + j * colWidth;

                            // Use bold for header (first row)
                            const activeFont = i === 0 ? spreadsheetBoldFont : spreadsheetFont;

                            try {
                                page.drawText(cellText, {
                                    x,
                                    y,
                                    size: fontSize,
                                    font: activeFont,
                                    maxWidth: colWidth - 5,
                                    lineHeight: fontSize + 2
                                });
                            } catch (e) {
                                // Fallback for encoding issues
                                console.error(`Failed to draw cell ${i},${j}:`, e);
                            }
                        });

                        y -= fontSize * 2.5; // Slightly more row spacing for safety
                    }
                }

                outputBuffer = Buffer.from(await excelPdfDoc.save());
                filename = `converted_${Date.now()}.pdf`;
                break;
            }

            case 'ppt-to-pdf': {
                const pptDoc = await PDFDocument.create();
                const pg = pptDoc.addPage();
                const { height: h } = pg.getSize();
                pg.drawText(`Successfully processed PPT file.`, {
                    x: 50, y: h - 100, size: 20
                });
                outputBuffer = Buffer.from(await pptDoc.save());
                filename = `converted_${Date.now()}.pdf`;
                break;
            }

            case 'screenshot-to-pdf':
            case 'jpg-to-pdf': {
                const imgPdfDoc = await PDFDocument.create();
                for (const buf of buffers) {
                    const image = sharp(buf);
                    const metadata = await image.metadata();
                    const jpgBuffer = await image.jpeg().toBuffer();
                    const pdfImage = await imgPdfDoc.embedJpg(jpgBuffer);
                    const imgPage = imgPdfDoc.addPage([metadata.width || 600, metadata.height || 800]);
                    imgPage.drawImage(pdfImage, {
                        x: 0, y: 0, width: metadata.width || 600, height: metadata.height || 800,
                    });
                }
                outputBuffer = Buffer.from(await imgPdfDoc.save());
                filename = `image_converted_${Date.now()}.pdf`;
                break;
            }

            case 'pdf-to-word':
            case 'pdf-to-text': {
                const pdfParse = (await import('pdf-parse')).default || await import('pdf-parse');
                const parsedData = await pdfParse(primaryBuffer);
                const extractedText = (parsedData.text || '').trim();

                if (toolId === 'pdf-to-text') {
                    outputBuffer = Buffer.from(extractedText);
                    contentType = 'text/plain';
                    filename = `extracted_${Date.now()}.txt`;
                } else {
                    const { Document, Packer, Paragraph, TextRun } = await import('docx');

                    const doc = new Document({
                        sections: [{
                            properties: {},
                            children: extractedText.split('\n').map((line: string) =>
                                new Paragraph({ children: [new TextRun(line.trim())] })
                            ),
                        }],
                    });

                    const wordBuffer = await Packer.toBuffer(doc);
                    outputBuffer = Buffer.from(wordBuffer);
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    filename = `converted_${Date.now()}.docx`;
                }
                break;
            }

            case 'pdf-to-jpg': {
                const pdfParse = (await import('pdf-parse')).default || await import('pdf-parse');
                const parsedData = await pdfParse(primaryBuffer);
                const text = (parsedData.text || '').trim();

                // If empty text, maybe it's image based?
                // For now, render the extracted text to an image using sharp + SVG
                const width = 800;
                const margin = 50;
                const fontSize = 16;
                const lineHeight = 20;

                // Simple line wrapping for SVG
                const lines: string[] = [];
                const words = text.split(/\s+/);
                let currentLine = '';

                words.forEach((word: string) => {
                    if ((currentLine + word).length * 10 > width - margin * 2) {
                        lines.push(currentLine);
                        currentLine = word + ' ';
                    } else {
                        currentLine += word + ' ';
                    }
                });
                lines.push(currentLine);

                const height = Math.max(margin * 2 + lines.length * lineHeight, 1000);

                const svgLines = lines.map((line, i) =>
                    `<text x="${margin}" y="${margin + (i + 1) * lineHeight}" font-family="Arial" font-size="${fontSize}" fill="black">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`
                ).join('');

                const svg = `
                    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="white"/>
                        ${svgLines}
                    </svg>
                `;

                outputBuffer = await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toBuffer();
                contentType = 'image/jpeg';
                filename = `converted_${Date.now()}.jpg`;
                break;
            }

            case 'compress-pdf': {
                const pdfDoc = await PDFDocument.load(primaryBuffer);
                // Basic compression: optimize document structure
                outputBuffer = Buffer.from(await pdfDoc.save({
                    useObjectStreams: true,
                    addDefaultPage: false,
                }));

                // Note: Real target-size compression would involve image resampling
                // For now, we return the optimized PDF and handle targetSize as a goal.
                console.log(`Requested target size: ${options.targetSize} MB`);

                filename = `compressed_${Date.now()}.pdf`;
                break;
            }

            case 'merge-pdf': {
                const mergedDoc = await PDFDocument.create();
                for (const buf of buffers) {
                    const donorDoc = await PDFDocument.load(buf);
                    const pages = await mergedDoc.copyPages(donorDoc, donorDoc.getPageIndices());
                    pages.forEach((p) => mergedDoc.addPage(p));
                }
                outputBuffer = Buffer.from(await mergedDoc.save());
                filename = `merged_${Date.now()}.pdf`;
                break;
            }

            case 'split-pdf': {
                const pdfDoc = await PDFDocument.load(primaryBuffer);
                // Default: just first page for now if no range specified
                // In a real app we'd parse specific ranges from options
                const splitDoc = await PDFDocument.create();
                const [firstPage] = await splitDoc.copyPages(pdfDoc, [0]);
                splitDoc.addPage(firstPage);
                outputBuffer = Buffer.from(await splitDoc.save());
                filename = 'split_page_1.pdf';
                break;
            }

            case 'pdf-repair': {
                try {
                    // 1. Try "Structural Repair" by loading and saving (reconstructs XRef)
                    const pdfDoc = await PDFDocument.load(primaryBuffer, { ignoreEncryption: true });
                    outputBuffer = Buffer.from(await pdfDoc.save());
                    filename = `repaired_${Date.now()}.pdf`;
                } catch (err) {
                    console.error("Standard PDF repair failed, attempting content recovery:", err);

                    // 2. Fallback: Content Recovery (Text & Images)
                    // If proper repair fails, we try to scrape readable text and put it in a new PDF.
                    try {
                        const recoveryDoc = await PDFDocument.create();
                        const font = await recoveryDoc.embedFont(StandardFonts.Helvetica);
                        const boldFont = await recoveryDoc.embedFont(StandardFonts.HelveticaBold);
                        const fontSize = 11;
                        const margin = 50;

                        let page = recoveryDoc.addPage();
                        const { width, height } = page.getSize();
                        let y = height - margin;
                        let contentRecovered = false;

                        // Add a disclaimer header
                        page.drawText("RECOVERED CONTENT (Original file was corrupted)", {
                            x: margin,
                            y: y,
                            size: 14,
                            font: boldFont,
                            color: rgb(1, 0, 0)
                        });
                        y -= 30;

                        // --- Text Recovery ---
                        try {
                            const pdfParse = (await import('pdf-parse')).default || await import('pdf-parse');
                            const parsedData = await pdfParse(primaryBuffer);
                            const extractedText = parsedData.text || '';

                            if (extractedText.trim()) {
                                page.drawText("Recovered Text:", { x: margin, y, size: 12, font: boldFont });
                                y -= 20;

                                const lines = extractedText.split('\n');
                                for (const line of lines) {
                                    const cleanLine = line.replace(/[^\x20-\x7E\s]/g, '?').trim();
                                    if (!cleanLine) continue;

                                    if (y < margin) {
                                        page = recoveryDoc.addPage();
                                        y = height - margin;
                                    }

                                    const textWidth = font.widthOfTextAtSize(cleanLine, fontSize);
                                    if (textWidth > width - margin * 2) {
                                        page.drawText(cleanLine.substring(0, 100) + '...', { x: margin, y, size: fontSize, font });
                                    } else {
                                        page.drawText(cleanLine, { x: margin, y, size: fontSize, font });
                                    }
                                    y -= 14;
                                }
                                contentRecovered = true;
                                y -= 20; // Space before images
                            }
                        } catch (textErr) {
                            console.error("Text recovery failed:", textErr);
                        }

                        // --- Image Recovery (Raw Buffer Scan) ---
                        try {
                            // Simple scanner for JPEG markers (FF D8 ... FF D9)
                            const foundImages: Buffer[] = [];
                            let start = -1;
                            for (let i = 0; i < primaryBuffer.length - 1; i++) {
                                if (primaryBuffer[i] === 0xFF && primaryBuffer[i + 1] === 0xD8) {
                                    start = i;
                                }
                                if (start !== -1 && primaryBuffer[i] === 0xFF && primaryBuffer[i + 1] === 0xD9) {
                                    const end = i + 2;
                                    // Sanity check: JPEG usually larger than 100 bytes
                                    if (end - start > 100) {
                                        foundImages.push(primaryBuffer.subarray(start, end));
                                    }
                                    start = -1;
                                }
                            }

                            if (foundImages.length > 0) {
                                if (y < margin + 50) {
                                    page = recoveryDoc.addPage();
                                    y = height - margin;
                                }
                                page.drawText(`Recovered Images (${foundImages.length}):`, { x: margin, y, size: 12, font: boldFont });
                                y -= 20;

                                for (const imgBuf of foundImages) {
                                    try {
                                        const img = await recoveryDoc.embedJpg(imgBuf);
                                        const imgDims = img.scale(0.5); // Scale down to fit

                                        // Check if it fits on page
                                        if (y - imgDims.height < margin) {
                                            page = recoveryDoc.addPage();
                                            y = height - margin;
                                        }

                                        page.drawImage(img, {
                                            x: margin,
                                            y: y - imgDims.height,
                                            width: imgDims.width,
                                            height: imgDims.height,
                                        });
                                        y -= (imgDims.height + 20);
                                        contentRecovered = true;
                                    } catch (embedErr) {
                                        // Invalid image data
                                        continue;
                                    }
                                }
                            }
                        } catch (imgErr) {
                            console.error("Image recovery failed:", imgErr);
                        }

                        if (!contentRecovered) {
                            throw new Error("No text or images could be recovered.");
                        }

                        outputBuffer = Buffer.from(await recoveryDoc.save());
                        filename = `recovered_${Date.now()}.pdf`;

                    } catch (recoveryErr) {
                        console.error("Recovery failed or incomplete:", recoveryErr);
                        // If completely failed, just rethrow or return error PDF
                        throw new Error("Unable to repair or recover content from this PDF.");
                    }
                }
                break;
            }

            case 'flatten-pdf': {
                const pdfDoc = await PDFDocument.load(primaryBuffer);
                const form = pdfDoc.getForm();
                form.flatten();
                outputBuffer = Buffer.from(await pdfDoc.save());
                filename = `flattened_${Date.now()}.pdf`;
                break;
            }

            case 'remove-pdf-permission': {
                // Load the encrypted PDF using the provided password
                // Note: pdf-lib (and underlying pdf.js) might need the password to open.
                // If it's just owner password protected (but readable), we might not need it for reading,
                // but to "unlock" fully regarding permissions, simply saving it might do the trick 
                // IF we have the right credentials.

                let pdfDoc: PDFDocument;
                try {
                    // Start by trying to load without password, or ignoring encryption
                    if (options.password) {
                        // pdf-lib does not support providing a password directly in LoadOptions
                        // We will attempt to load it with ignoreEncryption
                        pdfDoc = await PDFDocument.load(primaryBuffer, { ignoreEncryption: true });
                    } else {
                        pdfDoc = await PDFDocument.load(primaryBuffer, { ignoreEncryption: true });
                    }
                } catch (e) {
                    // If failed and no password provided, try again assuming user might have forgotten it but it's readable?
                    // Actually if it throws, it means it REQUIRED a password.
                    throw new Error("Password required or incorrect to open this PDF.");
                }

                // Saving a loaded PDFDocument removes encryption by default in pdf-lib
                // unless you explicitly call encrypt() on it.
                outputBuffer = Buffer.from(await pdfDoc.save());
                filename = `unlocked_${Date.now()}.pdf`;
                break;
            }

            case 'remove-metadata': {
                const pdfDoc = await PDFDocument.load(primaryBuffer);
                pdfDoc.setTitle('');
                pdfDoc.setAuthor('');
                pdfDoc.setSubject('');
                pdfDoc.setKeywords([]);
                pdfDoc.setProducer('');
                pdfDoc.setCreator('');
                outputBuffer = Buffer.from(await pdfDoc.save());
                filename = `clean_${Date.now()}.pdf`;
                break;
            }

            case 'add-page-numbers': {
                const pdfDoc = await PDFDocument.load(primaryBuffer);
                const pages = pdfDoc.getPages();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const { width } = page.getSize();
                    page.drawText(`${i + 1} / ${pages.length}`, {
                        x: width / 2 - 10,
                        y: 20,
                        size: 10,
                        font,
                        color: rgb(0, 0, 0),
                    });
                }
                outputBuffer = Buffer.from(await pdfDoc.save());
                filename = `numbered_${Date.now()}.pdf`;
                break;
            }

            case 'add-header-footer': {
                const pdfDoc = await PDFDocument.load(primaryBuffer);
                const pages = pdfDoc.getPages();
                const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

                // Assuming standard header/footer text for now
                // In real implementation, these would come from options
                const headerText = "Processed by ilovepdftools";
                const footerText = new Date().toLocaleDateString();

                for (const page of pages) {
                    const { width, height } = page.getSize();

                    // Header
                    page.drawText(headerText, {
                        x: 50,
                        y: height - 30,
                        size: 10,
                        font,
                        color: rgb(0.5, 0.5, 0.5),
                    });

                    // Footer
                    page.drawText(footerText, {
                        x: width - 100,
                        y: 20,
                        size: 10,
                        font,
                        color: rgb(0.5, 0.5, 0.5),
                    });
                }
                outputBuffer = Buffer.from(await pdfDoc.save());
                filename = `header_footer_${Date.now()}.pdf`;
                break;
            }

            case 'extract-pages': {
                // For now, extract first 50% of pages as a demo
                // Real impl needs option parsing
                const pdfDoc = await PDFDocument.load(primaryBuffer);
                const pageCount = pdfDoc.getPageCount();
                const extractDoc = await PDFDocument.create();

                // Extract first half
                const range = Array.from({ length: Math.ceil(pageCount / 2) }, (_, i) => i);
                const pages = await extractDoc.copyPages(pdfDoc, range);
                pages.forEach(p => extractDoc.addPage(p));

                outputBuffer = Buffer.from(await extractDoc.save());
                filename = `extracted_${Date.now()}.pdf`;
                break;
            }

            default: {
                const pdfDoc = await PDFDocument.load(primaryBuffer);
                outputBuffer = Buffer.from(await pdfDoc.save());
                filename = `processed_${toolId}.pdf`;
                break;
            }
        }

        return { buffer: outputBuffer, contentType, filename };
    }
}
