import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as docx from 'docx';

export class DocumentService {
    static async process(input: Buffer | Buffer[], toolId: string, options: any = {}): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
        const buffers = Array.isArray(input) ? input : [input];
        const primaryBuffer = buffers[0];

        let outputBuffer: Buffer;
        let contentType = 'application/octet-stream';
        let filename = 'converted';

        switch (toolId) {
            case 'excel-to-csv': {
                const workbook = XLSX.read(primaryBuffer, { type: 'buffer' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                outputBuffer = Buffer.from(csvOutput);
                contentType = 'text/csv';
                filename = `converted_${Date.now()}.csv`;
                break;
            }

            case 'csv-to-excel': {
                const csvContent = primaryBuffer.toString();
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.aoa_to_sheet(
                    csvContent.split('\n').map(row => row.split(',')) // Simple CSV parser
                );
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
                outputBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                filename = `converted_${Date.now()}.xlsx`;
                break;
            }

            case 'docx-to-txt': {
                const result = await mammoth.extractRawText({ buffer: primaryBuffer });
                outputBuffer = Buffer.from(result.value);
                contentType = 'text/plain';
                filename = `extracted_${Date.now()}.txt`;
                break;
            }

            case 'json-to-csv': {
                try {
                    const jsonContent = JSON.parse(primaryBuffer.toString());
                    const items = Array.isArray(jsonContent) ? jsonContent : [jsonContent];
                    const worksheet = XLSX.utils.json_to_sheet(items);
                    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
                    outputBuffer = Buffer.from(csvOutput);
                    contentType = 'text/csv';
                    filename = `converted_${Date.now()}.csv`;
                } catch (e) {
                    throw new Error("Invalid JSON format");
                }
                break;
            }

            case 'html-to-word': {
                // Very basic HTML to Text to Docx (stripping tags for now as we don't have a full parser)
                const htmlContent = primaryBuffer.toString();
                const textContent = htmlContent.replace(/<[^>]*>/g, '\n'); // Strip tags

                const doc = new docx.Document({
                    sections: [{
                        children: textContent.split('\n').map(line =>
                            new docx.Paragraph({ children: [new docx.TextRun(line.trim())] })
                        )
                    }]
                });

                outputBuffer = Buffer.from(await docx.Packer.toBuffer(doc));
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                filename = `converted_${Date.now()}.docx`;
                break;
            }

            default:
                throw new Error(`Tool ${toolId} not implemented in DocumentService`);
        }

        return { buffer: outputBuffer, contentType, filename };
    }
}
