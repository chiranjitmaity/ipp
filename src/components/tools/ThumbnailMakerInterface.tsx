'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Download, Type, Image as ImageIcon, Trash2, Plus, Move, Sparkles, Layers,
    Grid, Lock, Unlock, Eye, EyeOff, Copy, Undo, Redo, ZoomIn, ZoomOut,
    AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
    ChevronDown, ChevronRight, X, Play, RotateCcw, RotateCw, Settings,
    LayoutTemplate, Shapes, Palette, Sticker, ImagePlus, User, Sliders,
    Monitor, Smartphone, Crop, MousePointer2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import dynamic from 'next/dynamic';

const Moveable = dynamic(() => import('react-moveable'), { ssr: false });

// --- Types ---
export type LayerType = 'text' | 'image' | 'shape' | 'sticker';

export interface BaseLayer {
    id: string;
    type: LayerType;
    name: string;
    visible: boolean;
    locked: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
}

export interface TextLayer extends BaseLayer {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    textDecoration: string;
    color: string;
    backgroundColor: string;
    textAlign: 'left' | 'center' | 'right';
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    strokeColor: string;
    strokeWidth: number;
}

export interface ImageLayer extends BaseLayer {
    type: 'image' | 'sticker';
    src: string;
    filter: string;
    brightness: number;
    contrast: number;
    saturate: number;
    blur: number;
    borderRadius: number;
    borderColor: string;
    borderWidth: number;
}

export interface ShapeLayer extends BaseLayer {
    type: 'shape';
    shapeType: 'rect' | 'circle' | 'triangle';
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    borderRadius: number;
}

export type Layer = TextLayer | ImageLayer | ShapeLayer;

// --- Constants ---
const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const FONTS = ['Impact', 'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black'];

const TEMPLATES = [
    {
        name: 'Gaming',
        bg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1280&q=80',
        layers: [
            { id: 't1', type: 'text', name: 'Title', visible: true, locked: false, x: 50, y: 50, width: 800, height: 150, rotation: -5, opacity: 1, text: 'EPIC HIGHLIGHTS', fontSize: 130, fontFamily: 'Impact', fontWeight: 'bold', color: '#fbbf24', strokeWidth: 5, strokeColor: '#000', shadowColor: '#000', shadowBlur: 0, shadowOffsetX: 8, shadowOffsetY: 8, textAlign: 'left' } as TextLayer,
        ]
    },
    {
        name: 'Tech',
        bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&q=80',
        layers: [
            { id: 't2', type: 'text', name: 'Review', visible: true, locked: false, x: 100, y: 300, width: 800, height: 120, rotation: 0, opacity: 1, text: 'FULL REVIEW', fontSize: 100, fontFamily: 'Arial Black', fontWeight: 'bold', color: '#fff', strokeWidth: 2, strokeColor: '#000', shadowColor: '#000', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 0, textAlign: 'left' } as TextLayer,
        ]
    }
];

// --- Components ---
const ToolButton = ({ icon, label, onClick, active }: any) => (
    <button
        onClick={onClick}
        title={label}
        className={`w-14 h-14 flex flex-col items-center justify-center gap-1 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-[#333] hover:text-white'}`}
    >
        {icon}
        <span className="text-[9px] font-medium">{label}</span>
    </button>
);

const ToolbarInput = ({ icon, value, onChange, type = 'number', min, max }: any) => (
    <div className="flex items-center gap-2 bg-[#111] px-2 py-1 rounded border border-[#333]">
        {icon && <div className="text-slate-400">{icon}</div>}
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            min={min} max={max}
            className="bg-transparent text-white text-xs outline-none w-12 text-center"
        />
    </div>
);

// --- Main Interface ---
export const ThumbnailMakerInterface = ({ toolId, title, description }: { toolId: string, title: string, description: string }) => {
    // Canvas State
    const [scale, setScale] = useState(1);
    const [layers, setLayers] = useState<Layer[]>([
        { id: '1', type: 'text', name: 'Start', visible: true, locked: false, x: 300, y: 280, width: 680, height: 120, rotation: 0, opacity: 1, text: 'CREATE AMAZING\nTHUMBNAILS', fontSize: 80, fontFamily: 'Impact', fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', textAlign: 'center', shadowColor: '#000000', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 5, strokeColor: '#000000', strokeWidth: 0, fontStyle: 'normal', textDecoration: 'none' } as TextLayer
    ]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'templates' | 'text' | 'images' | 'shapes' | 'background'>('templates');
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState('#222');

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [guidelines, setGuidelines] = useState<HTMLElement[]>([]);
    const [moveableTarget, setMoveableTarget] = useState<HTMLElement | null>(null);

    // --- History State ---
    const [history, setHistory] = useState<Layer[][]>([
        [{ id: '1', type: 'text', name: 'Start', visible: true, locked: false, x: 300, y: 280, width: 680, height: 120, rotation: 0, opacity: 1, text: 'CREATE AMAZING\nTHUMBNAILS', fontSize: 80, fontFamily: 'Impact', fontWeight: 'bold', color: '#ffffff', backgroundColor: 'transparent', textAlign: 'center', shadowColor: '#000000', shadowBlur: 10, shadowOffsetX: 0, shadowOffsetY: 5, strokeColor: '#000000', strokeWidth: 0, fontStyle: 'normal', textDecoration: 'none' } as TextLayer]
    ]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // --- Auto Scale Logic ---
    const handleResize = () => {
        if (!containerRef.current) return;
        const { offsetWidth, offsetHeight } = containerRef.current;
        const padding = 300;
        const scaleX = (offsetWidth - padding) / CANVAS_WIDTH;
        const scaleY = (offsetHeight - padding) / CANVAS_HEIGHT;
        const fitScale = Math.min(scaleX, scaleY);
        setScale(fitScale > 0 ? fitScale : 0.4);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        setTimeout(handleResize, 100);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (selectedLayerId) {
            setMoveableTarget(document.getElementById(selectedLayerId));
        } else {
            setMoveableTarget(null);
        }
    }, [selectedLayerId, layers]);

    useEffect(() => {
        const newGuidelines = layers
            .filter(l => l.id !== selectedLayerId)
            .map(l => document.getElementById(l.id))
            .filter(Boolean) as HTMLElement[];
        setGuidelines(newGuidelines);
    }, [layers, selectedLayerId]);

    // --- Helpers ---
    // --- Helpers & History ---
    const addToHistory = (newLayers: Layer[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newLayers);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setLayers(history[historyIndex - 1]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setLayers(history[historyIndex + 1]);
        }
    };

    const updateLayer = (id: string, updates: Partial<Layer>, saveHistory = true) => {
        const newLayers = layers.map(l => l.id === id ? { ...l, ...updates } as Layer : l);
        setLayers(newLayers);
        if (saveHistory) addToHistory(newLayers);
    };

    const addLayer = (l: Layer) => {
        const newLayers = [...layers, l];
        setLayers(newLayers);
        setSelectedLayerId(l.id);
        addToHistory(newLayers);
    };

    const reorderLayer = (action: 'front' | 'back' | 'forward' | 'backward') => {
        if (!selectedLayerId) return;
        const index = layers.findIndex(l => l.id === selectedLayerId);
        if (index === -1) return;

        const newLayers = [...layers];
        const layer = newLayers.splice(index, 1)[0];

        if (action === 'front') newLayers.push(layer);
        else if (action === 'back') newLayers.unshift(layer);
        else if (action === 'forward') newLayers.splice(Math.min(index + 1, layers.length), 0, layer);
        else if (action === 'backward') newLayers.splice(Math.max(index - 1, 0), 0, layer);

        setLayers(newLayers);
        addToHistory(newLayers);
    };

    const getSelected = () => layers.find(l => l.id === selectedLayerId);

    const download = async () => {
        if (!canvasRef.current) return;
        setSelectedLayerId(null);
        await new Promise(r => setTimeout(r, 50));
        const canvas = await html2canvas(canvasRef.current, { useCORS: true, scale: 2 });
        const a = document.createElement('a');
        a.href = canvas.toDataURL();
        a.download = 'thumbnail.png';
        a.click();
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#1e1e1e] text-slate-200 overflow-hidden font-sans">

            {/* 1. Header */}
            <header className="h-16 bg-[#252525] border-b border-[#333] flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-1.5 rounded-lg text-white"><Play size={20} fill="white" /></div>
                    <h1 className="font-bold text-lg tracking-wide text-white">ThumbMaker <span className="text-xs text-blue-400 font-normal px-2 py-0.5 bg-blue-400/10 rounded-full">Easy</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-slate-400 hover:text-white" onClick={undo} title="Undo" disabled={historyIndex === 0} style={{ opacity: historyIndex === 0 ? 0.3 : 1 }}><Undo size={18} /></button>
                    <button className="text-slate-400 hover:text-white" onClick={redo} title="Redo" disabled={historyIndex === history.length - 1} style={{ opacity: historyIndex === history.length - 1 ? 0.3 : 1 }}><Redo size={18} /></button>
                    <div className="w-px h-6 bg-[#333] mx-2" />
                    <button className="text-slate-400 hover:text-white" onClick={() => { setLayers([]); setBgImage(null); setBgColor('#222'); addToHistory([]); }} title="Reset"><Trash2 size={18} /></button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-transform active:scale-95" onClick={download}>
                        <Download size={18} /> Download
                    </button>
                </div>
            </header>

            {/* 2. Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Sidebar (Tools) */}
                <div className="w-20 bg-[#252525] border-r border-[#333] flex flex-col items-center py-6 gap-4 z-40">
                    <ToolButton icon={<LayoutTemplate size={22} />} label="Templates" active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} />
                    <ToolButton icon={<Type size={22} />} label="Text" active={activeTab === 'text'} onClick={() => setActiveTab('text')} />
                    <ToolButton icon={<ImageIcon size={22} />} label="Images" active={activeTab === 'images'} onClick={() => setActiveTab('images')} />
                    <ToolButton icon={<Shapes size={22} />} label="Shapes" active={activeTab === 'shapes'} onClick={() => setActiveTab('shapes')} />
                    <ToolButton icon={<Palette size={22} />} label="Background" active={activeTab === 'background'} onClick={() => setActiveTab('background')} />
                </div>

                {/* Drawer (Content) */}
                <div className="w-72 bg-[#1a1a1a] border-r border-[#333] flex flex-col z-30 transition-all">
                    <div className="p-4 border-b border-[#333] font-bold text-white capitalize">{activeTab}</div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeTab === 'templates' && TEMPLATES.map((t, i) => (
                            <div key={i} className="aspect-video bg-cover bg-center rounded-lg border border-[#333] hover:border-blue-500 cursor-pointer overflow-hidden relative group" style={{ backgroundImage: `url(${t.bg})` }} onClick={() => { setLayers(t.layers.map(l => ({ ...l, id: Math.random().toString() })) as any); setBgImage(t.bg); }}>
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center font-bold text-white transition-opacity">{t.name}</div>
                            </div>
                        ))}

                        {activeTab === 'text' && (
                            <>
                                <button className="w-full py-4 bg-[#252525] border border-[#333] rounded hover:border-blue-500 font-bold text-2xl text-white" onClick={() => addLayer({ id: Date.now().toString(), type: 'text', name: 'Heading', visible: true, locked: false, x: 200, y: 300, width: 880, height: 120, rotation: 0, opacity: 1, text: 'ADD HEADING', fontSize: 100, fontFamily: 'Impact', fontWeight: 'bold', color: '#fff', textAlign: 'center', strokeWidth: 3, strokeColor: '#000', shadowColor: '#000', shadowBlur: 0, shadowOffsetX: 5, shadowOffsetY: 5 } as any)}>Add Heading</button>
                                <button className="w-full py-3 bg-[#252525] border border-[#333] rounded hover:border-blue-500 font-semibold text-lg text-slate-300" onClick={() => addLayer({ id: Date.now().toString(), type: 'text', name: 'Subheading', visible: true, locked: false, x: 300, y: 400, width: 680, height: 80, rotation: 0, opacity: 1, text: 'Add Subheading', fontSize: 60, fontFamily: 'Arial', fontWeight: 'bold', color: '#fff', textAlign: 'center', strokeWidth: 0 } as any)}>Add Subheading</button>
                            </>
                        )}

                        {activeTab === 'images' && (
                            <button className="w-full aspect-square border-2 border-dashed border-[#444] rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-blue-500" onClick={() => fileInputRef.current?.click()}>
                                <ImagePlus size={32} className="mb-2" /> <span>Upload</span>
                            </button>
                        )}

                        {activeTab === 'background' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-2">Detailed Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={bgColor} onChange={(e) => { setBgColor(e.target.value); setBgImage(null); }} className="w-full h-10 rounded cursor-pointer bg-transparent" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-2">Quick Colors</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['#111', '#444', '#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899', '#f97316', '#06b6d4'].map(c => (
                                            <button key={c} className="w-8 h-8 rounded-full border border-white/10 hover:border-white shadow-sm" style={{ backgroundColor: c }} onClick={() => { setBgColor(c); setBgImage(null); }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="border-t border-[#333] pt-4">
                                    <button className="w-full py-3 bg-[#252525] border border-[#333] rounded hover:border-blue-500 text-sm font-bold flex items-center justify-center gap-2" onClick={() => fileInputRef.current?.click()}>
                                        <ImagePlus size={16} /> Upload Background
                                    </button>
                                </div>
                            </div>
                        )}

                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                            if (e.target.files?.[0]) {
                                const url = URL.createObjectURL(e.target.files[0]);
                                if (activeTab === 'background') {
                                    setBgImage(url);
                                } else {
                                    addLayer({ id: Date.now().toString(), type: 'image', name: 'Upload', visible: true, locked: false, x: 400, y: 200, width: 400, height: 400, rotation: 0, opacity: 1, src: url, brightness: 100, contrast: 100, blur: 0, borderRadius: 0 } as any);
                                }
                            }
                        }} />
                    </div>
                </div>

                {/* Main Canvas Workspace */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0f0f0f] relative">

                    {/* Top Context Bar (Replaces Right Sidebar) */}
                    <div className="h-14 bg-[#202020] border-b border-[#333] flex items-center px-4 gap-4 overflow-x-auto whitespace-nowrap z-20 shadow-md">
                        {selectedLayerId && getSelected() ? (
                            <>
                                {getSelected()?.type === 'text' && (
                                    <>
                                        <div className="flex items-center gap-2 pr-4 border-r border-[#333]">
                                            <select value={(getSelected() as TextLayer).fontFamily} onChange={(e) => updateLayer(selectedLayerId!, { fontFamily: e.target.value })} className="bg-[#111] text-white text-xs p-1 rounded border border-[#333] outline-none w-24">
                                                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            <ToolbarInput value={(getSelected() as TextLayer).fontSize} onChange={(v: number) => updateLayer(selectedLayerId!, { fontSize: v })} type="number" />
                                        </div>
                                        <div className="flex items-center gap-2 pr-4 border-r border-[#333]">
                                            <input type="color" value={(getSelected() as TextLayer).color} onChange={(e) => updateLayer(selectedLayerId!, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
                                            <div className="flex gap-1 bg-[#111] p-1 rounded border border-[#333]">
                                                <button onClick={() => updateLayer(selectedLayerId!, { fontWeight: (getSelected() as TextLayer).fontWeight === 'bold' ? 'normal' : 'bold' })} className={`p-1 rounded ${(getSelected() as TextLayer).fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><Bold size={14} /></button>
                                                <button onClick={() => updateLayer(selectedLayerId!, { fontStyle: (getSelected() as TextLayer).fontStyle === 'italic' ? 'normal' : 'italic' })} className={`p-1 rounded ${(getSelected() as TextLayer).fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}><Italic size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1"><span className="text-[10px] text-slate-500 w-2">X</span><input type="number" value={Math.round(getSelected()!.x)} onChange={(e) => updateLayer(selectedLayerId!, { x: Number(e.target.value) })} className="w-10 bg-[#111] border border-[#333] text-[10px] text-center rounded outline-none" /></div>
                                            <div className="flex items-center gap-1"><span className="text-[10px] text-slate-500 w-2">Y</span><input type="number" value={Math.round(getSelected()!.y)} onChange={(e) => updateLayer(selectedLayerId!, { y: Number(e.target.value) })} className="w-10 bg-[#111] border border-[#333] text-[10px] text-center rounded outline-none" /></div>
                                        </div>
                                        {/* Layer Order */}
                                        <div className="flex flex-col gap-1 ml-2 border-l border-[#333] pl-2">
                                            <div className="flex gap-1">
                                                <button onClick={() => reorderLayer('front')} title="Bring to Front" className="p-1 hover:bg-[#333] rounded"><Layers size={10} className="stroke-[3]" /></button>
                                                <button onClick={() => reorderLayer('forward')} title="Bring Forward" className="p-1 hover:bg-[#333] rounded"><ChevronDown size={10} className="rotate-180" /></button>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => reorderLayer('back')} title="Send to Back" className="p-1 hover:bg-[#333] rounded opacity-50"><Layers size={10} /></button>
                                                <button onClick={() => reorderLayer('backward')} title="Send Backward" className="p-1 hover:bg-[#333] rounded"><ChevronDown size={10} /></button>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {getSelected()?.type === 'image' && (
                                    <>
                                        <span className="text-xs text-slate-500 uppercase mr-2">Filters</span>
                                        <ToolbarInput icon={<Sparkles size={12} />} value={(getSelected() as ImageLayer).brightness} onChange={(v: number) => updateLayer(selectedLayerId!, { brightness: v })} min={0} max={200} />
                                        <ToolbarInput icon={<Sliders size={12} />} value={(getSelected() as ImageLayer).contrast} onChange={(v: number) => updateLayer(selectedLayerId!, { contrast: v })} min={0} max={200} />
                                        <span className="text-xs text-slate-500 uppercase ml-4 mr-2">Radius</span>
                                        <ToolbarInput icon={<Crop size={12} />} value={(getSelected() as ImageLayer).borderRadius} onChange={(v: number) => updateLayer(selectedLayerId!, { borderRadius: v })} min={0} max={200} />
                                    </>
                                )}
                                <div className="flex-1" />
                                <button className="text-red-500 hover:text-red-400 p-2 hover:bg-[#333] rounded-full" onClick={() => { setLayers(layers.filter(l => l.id !== selectedLayerId)); setSelectedLayerId(null); }}><Trash2 size={18} /></button>
                            </>
                        ) : (
                            <div className="text-slate-500 text-sm flex items-center gap-2"><MousePointer2 size={16} /> Select an element on the canvas to edit</div>
                        )}
                    </div>

                    {/* Canvas Container (Auto-Scaled) */}
                    <div ref={containerRef} className="flex-1 overflow-hidden flex items-center justify-center bg-[#121212] p-8" onClick={() => setSelectedLayerId(null)}>
                        <div
                            className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-white transition-transform duration-200"
                            style={{
                                width: CANVAS_WIDTH, height: CANVAS_HEIGHT,
                                transform: `scale(${scale})`,
                                backgroundColor: bgColor,
                                backgroundImage: bgImage ? `url(${bgImage})` : undefined,
                                backgroundSize: 'cover', backgroundPosition: 'center',
                            }}
                            ref={canvasRef}
                        >
                            {layers.map(layer => {
                                const isSelected = selectedLayerId === layer.id;
                                return (
                                    <div key={layer.id} id={layer.id} className="absolute" style={{ left: layer.x, top: layer.y, width: layer.width, height: layer.height, transform: `rotate(${layer.rotation}deg)`, zIndex: isSelected ? 50 : 1 }} onClick={(e) => { e.stopPropagation(); setSelectedLayerId(layer.id); }}>
                                        {layer.type === 'text' && (
                                            <div style={{ width: '100%', height: '100%', fontFamily: (layer as TextLayer).fontFamily, fontSize: (layer as TextLayer).fontSize, color: (layer as TextLayer).color, fontWeight: (layer as TextLayer).fontWeight, textAlign: (layer as TextLayer).textAlign, fontStyle: (layer as TextLayer).fontStyle, textShadow: `${(layer as TextLayer).shadowOffsetX}px ${(layer as TextLayer).shadowOffsetY}px ${(layer as TextLayer).shadowBlur}px ${(layer as TextLayer).shadowColor}`, WebkitTextStroke: `${(layer as TextLayer).strokeWidth}px ${(layer as TextLayer).strokeColor}`, display: 'flex', alignItems: 'center', justifyContent: (layer as TextLayer).textAlign, whiteSpace: 'pre-wrap' }} onDoubleClick={() => { const t = prompt('Edit:', (layer as TextLayer).text); if (t) updateLayer(layer.id, { text: t }) }}> {(layer as TextLayer).text} </div>
                                        )}
                                        {layer.type === 'image' && <img src={(layer as ImageLayer).src} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `brightness(${(layer as ImageLayer).brightness}%) contrast(${(layer as ImageLayer).contrast}%) blur(${(layer as ImageLayer).blur}px)`, borderRadius: (layer as ImageLayer).borderRadius, pointerEvents: 'none' }} />}
                                        {layer.type === 'shape' && <div style={{ width: '100%', height: '100%', backgroundColor: (layer as ShapeLayer).fillColor, borderRadius: (layer as ShapeLayer).shapeType === 'circle' ? '50%' : '0px' }} />}
                                    </div>
                                )
                            })}
                            <Moveable
                                key={selectedLayerId}
                                target={moveableTarget}
                                draggable={true}
                                resizable={true}
                                rotatable={true}
                                snappable={true}
                                snapDirections={{ "top": true, "left": true, "bottom": true, "right": true, "center": true, "middle": true }}
                                elementGuidelines={guidelines}
                                onDrag={e => {
                                    e.target.style.left = `${e.left}px`;
                                    e.target.style.top = `${e.top}px`;
                                    // Don't save history on every drag frame
                                    updateLayer(e.target.id, { x: e.left, y: e.top }, false);
                                }}
                                onDragEnd={() => {
                                    // Save history once drag is done
                                    addToHistory(layers);
                                }}
                                onResize={e => {
                                    e.target.style.width = `${e.width}px`;
                                    e.target.style.height = `${e.height}px`;
                                    e.target.style.transform = e.drag.transform;
                                    updateLayer(e.target.id, { width: e.width, height: e.height }, false);
                                }}
                                onResizeEnd={() => addToHistory(layers)}
                                onRotate={e => {
                                    e.target.style.transform = e.drag.transform;
                                    updateLayer(e.target.id, { rotation: e.rotation }, false);
                                }}
                                onRotateEnd={() => addToHistory(layers)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Global Styles */}
            <style jsx>{`
                input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                .moveable-control-box { z-index: 9999 !important; }
            `}</style>
        </div>
    );
};
