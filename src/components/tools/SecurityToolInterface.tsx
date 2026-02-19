'use client';

import { useState } from 'react';
import { Key, Lock, Unlock, Copy, RefreshCw } from 'lucide-react';

interface SecurityToolProps {
    toolId: string;
    title: string;
    description: string;
}

export const SecurityToolInterface = ({ toolId, title, description }: SecurityToolProps) => {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeUppercase, setIncludeUppercase] = useState(true);

    const generatePassword = () => {
        let charset = 'abcdefghijklmnopqrstuvwxyz';
        if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers) charset += '0123456789';
        if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let retVal = '';
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setPassword(retVal);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        // Toast logic here
    };

    if (toolId === 'password-generator') {
        return (
            <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-gray-500 text-lg">{description}</p>
                </div>

                <div className="card p-8 border-2 border-gray-200">
                    <div className="bg-gray-100 p-6 rounded-lg mb-6 flex items-center justify-between">
                        <span className="text-2xl font-mono break-all">{password || 'Click Generate'}</span>
                        <div className="flex gap-2">
                            <button className="btn btn-ghost p-2" onClick={copyToClipboard} title="Copy">
                                <Copy size={20} />
                            </button>
                            <button className="btn btn-ghost p-2" onClick={generatePassword} title="Regenerate">
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">Password Length: {length}</label>
                            <input
                                type="range" min="6" max="64" value={length}
                                onChange={(e) => setLength(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={includeUppercase} onChange={e => setIncludeUppercase(e.target.checked)} />
                                Uppercase
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)} />
                                Numbers
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} />
                                Symbols
                            </label>
                        </div>

                        <button className="btn btn-primary w-full py-4 text-lg mt-4" onClick={generatePassword}>
                            Generate Password
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container text-center p-8">
            <h1>{title}</h1>
            <p>This security tool requires backend processing. Please use the main interface.</p>
        </div>
    );
};
