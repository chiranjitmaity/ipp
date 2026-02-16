import CategoryPage from '@/components/tools/CategoryPage';
import { TOOL_CATEGORIES } from '@/data/tools';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Image Tools | ilovepdftools',
    description: 'Compress, resize, crop, and convert images with our free online image tools.',
};

export default function ImageToolsPage() {
    return (
        <CategoryPage
            category={TOOL_CATEGORIES.IMAGE}
            title="Image Tools"
            description="Resize, compress, crop, and convert your images for free."
        />
    );
}
