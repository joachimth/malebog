import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { useMotifs } from "@/hooks/use-motifs";
import { useSaveDrawing, useGetDrawing } from "@/hooks/use-drawings";
import { Toolbar, ToolType } from "@/components/Toolbar";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { v4 as uuidv4 } from 'uuid';

export default function Editor() {
  const [match, params] = useRoute("/editor/:id");
  const [matchSaved, paramsSaved] = useRoute("/editor/saved/:id");
  
  const isSavedDrawing = !!matchSaved;
  const id = isSavedDrawing ? paramsSaved?.id : parseInt(params?.id || "0");
  
  const { data: motifsList, isLoading: isLoadingMotif, isError: isMotifError } = useMotifs();
  const motif = useMemo(() => {
    if (!motifsList || isSavedDrawing) return undefined;
    return motifsList.find(m => m.id === id);
  }, [motifsList, id, isSavedDrawing]);
  
  const {
    data: savedDrawing,
    isLoading: isLoadingSaved,
    isError: isSavedDrawingError,
  } = useGetDrawing(isSavedDrawing ? id as string : "");
  
  const { mutateAsync: saveDrawing, isPending: isSaving } = useSaveDrawing();
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const historyIndexRef = useRef(historyIndex);
  
  // Keep ref in sync
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // History Management - using ref to avoid stale closure issues
  const saveState = useCallback((context: CanvasRenderingContext2D) => {
    if (!context || !canvasRef.current) return;
    const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndexRef.current + 1);
      newHistory.push(imageData);
      if (newHistory.length > 20) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, []);

  // Initialize Canvas - wait for proper layout
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const initCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Only initialize if canvas has actual dimensions
      if (rect.width === 0 || rect.height === 0) return false;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (context) {
        context.scale(dpr, dpr);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, rect.width, rect.height);
        setCtx(context);
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (!initCanvas()) {
      // If canvas not ready, use ResizeObserver to wait for layout
      const observer = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          initCanvas();
          observer.disconnect();
        }
      });
      observer.observe(canvas);
      return () => observer.disconnect();
    }
  }, []);

  // Load Content - only when we have both ctx AND data
  useEffect(() => {
    if (!ctx || !canvasRef.current) return;
    
    // Wait for data to be ready
    let objectUrl: string | undefined;
    const sourceUrl = isSavedDrawing
      ? (savedDrawing ? (objectUrl = URL.createObjectURL(savedDrawing.blob)) : null)
      : motif?.imageUrl;

    if (!sourceUrl) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    
    // Set title
    if (isSavedDrawing && savedDrawing) {
      setDrawingTitle(savedDrawing.title);
    } else if (motif) {
      setDrawingTitle(motif.title);
    }

    const img = new Image();
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (cancelled) return;
      // Reset canvas dimensions
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      
      // Calculate scale to fit 95% of canvas
      const scale = Math.min(
        (canvas.width / dpr) / img.width,
        (canvas.height / dpr) / img.height
      ) * 0.95;
      
      const x = (canvas.width / dpr - img.width * scale) / 2;
      const y = (canvas.height / dpr - img.height * scale) / 2;
      
      // Draw the image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      // Save initial state
      setImageLoaded(true);
      saveState(ctx);
    };

    img.onerror = () => {
      if (cancelled) return;
      console.error("Failed to load image, retrying...");
      retryTimeout = setTimeout(() => {
        if (!cancelled) img.src = sourceUrl;
      }, 200);
    };

    img.src = sourceUrl;

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      img.onload = null;
      img.onerror = null;
    };
  }, [ctx, motif, savedDrawing, isSavedDrawing, saveState]);

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
  type DrawEvent = React.PointerEvent<HTMLCanvasElement>;

  const getCoordinates = (e: DrawEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: DrawEvent) => {
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);

    if (tool === 'fill') {
      floodFill(x, y, color);
      if (ctx) saveState(ctx);
      return;
    }

    if (tool === 'picker') {
      pickColor(x, y);
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
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

  const draw = (e: DrawEvent) => {
    if (!isDrawing || !ctx || (tool !== 'brush' && tool !== 'eraser')) return;
    if ('cancelable' in e && e.cancelable) e.preventDefault();
    
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: DrawEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    ctx?.closePath();
    if (ctx) saveState(ctx);
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
    
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      toast({
        title: "Kunne ikke gemme",
        description: "Der kunne ikke oprettes billeddata fra tegningen.",
        variant: "destructive",
      });
      return;
    }

    const drawingId = isSavedDrawing ? (id as string) : uuidv4();

    try {
      await saveDrawing({
        id: drawingId,
        motifId: typeof id === 'number' ? id : undefined,
        title: drawingTitle || "Min tegning",
        blob,
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
        setLocation(`/editor/saved/${drawingId}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Kunne ikke gemme",
        description: "Prøv igen. Tegningen er ikke blevet ændret.",
        variant: "destructive",
      });
    }
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

  if (isMotifError || isSavedDrawingError || (!isSavedDrawing && !motif) || (isSavedDrawing && !savedDrawing)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-3xl border-2 border-border bg-white p-10 text-center shadow-xl">
          <h1 className="mb-4 text-3xl font-display">Tegningen blev ikke fundet</h1>
          <p className="mb-8 text-muted-foreground">
            Motivet eller den gemte tegning findes ikke længere.
          </p>
          <Link href="/" className="inline-flex rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
            Gå tilbage til forsiden
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden touch-none">
      {/* Top Bar */}
      <header className="h-16 bg-white border-b px-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Til forsiden">
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
          </Link>
          <label htmlFor="drawing-title" className="sr-only">Navn på tegning</label>
          <input
            id="drawing-title"
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

      {/* Canvas Area - with bottom padding for toolbar */}
      <main className="flex-1 relative bg-checkered flex items-center justify-center p-2 md:p-4 pb-28 md:pb-20 overflow-hidden">
        <div className="bg-white shadow-2xl relative w-full h-full flex items-center justify-center rounded-lg overflow-hidden">
           <canvas
            ref={canvasRef}
            data-testid="drawing-canvas"
            role="img"
            aria-label="Tegneområde. Brug pensel, viskelæder eller fyld-værktøj til at farvelægge motivet."
            className="touch-none cursor-crosshair block bg-white w-full h-full object-contain"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
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
    </>
  );
}
