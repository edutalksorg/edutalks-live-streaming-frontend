import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

interface WhiteboardProps {
    className?: string;
    onDraw?: (data: any) => void;
    onClear?: () => void;
    receiveData?: any;
    isInstructor?: boolean;
}

const Whiteboard = forwardRef<any, WhiteboardProps>(({ className, onDraw, onClear, isInstructor }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#FFFFFF');
    const [lineWidth, setLineWidth] = useState(2);
    const lastPointRef = useRef<{ x: number, y: number } | null>(null);

    useImperativeHandle(ref, () => ({
        clearCanvas: (sync: boolean) => clearCanvas(sync),
        drawRemote: (data: any) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                drawOnCanvas(ctx, data.x, data.y, data.prevX, data.prevY, data.color, data.lineWidth);
            }
        }
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas to fit container
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);


    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isInstructor) return;
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPointRef.current = null;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.beginPath();
        }
    };

    const draw = (e: any) => {
        if (!isDrawing || !isInstructor) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

        const prevX = lastPointRef.current?.x;
        const prevY = lastPointRef.current?.y;

        if (onDraw) {
            onDraw({ x, y, prevX, prevY, color, lineWidth });
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        if (prevX && prevY) ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastPointRef.current = { x, y };
    };

    const drawOnCanvas = (ctx: CanvasRenderingContext2D, x: number, y: number, prevX: number, prevY: number, color: string, width: number) => {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        if (prevX != null && prevY != null) {
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
        } else {
            // If no previous point, just draw a dot
            ctx.arc(x, y, width / 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.stroke();
    };

    const clearCanvas = (sync: boolean = true) => {
        if (!isInstructor && sync) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
            }
        }
        if (sync && onClear) onClear();
    };

    return (
        <div className={`relative w-full h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner ${className}`}>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="w-full h-full cursor-crosshair"
            />
            {isInstructor && (
                <div className="absolute top-4 left-4 flex items-center gap-3 bg-white/90 backdrop-blur-md p-2 px-3 rounded-xl border border-slate-200 shadow-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Ink</span>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => {
                                // Prevent false positive blur trigger
                                e.stopPropagation();
                            }}
                            className="w-6 h-6 rounded border-none bg-transparent cursor-pointer"
                        />
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200"></div>
                    <select
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="bg-slate-50 text-slate-900 text-[10px] font-bold border-slate-100 p-1.5 rounded-lg focus:border-primary outline-none"
                    >
                        <option value="2">Thin</option>
                        <option value="5">Medium</option>
                        <option value="10">Thick</option>
                    </select>
                    <button
                        onClick={() => clearCanvas(true)}
                        className="px-4 py-1.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                        Clear
                    </button>
                </div>
            )}
        </div>
    );
});

export default Whiteboard;
