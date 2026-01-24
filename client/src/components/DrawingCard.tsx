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
  const handleDownload = () => {
    const url = URL.createObjectURL(drawing.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${drawing.title}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-2xl shadow-lg border-2 border-border overflow-hidden flex flex-col hover:border-primary/50 transition-colors"
    >
      <div className="relative aspect-[4/3] bg-checkered">
        <img 
          src={drawing.thumbnail} 
          alt={drawing.title} 
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link href={`/editor/saved/${drawing.id}`}>
            <button className="p-3 bg-white text-primary rounded-full hover:scale-110 transition-transform shadow-lg" title="Rediger">
              <Edit2 className="w-6 h-6" />
            </button>
          </Link>
          <button 
            onClick={handleDownload}
            className="p-3 bg-white text-green-500 rounded-full hover:scale-110 transition-transform shadow-lg"
            title="Download"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between bg-white">
        <div>
          <h3 className="font-display text-lg leading-none mb-1">{drawing.title}</h3>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(drawing.updatedAt, { addSuffix: true, locale: da })}
          </p>
        </div>
        <button 
          onClick={() => onDelete(drawing.id)}
          className="text-muted-foreground hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
          title="Slet"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
