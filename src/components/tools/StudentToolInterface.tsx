'use client';

import { useState, useRef } from 'react';
import { Download, CreditCard, Award } from 'lucide-react';

interface StudentToolProps {
    toolId: string;
    title: string;
    description: string;
}

export const StudentToolInterface = ({ toolId, title, description }: StudentToolProps) => {
    const [name, setName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [course, setCourse] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateIDCard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 250);

        // Border
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, 400, 250);

        // Header
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, 400, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText("STUDENT IDENTITY CARD", 80, 32);

        // Details
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(`Name: ${name}`, 20, 100);
        ctx.fillText(`ID No: ${idNumber}`, 20, 140);
        ctx.fillText(`Course: ${course}`, 20, 180);

        // Photo Placeholder
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(280, 80, 100, 120);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.strokeRect(280, 80, 100, 120);
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Arial';
        ctx.fillText("PHOTO", 310, 145);

        setGeneratedImage(canvas.toDataURL('image/png'));
    };

    const generateCertificate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#fffbeb';
        ctx.fillRect(0, 0, 600, 400);

        // Border
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, 600, 400);

        // Content
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';

        ctx.font = 'bold 40px Times New Roman';
        ctx.fillText("CERTIFICATE", 300, 80);

        ctx.font = '20px Arial';
        ctx.fillText("OF COMPLETION", 300, 110);

        ctx.font = 'italic 18px Arial';
        ctx.fillText("This is to certify that", 300, 160);

        ctx.font = 'bold 30px Arial';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(name.toUpperCase() || "YOUR NAME", 300, 210);

        ctx.fillStyle = '#000000';
        ctx.font = '18px Arial';
        ctx.fillText("Has successfully completed the course", 300, 250);

        ctx.font = 'bold 24px Arial';
        ctx.fillText(course || "COURSE NAME", 300, 290);

        const date = new Date().toLocaleDateString();
        ctx.font = '16px Arial';
        ctx.fillText(`Date: ${date}`, 100, 360);
        ctx.fillText(`Signature`, 500, 360);
        ctx.beginPath();
        ctx.moveTo(450, 340);
        ctx.lineTo(550, 340);
        ctx.stroke();

        setGeneratedImage(canvas.toDataURL('image/png'));
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.download = `${toolId}_${Date.now()}.png`;
        link.href = generatedImage;
        link.click();
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem' }}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">{title}</h1>
                <p className="text-gray-500 text-lg">{description}</p>
            </div>

            <div className="card p-6 border-2 border-gray-200">
                <div className="grid gap-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Full Name</label>
                        <input
                            type="text"
                            className="p-3 border rounded-lg"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {toolId === 'id-card-generator' && (
                        <div className="flex flex-col gap-2">
                            <label className="font-semibold">ID Number</label>
                            <input
                                type="text"
                                className="p-3 border rounded-lg"
                                placeholder="ST-12345"
                                value={idNumber}
                                onChange={(e) => setIdNumber(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="font-semibold">Course / Description</label>
                        <input
                            type="text"
                            className="p-3 border rounded-lg"
                            placeholder="Computer Science"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn btn-primary py-4 text-lg"
                        onClick={toolId === 'id-card-generator' ? generateIDCard : generateCertificate}
                    >
                        Generate {toolId === 'id-card-generator' ? 'ID Card' : 'Certificate'}
                    </button>
                </div>

                <div className="flex justify-center mb-4">
                    {/* Hidden Canvas for Generation */}
                    <canvas
                        ref={canvasRef}
                        width={toolId === 'id-card-generator' ? 400 : 600}
                        height={toolId === 'id-card-generator' ? 250 : 400}
                        className="border shadow-lg"
                        style={{ maxWidth: '100%', height: 'auto', display: generatedImage ? 'none' : 'block' }}
                    />
                    {generatedImage && (
                        <img src={generatedImage} alt="Generated" className="border shadow-lg max-w-full" />
                    )}
                </div>

                {generatedImage && (
                    <button className="btn w-full flex items-center justify-center gap-2" onClick={handleDownload}>
                        <Download size={20} /> Download
                    </button>
                )}
            </div>
        </div>
    );
};
