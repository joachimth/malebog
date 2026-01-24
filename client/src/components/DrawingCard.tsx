import { Link } from "wouter";
import { Trash2, Edit2, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { da } from "date-fns/locale";
import type { SavedDrawing } from "@/hooks/use-drawings";
import { motion } from "framer-motion";

interface DrawingCardProps {
  drawing: SavedDrawing;
  onDelete: (id: string) => void;
}

export function DrawingCard({ drawing, onDelete }: DrawingCardProps) {
  const handleDownload = async () => {
    if (!drawing.blob) {
      console.error("No blob available for download");
      alert("Kunne ikke downloade - ingen billeddata fundet");
      return;
    }
    
    try {
      // Try using Share API on mobile (works great on iOS)
      if (navigator.share && navigator.canShare) {
        const file = new File([drawing.blob], `${drawing.title}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: drawing.title
          });
          return;
        }
      }
      
      // Fallback for desktop or if Share API not available
      const url = URL.createObjectURL(drawing.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${drawing.title}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup after a delay
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      // Final fallback - open in new tab
      const url = URL.createObjectURL(drawing.blob);
      window.open(url, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl shadow-lg border-2 border-border overflow-hidden flex flex-col hover:border-primary/50 transition-colors"
    >
      {/* Thumbnail with link to edit */}
      <Link href={`/editor/saved/${drawing.id}`}>
        <div className="relative aspect-[4/3] bg-checkered cursor-pointer">
          <img 
            src={drawing.thumbnail} 
            alt={drawing.title} 
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Info and actions - always visible */}
      <div className="p-4 flex items-center justify-between bg-white">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg leading-none mb-1 truncate">{drawing.title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(drawing.updatedAt, { addSuffix: true, locale: da })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/editor/saved/${drawing.id}`}>
            <button 
              className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors"
              title="Rediger"
              data-testid={`button-edit-${drawing.id}`}
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </Link>
          <button 
            onClick={handleDownload}
            className="text-green-600 hover:bg-green-50 p-2 rounded-full transition-colors"
            title="Download"
            data-testid={`button-download-${drawing.id}`}
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(drawing.id)}
            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
            title="Slet"
            data-testid={`button-delete-${drawing.id}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
