'use client';

import { useState } from 'react';
import { Copy, RefreshCw, Code, CheckCircle, AlertTriangle } from 'lucide-react';

interface DeveloperToolProps {
    toolId: string;
    title: string;
    description: string;
}

export const DeveloperToolInterface = ({ toolId, title, description }: DeveloperToolProps) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const process = () => {
        setError('');
        try {
            switch (toolId) {
                case 'json-formatter':
                    const parsed = JSON.parse(input);
                    setOutput(JSON.stringify(parsed, null, 4));
                    break;
                case 'base64-encode':
                    // Simple text to base64
                    setOutput(btoa(input));
                    break;
                case 'html-minifier':
                    // Basic regex minification
                    setOutput(input.replace(/\s+/g, ' ').replace(/> </g, '><').trim());
                    break;
                case 'css-minifier':
                    setOutput(input.replace(/\s+/g, ' ').replace(/:\s+/g, ':').replace(/;\s+/g, ';').replace(/}\s+/g, '}').replace(/{\s+/g, '{').trim());
                    break;
                case 'js-minifier':
                    // Very basic
                    setOutput(input.replace(/\s+/g, ' ').replace(/;\s+/g, ';').replace(/{\s+/g, '{').replace(/}\s+/g, '}').trim());
                    break;
                case 'xml-formatter':
                    // Basic XML formatting (indentation)
                    let formatted = '';
                    let indent = 0;
                    input.split(/>\s*</).forEach(node => {
                        if (node.match(/^\/\w/)) indent--;
                        formatted += new Array(indent).fill('    ').join('') + '<' + node + '>\r\n';
                        if (node.match(/^<?\w[^>]*[^\/]$/)) indent++;
                    });
                    setOutput(formatted.substring(1, formatted.length - 3));
                    break;
                default:
                    setOutput("Tool logic not implemented yet.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Processing failed');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-gray-500 text-lg">{description}</p>
            </div>

            <div className="card p-6 border-2 border-gray-200">
                <div className="mb-4">
                    <label className="font-semibold block mb-2">Input</label>
                    <textarea
                        className="w-full p-4 border rounded-lg font-mono text-sm"
                        rows={10}
                        placeholder="Paste your code here..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{ backgroundColor: 'var(--card)' }}
                    />
                </div>

                <div className="flex gap-4 mb-6">
                    <button className="btn btn-primary flex items-center gap-2" onClick={process}>
                        <Code size={18} /> Process
                    </button>
                    <button className="btn flex items-center gap-2" onClick={() => { setInput(''); setOutput(''); setError(''); }}>
                        <RefreshCw size={18} /> Clear
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        {error}
                    </div>
                )}

                {output && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-semibold">Output</label>
                            <button className="btn btn-sm flex items-center gap-2" onClick={handleCopy}>
                                <Copy size={16} /> Copy
                            </button>
                        </div>
                        <textarea
                            className="w-full p-4 border rounded-lg bg-gray-50 font-mono text-sm"
                            rows={10}
                            readOnly
                            value={output}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
