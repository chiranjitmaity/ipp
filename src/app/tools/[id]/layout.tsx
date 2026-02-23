import { Metadata } from 'next';
import { TOOLS } from '@/data/tools';

interface Props {
    params: Promise<{ id: string }>;
    children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const tool = TOOLS.find(t => t.id === id);

    if (!tool) {
        return {
            title: 'Tool Not Found | PDF FILE Converter',
        };
    }

    return {
        title: `${tool.title} | Free Online PDF & File Converter`,
        description: tool.description,
        openGraph: {
            title: `${tool.title} | PDF FILE Converter`,
            description: tool.description,
            url: `/tools/${tool.id}`,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: tool.title,
            description: tool.description,
        }
    };
}

export default function ToolLayout({ children }: Props) {
    return <>{children}</>;
}
