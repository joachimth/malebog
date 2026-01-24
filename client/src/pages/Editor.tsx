import { useEffect, useRef, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useMotif } from "@/hooks/use-motifs";
import { useSaveDrawing, useGetDrawing } from "@/hooks/use-drawings";
import { Toolbar, ToolType } from "@/components/Toolbar";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export default function Editor() {
  const [match, params] = useRoute("/editor/:id");
  const [matchSaved, paramsSaved] = useRoute("/editor/saved/:id");
  
  const isSavedDrawing = !!matchSaved;
  const id = isSavedDrawing ? paramsSaved?.id : parseInt(params?.id || "0");
  
  const { data: motif, isLoading: isLoadingMotif } = useMotif(isSavedDrawing ? 0 : id as number);
  const { data: savedDrawing, isLoading: isLoadingSaved } = useGetDrawing(isSavedDrawing ? id as string : "");
  
  const { mutate: saveDrawing, isPending: isSaving } = useSaveDrawing();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [tool, setTool] = useState<ToolType>('brush');
  const [color, setColor] = useState('#FF1493');
  const [brushSize, setBrushSize] = useState(12);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTitle, setDrawingTitle] = useState("");

  // Initialize Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // High DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        setCtx(context);
        
        // White background initially
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, rect.width, rect.height);
        saveState(context);
      }
    }
  }, []);

  // Load Content (Motif or Saved Drawing)
  useEffect(() => {
    if (!ctx || !canvasRef.current) return;

    const loadContent = async () => {
      const img = new Image();
      // Try to handle data URLs specifically if they fail with anonymous
      if (!motif?.imageUrl.startsWith('data:')) {
        img.crossOrigin = "anonymous";
      }

      img.onload = () => {
        const canvas = canvasRef.current!;
        const dpr = window.devicePixelRatio || 1;
        
        // Calculate aspect ratio fit
        const scale = Math.min(
          canvas.width / dpr / img.width,
          canvas.height / dpr / img.height
        ) * 0.9;
        
        const x = (canvas.width / dpr - img.width * scale) / 2;
        const y = (canvas.height / dpr - img.height * scale) / 2;
        
        // Clear with white first to ensure clean state
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        // Ensure state is saved after image is definitely loaded
        setTimeout(() => saveState(ctx), 100);
      };

      if (isSavedDrawing && savedDrawing) {
        setDrawingTitle(savedDrawing.title);
        const url = URL.createObjectURL(savedDrawing.blob);
        img.src = url;
      } else if (motif) {
        setDrawingTitle(motif.title);
        img.src = motif.imageUrl;
      }
    };

    loadContent();
  }, [ctx, motif, savedDrawing, isSavedDrawing]);

  // History Management
  const saveState = (context: CanvasRenderingContext2D = ctx!) => {
    if (!context || !canvasRef.current) return;
    const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      if (newHistory.length > 20) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => {
      const newIndex = prev + 1;
      return Math.min(newIndex, 19);
    });
  };

  const undo = () => {
    if (historyIndex > 0 && ctx) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      ctx.putImageData(history[newIndex], 0, 0);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && ctx) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      ctx.putImageData(history[newIndex], 0, 0);
    }
  };

  // Drawing Logic
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Account for potential CSS scaling
    const scaleX = canvasRef.current.width / (rect.width * (window.devicePixelRatio || 1));
    const scaleY = canvasRef.current.height / (rect.height * (window.devicePixelRatio || 1));
    
    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top)
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);

    if (tool === 'fill') {
      floodFill(x, y, color);
      saveState();
      return;
    }

    if (tool === 'picker') {
      pickColor(x, y);
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !ctx || (tool !== 'brush' && tool !== 'eraser')) return;
    if ('cancelable' in e && e.cancelable) e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    ctx?.closePath();
    saveState();
  };

  // Flood Fill Algorithm (Stack-based)
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    if (!ctx || !canvasRef.current) return;
    
    const dpr = window.devicePixelRatio || 1;
    const canvas = canvasRef.current;
    // Scale coordinates to internal resolution
    const x = Math.floor(startX * dpr);
    const y = Math.floor(startY * dpr);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert hex to rgb
    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);
    
    // Get target color
    const targetIdx = (y * canvas.width + x) * 4;
    const targetR = data[targetIdx];
    const targetG = data[targetIdx + 1];
    const targetB = data[targetIdx + 2];
    const targetA = data[targetIdx + 3];

    // Don't fill if color matches
    if (r === targetR && g === targetG && b === targetB && targetA === 255) return;

    // Tolerance for anti-aliasing (lines often aren't pure black)
    const matchStartColor = (pixelIdx: number) => {
      const pr = data[pixelIdx];
      const pg = data[pixelIdx + 1];
      const pb = data[pixelIdx + 2];
      // Simple distance check
      return Math.abs(pr - targetR) < 50 && Math.abs(pg - targetG) < 50 && Math.abs(pb - targetB) < 50;
    };

    const colorPixel = (pixelIdx: number) => {
      data[pixelIdx] = r;
      data[pixelIdx + 1] = g;
      data[pixelIdx + 2] = b;
      data[pixelIdx + 3] = 255;
    };

    const stack = [[x, y]];
    
    while (stack.length) {
      let [curX, curY] = stack.pop()!;
      let pixelPos = (curY * canvas.width + curX) * 4;
      
      while (curY >= 0 && matchStartColor(pixelPos)) {
        curY--;
        pixelPos -= canvas.width * 4;
      }
      
      pixelPos += canvas.width * 4;
      curY++;
      let reachLeft = false;
      let reachRight = false;
      
      while (curY < canvas.height && matchStartColor(pixelPos)) {
        colorPixel(pixelPos);
        
        if (curX > 0) {
          if (matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              stack.push([curX - 1, curY]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }
        
        if (curX < canvas.width - 1) {
          if (matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              stack.push([curX + 1, curY]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }
        
        curY++;
        pixelPos += canvas.width * 4;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  const pickColor = (x: number, y: number) => {
    if (!ctx || !canvasRef.current) return;
    const dpr = window.devicePixelRatio || 1;
    const p = ctx.getImageData(x * dpr, y * dpr, 1, 1).data;
    // Convert to hex
    const hex = "#" + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, '0')).join('');
    setColor(hex);
    setTool('brush'); // Switch back to brush after picking
    toast({ description: "Farve valgt!", duration: 1500 });
  };

  const handleClear = () => {
    if (!ctx || !canvasRef.current) return;
    if (window.confirm("Er du sikker på du vil rydde alt?")) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      // Reload motif
      const img = new Image();
      img.src = motif?.imageUrl || "";
      img.onload = () => { /* redraw logic duplicate from useEffect - simplified here for brevity */ };
      window.location.reload(); // Simple reset
    }
  };

  const handleSave = async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Create Thumbnail
    const thumbUrl = canvas.toDataURL("image/jpeg", 0.3); // Low quality for thumbnail
    
    // Create Blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const drawingId = isSavedDrawing ? (id as string) : uuidv4();
      
      await saveDrawing({
        id: drawingId,
        motifId: typeof id === 'number' ? id : undefined,
        title: drawingTitle || "Min tegning",
        blob: blob,
        thumbnail: thumbUrl,
        createdAt: isSavedDrawing && savedDrawing ? savedDrawing.createdAt : Date.now(),
        updatedAt: Date.now()
      });

      toast({
        title: "Gemt!",
        description: "Din tegning er gemt i 'Mine Tegninger'",
        action: <CheckCircle2 className="text-green-500" />
      });
      
      if (!isSavedDrawing) {
        // Redirect to saved version so future saves overwrite
        setLocation(`/editor/saved/${drawingId}`);
      }
    }, "image/png");
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${drawingTitle || 'tegning'}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if ((!isSavedDrawing && isLoadingMotif) || (isSavedDrawing && isLoadingSaved)) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden touch-none">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <input
            value={drawingTitle}
            onChange={(e) => setDrawingTitle(e.target.value)}
            className="font-display text-xl bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground w-48 md:w-auto truncate"
            placeholder="Navngiv din tegning..."
          />
        </div>
        
        {/* Helper text for tool */}
        <div className="hidden md:block text-sm font-bold text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
          {tool === 'brush' && 'Pensel: Tegn frit'}
          {tool === 'fill' && 'Fyld: Klik for at farve et område'}
          {tool === 'eraser' && 'Viskelæder: Fjern farve'}
          {tool === 'picker' && 'Vælger: Klik på en farve for at vælge den'}
        </div>
      </header>

      {/* Canvas Area */}
      <main className="flex-1 relative bg-checkered flex items-center justify-center p-4">
        <div className="bg-white shadow-2xl relative">
           <canvas
            ref={canvasRef}
            className="w-full h-full touch-none cursor-crosshair max-w-[90vw] max-h-[80vh] aspect-[4/3] block bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </main>

      {/* Toolbar */}
      <Toolbar
        currentTool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onClear={handleClear}
        onSave={handleSave}
        onDownload={handleDownload}
      />
    </div>
  );
}
