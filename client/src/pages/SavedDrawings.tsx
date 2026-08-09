import { useSavedDrawings, useDeleteDrawing } from "@/hooks/use-drawings";
import { Link } from "wouter";
import { ArrowLeft, Loader2, FolderOpen } from "lucide-react";
import { DrawingCard } from "@/components/DrawingCard";

export default function SavedDrawings() {
  const { data: drawings, isLoading } = useSavedDrawings();
  const { mutate: deleteDrawing } = useDeleteDrawing();

  const handleDelete = (id: string) => {
    if (window.confirm("Er du sikker på at du vil slette tegningen?")) {
      deleteDrawing(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-20 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Til forsiden">
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-secondary/10 p-2 rounded-lg">
              <FolderOpen className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h1 className="text-2xl font-display">Mine Tegninger</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : drawings && drawings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drawings.map((drawing) => (
              <DrawingCard 
                key={drawing.id} 
                drawing={drawing} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-20 h-20 text-gray-300" />
            </div>
            <h2 className="text-2xl font-display text-gray-400 mb-4">Dit galleri er tomt</h2>
            <Link href="/" className="inline-flex px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Start en ny tegning!
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
