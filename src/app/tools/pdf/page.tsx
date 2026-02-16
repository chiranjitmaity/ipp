import CategoryPage from '@/components/tools/CategoryPage';
import { TOOL_CATEGORIES } from '@/data/tools';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'PDF Tools | ilovepdftools',
    description: 'Merge, split, compress, and convert PDF files with our free online PDF tools.',
};

export default function PDFToolsPage() {
    return (
        <CategoryPage
            category={TOOL_CATEGORIES.PDF}
            title="PDF Tools"
            description="All the tools you need to work with PDF files. Merge, split, compress, convert, and more."
        />
    );
}
