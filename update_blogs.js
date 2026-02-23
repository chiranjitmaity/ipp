const fs = require('fs');
let code = fs.readFileSync('src/data/blogs.ts', 'utf8');

const replacement = `        slug: 'create-pdf-from-word-documents',
        toolId: 'word-to-pdf',
        title: 'How to Convert Word to PDF: The Complete Guide (2026)',
        description: 'Convert your DOCX files to professional PDF documents in seconds. Ensure your formatting stays locked on any device.',
        date: 'February 19, 2026',
        readTime: '16 min read',
        icon: '📝',
        thumbnail: '/blog-thumbnails/word-to-pdf.png',
        keywords: ['word to pdf', 'convert docx to pdf', 'create pdf', 'online converter', 'save as pdf', 'doc to pdf'],
        content: contentWordToPdf
    },`;

const lines = code.split('\n');
lines.splice(30, 61, replacement);

let finalCode = lines.join('\n');
if (!finalCode.includes('contentWordToPdf')) {
    finalCode = "import { contentWordToPdf } from './blog-content/word-to-pdf';\n" + finalCode;
}

fs.writeFileSync('src/data/blogs.ts', finalCode);
