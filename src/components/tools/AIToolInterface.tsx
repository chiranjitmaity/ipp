'use client';

import { useState } from 'react';
import { Bot, Sparkles, AlertCircle } from 'lucide-react';

interface AIToolProps {
    toolId: string;
    title: string;
    description: string;
}

export const AIToolInterface = ({ toolId, title, description }: AIToolProps) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');

    const handleSimulate = () => {
        setLoading(true);
        // Simulate API delay
        setTimeout(() => {
            let mockResponse = '';
            switch (toolId) {
                case 'ai-pdf-summarizer':
                    mockResponse = "Summary of document:\n\n1. Introduction: The document outlines the key strategies for sustainable growth.\n2. Methodology: Data was collected from 500 participants.\n3. Conclusion: The results indicate a 20% increase in efficiency.";
                    break;
                case 'ai-resume-builder':
                    mockResponse = "Generated Resume Structure:\n\n- Name: [Your Name]\n- Experience: 5 Years in Software Development\n- Skills: React, Node.js, TypeScript\n- Education: Bachelor's in CS";
                    break;
                case 'ai-translator':
                    mockResponse = "Translated Text (Spanish):\n\nHola, ¿cómo estás? Esto es una traducción generada por IA.";
                    break;
                default:
                    mockResponse = "AI generated content would appear here based on your input.";
            }
            setOutput(mockResponse);
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            <div className="text-center mb-8">
                <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
                    <Bot size={40} className="text-purple-600" />
                </div>
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-gray-500 text-lg">{description}</p>
            </div>

            <div className="card p-6 border-2 border-purple-100 shadow-lg">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex gap-3 text-yellow-800 text-sm">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>This is a demo mode. To use the real AI features, you would typically need to configure an OpenAI API Key in the settings.</p>
                </div>

                <div className="mb-6">
                    <label className="font-semibold block mb-2">Input Content / Context</label>
                    <textarea
                        className="w-full p-4 border rounded-lg"
                        rows={6}
                        placeholder={toolId === 'ai-resume-builder' ? "Enter your skills, experience, and education..." : "Paste text or describe what you want..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>

                <button
                    className="btn bg-purple-600 hover:bg-purple-700 text-white w-full py-4 text-lg flex items-center justify-center gap-2"
                    onClick={handleSimulate}
                    disabled={loading}
                >
                    {loading ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <Sparkles size={20} /> Generate with AI
                        </>
                    )}
                </button>

                {output && (
                    <div className="mt-8">
                        <label className="font-semibold block mb-2">AI Output</label>
                        <textarea
                            className="w-full p-4 border rounded-lg bg-purple-50"
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
