import React, { useRef, useEffect, useState } from 'react';
import { FaCheck, FaTimes, FaPencilAlt, FaEraser } from 'react-icons/fa';

interface ImageMarkupProps {
    imageSrc: string;
    onSave: (blob: Blob) => void;
    onCancel: () => void;
}

const ImageMarkup: React.FC<ImageMarkupProps> = ({ imageSrc, onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ff0000');
    const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        img.onload = () => {
            // Calculate scale to fit screen
            const maxWidth = window.innerWidth * 0.8;
            const maxHeight = window.innerHeight * 0.7;
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            ctx.lineCap = 'round';
            ctx.lineWidth = 3;
        };
    }, [imageSrc]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = tool === 'eraser' ? 20 : 3;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.toBlob((blob) => {
            if (blob) onSave(blob);
        }, 'image/jpeg', 0.8);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="bg-surface p-4 rounded-2xl shadow-2xl flex flex-col gap-4 max-w-full">
                <div className="flex justify-between items-center border-b border-surface-border pb-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">Mark Your Doubt</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setTool('pencil')} className={`p-2 rounded-lg transition-all ${tool === 'pencil' ? 'bg-primary text-white' : 'bg-surface-light text-accent-gray hover:text-primary'}`}><FaPencilAlt size={16} /></button>
                        <button onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-primary text-white' : 'bg-surface-light text-accent-gray hover:text-primary'}`}><FaEraser size={16} /></button>
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 border-none bg-transparent cursor-pointer" />
                    </div>
                </div>

                <div className="relative overflow-hidden cursor-crosshair bg-white rounded-xl touch-none">
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                <div className="flex justify-between items-center pt-2">
                    <button onClick={onCancel} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-dark text-accent-gray font-black uppercase tracking-widest text-xs hover:bg-surface-light transition-all"><FaTimes /> Cancel</button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all"><FaCheck /> Confirm Doubt Area</button>
                </div>
            </div>
        </div>
    );
};

export default ImageMarkup;
