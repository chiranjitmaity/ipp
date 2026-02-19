import {
    FileText, Merge, Scissors, Minimize2,
    FileType, FileSpreadsheet, ImageIcon, Maximize,
    Crop, Image, Presentation,
    FileCode, Zap, LucideIcon
} from 'lucide-react';

export const TOOL_CATEGORIES = {
    PDF: 'PDF Tools',
    IMAGE: 'Image Tools',
    DOCUMENT: 'Document Tools',
    VIDEO_AUDIO: 'Video & Audio Tools',
};

export interface Tool {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: LucideIcon;
    href: string;
    popular?: boolean;
    accept?: string;
    code?: string; // For dynamic code injection
}

export const TOOLS: Tool[] = [
    // PDF Tools
    {
        id: 'pdf-to-word',
        title: 'PDF to Word',
        description: 'Convert PDF documents to editable Microsoft Word files.',
        category: TOOL_CATEGORIES.PDF,
        icon: FileText,
        href: '/tools/pdf-to-word',
        popular: true,
        accept: '.pdf',
    },
    {
        id: 'word-to-pdf',
        title: 'Word to PDF',
        description: 'Create PDF documents from Microsoft Word files.',
        category: TOOL_CATEGORIES.PDF,
        icon: FileType,
        href: '/tools/word-to-pdf',
        popular: true,
        accept: '.doc,.docx',
    },
    {
        id: 'merge-pdf',
        title: 'Merge PDF',
        description: 'Combine multiple PDF files into one single document.',
        category: TOOL_CATEGORIES.PDF,
        icon: Merge,
        href: '/tools/merge-pdf',
        popular: true,
        accept: '.pdf',
    },
    {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Extract pages from your PDF or save each page as a separate PDF.',
        category: TOOL_CATEGORIES.PDF,
        icon: Scissors,
        href: '/tools/split-pdf',
        accept: '.pdf',
    },
    {
        id: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce the file size of your PDF while maintaining quality.',
        category: TOOL_CATEGORIES.PDF,
        icon: Minimize2,
        href: '/tools/compress-pdf',
        popular: true,
        accept: '.pdf',
    },
    {
        id: 'jpg-to-pdf',
        title: 'JPG to PDF',
        description: 'Convert JPG, PNG, and BMP images to PDF documents.',
        category: TOOL_CATEGORIES.PDF,
        icon: ImageIcon,
        href: '/tools/jpg-to-pdf',
        popular: true,
        accept: 'image/jpeg,image/png,image/bmp',
    },
    {
        id: 'pdf-to-jpg',
        title: 'PDF to JPG',
        description: 'Convert each PDF page into a high-quality JPG image.',
        category: TOOL_CATEGORIES.PDF,
        icon: Image,
        href: '/tools/pdf-to-jpg',
        accept: '.pdf',
    },

    // Image Tools
    {
        id: 'compress-image',
        title: 'Compress Image',
        description: 'Reduce image file size without losing quality.',
        category: TOOL_CATEGORIES.IMAGE,
        icon: Minimize2,
        href: '/tools/compress-image',
        popular: true,
        accept: 'image/*',
    },
    {
        id: 'resize-image',
        title: 'Resize Image',
        description: 'Change image dimensions in pixels or percentage.',
        category: TOOL_CATEGORIES.IMAGE,
        icon: Maximize,
        href: '/tools/resize-image',
        accept: 'image/*',
    },
    {
        id: 'crop-image',
        title: 'Crop Image',
        description: 'Cut unnecessary parts of your image.',
        category: TOOL_CATEGORIES.IMAGE,
        icon: Crop,
        href: '/tools/crop-image',
        accept: 'image/*',
    },
    {
        id: 'jpg-to-png',
        title: 'JPG to PNG',
        description: 'Convert JPG images to PNG format with transparency.',
        category: TOOL_CATEGORIES.IMAGE,
        icon: ImageIcon,
        href: '/tools/jpg-to-png',
        accept: 'image/jpeg',
    },

    // Document Tools
    {
        id: 'image-to-excel',
        title: 'Image to Excel',
        description: 'Convert images (JPG, PNG) to Editable Excel spreadsheets.',
        category: TOOL_CATEGORIES.DOCUMENT,
        icon: FileSpreadsheet,
        href: '/tools/image-to-excel',
        accept: 'image/*',
    },
    {
        id: 'excel-to-pdf',
        title: 'Excel to PDF',
        description: 'Convert Excel spreadsheets to PDF format.',
        category: TOOL_CATEGORIES.DOCUMENT,
        icon: FileSpreadsheet,
        href: '/tools/excel-to-pdf',
        accept: '.xls,.xlsx',
    },
    {
        id: 'ppt-to-pdf',
        title: 'PowerPoint to PDF',
        description: 'Convert PowerPoint presentations to PDF documents.',
        category: TOOL_CATEGORIES.DOCUMENT,
        icon: Presentation,
        href: '/tools/ppt-to-pdf',
        accept: '.ppt,.pptx',
    },
    {
        id: 'html-to-pdf',
        title: 'HTML to PDF',
        description: 'Convert web pages or HTML files to PDF documents.',
        category: TOOL_CATEGORIES.DOCUMENT,
        icon: FileCode,
        href: '/tools/html-to-pdf',
        accept: '.html,.htm',
    },

    // Video Tools
    {
        id: 'mp4-to-mp3',
        title: 'MP4 to MP3',
        description: 'Extract audio from MP4 video files.',
        category: TOOL_CATEGORIES.VIDEO_AUDIO,
        icon: Zap,
        href: '/tools/mp4-to-mp3',
        accept: 'video/mp4',
    },
];
