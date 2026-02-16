import CategoryPage from '@/components/tools/CategoryPage';
import { TOOL_CATEGORIES } from '@/data/tools';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Document Tools | ilovepdftools',
    description: 'Convert Excel, PowerPoint, and HTML files to PDF with our free online document tools.',
};

export default function DocumentToolsPage() {
    return (
        <CategoryPage
            category={TOOL_CATEGORIES.DOCUMENT}
            title="Document Tools"
            description="Convert your office documents to PDF format instantly."
        />
    );
}
