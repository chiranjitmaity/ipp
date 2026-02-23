const fs = require('fs');
let code = fs.readFileSync('src/data/blogs.ts', 'utf8');

const replacement = `        slug: 'how-to-merge-multiple-pdf-files',
        toolId: 'merge-pdf',
        title: 'The Ultimate Guide to Merging Process: Combine Multiple PDFs (2026)',
        description: 'Need to join several PDFs? Follow this detailed guide to merge your documents efficiently and securely.',
        date: 'February 19, 2026',
        readTime: '15 min read',
        icon: '🔗',
        thumbnail: '/blog-thumbnails/merge-pdf.png',
        keywords: ['merge pdf', 'combine pdf', 'join pdf files', 'pdf merger online', 'free pdf tools', 'consolidate documents'],
        content: contentMergePdf
    },`;

const lines = code.split('\n');
lines.splice(91, 43, replacement);

let finalCode = lines.join('\n');
if (!finalCode.includes('contentMergePdf')) {
    finalCode = "import { contentMergePdf } from './blog-content/merge-pdf';\n" + finalCode;
}

fs.writeFileSync('src/data/blogs.ts', finalCode);
