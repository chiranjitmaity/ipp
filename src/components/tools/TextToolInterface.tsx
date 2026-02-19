'use client';

import { useState, useRef } from 'react';
import { Copy, RefreshCw, Volume2, Mic, Play, Pause } from 'lucide-react';

interface TextToolProps {
    toolId: string;
    title: string;
    description: string;
}

export const TextToolInterface = ({ toolId, title, description }: TextToolProps) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isListening, setIsListening] = useState(false);

    // Stats
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const chars = inputText.length;
    const lines = inputText.split('\n').length;

    const handleAction = (action: string) => {
        let result = inputText;
        switch (action) {
            case 'upper': result = inputText.toUpperCase(); break;
            case 'lower': result = inputText.toLowerCase(); break;
            case 'title': result = inputText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); break;
            case 'sentence': result = inputText.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, (c) => c.toUpperCase()); break;
            case 'remove-dup':
                result = [...new Set(inputText.split('\n'))].join('\n');
                break;
            case 'reverse': result = inputText.split('').reverse().join(''); break;
        }
        setOutputText(result);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(outputText || inputText);
        // Show toast or something?
    };

    const handleSpeech = () => {
        const utterance = new SpeechSynthesisUtterance(inputText);
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser.');
            return;
        }
        // @ts-ignore
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            setInputText(transcript);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
        setIsListening(!isListening);
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-gray-500 text-lg">{description}</p>
            </div>

            <div className="card p-6 border-2 border-gray-200">
                {toolId === 'word-counter' && (
                    <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                        <div className="p-4 bg-gray-50 rounded">
                            <div className="text-3xl font-bold text-blue-600">{words}</div>
                            <div className="text-sm text-gray-500">Words</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                            <div className="text-3xl font-bold text-green-600">{chars}</div>
                            <div className="text-sm text-gray-500">Characters</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded">
                            <div className="text-3xl font-bold text-purple-600">{lines}</div>
                            <div className="text-sm text-gray-500">Lines</div>
                        </div>
                    </div>
                )}

                <textarea
                    className="w-full p-4 border rounded-lg mb-4 text-base"
                    rows={8}
                    placeholder="Type or paste your text here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{ minHeight: '200px', backgroundColor: 'var(--card)' }}
                />

                <div className="flex flex-wrap gap-2 mb-6">
                    {toolId === 'case-converter' && (
                        <>
                            <button className="btn btn-sm" onClick={() => handleAction('upper')}>UPPERCASE</button>
                            <button className="btn btn-sm" onClick={() => handleAction('lower')}>lowercase</button>
                            <button className="btn btn-sm" onClick={() => handleAction('title')}>Title Case</button>
                            <button className="btn btn-sm" onClick={() => handleAction('sentence')}>Sentence case</button>
                        </>
                    )}
                    {toolId === 'remove-duplicates' && (
                        <button className="btn btn-primary" onClick={() => handleAction('remove-dup')}>Remove Duplicate Lines</button>
                    )}
                    {toolId === 'text-to-speech' && (
                        <button className="btn btn-primary flex items-center gap-2" onClick={handleSpeech}>
                            <Volume2 size={18} /> Speak
                        </button>
                    )}
                    {toolId === 'speech-to-text' && (
                        <button
                            className={`btn flex items-center gap-2 ${isListening ? 'bg-red-500 text-white' : 'btn-primary'}`}
                            onClick={toggleListening}
                        >
                            {isListening ? <Pause size={18} /> : <Mic size={18} />}
                            {isListening ? 'Stop Listening' : 'Start Listening'}
                        </button>
                    )}
                    <button className="btn flex items-center gap-2" onClick={handleCopy}>
                        <Copy size={18} /> Copy
                    </button>
                    <button className="btn flex items-center gap-2" onClick={() => { setInputText(''); setOutputText(''); }}>
                        <RefreshCw size={18} /> Clear
                    </button>
                </div>

                {outputText && (
                    <div className="mt-6">
                        <label className="text-sm font-semibold mb-2 block">Result:</label>
                        <textarea
                            className="w-full p-4 border rounded-lg bg-gray-50"
                            rows={8}
                            readOnly
                            value={outputText}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
