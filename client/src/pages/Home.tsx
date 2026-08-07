import { useState } from "react";
import { useMotifs } from "@/hooks/use-motifs";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Image as ImageIcon, Palette, Loader2, Star, Sparkles, FolderOpen } from "lucide-react";
import { useSavedDrawings } from "@/hooks/use-drawings";

const CATEGORIES = [
  "Alle", "Dyr", "Eventyr", "Biler", "Dinosaurer", "Natur", "Fantasy", "Rum", "Hav", "Jul"
];

export default function Home() {
  const { data: motifs, isLoading } = useMotifs();
  const { data: savedDrawings } = useSavedDrawings();
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [search, setSearch] = useState("");

  const filteredMotifs = motifs?.filter(motif => {
    const matchesCategory = selectedCategory === "Alle" || motif.category === selectedCategory;
    const matchesSearch = motif.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg rotate-3">
              <Palette className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Malebog
            </h1>
          </div>
          
          <Link href="/saved" className="flex items-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground rounded-full font-bold transition-colors">
            <FolderOpen className="w-5 h-5" />
            <span className="hidden sm:inline">Mine Tegninger</span>
            {savedDrawings && savedDrawings.length > 0 && (
              <span className="bg-secondary text-white text-xs px-2 py-0.5 rounded-full">
                {savedDrawings.length}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Hero / Filter Section */}
      <div className="bg-white/50 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto mb-8 relative">
            <input
              type="text"
              placeholder="Søg efter tegninger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-lg shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-200 border-2
                  ${selectedCategory === cat 
                    ? 'bg-accent text-accent-foreground border-accent scale-105 shadow-md' 
                    : 'bg-white text-muted-foreground border-transparent hover:bg-white hover:border-gray-200'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
            <p className="text-xl font-display">Henter farveblyanterne...</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" />
              {selectedCategory === "Alle" ? "Alle Tegninger" : selectedCategory}
            </h2>
            
            {filteredMotifs?.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl font-display text-muted-foreground">Ingen tegninger fundet</p>
                <button onClick={() => {setSearch(''); setSelectedCategory('Alle');}} className="mt-4 text-primary hover:underline font-bold">
                  Vis alle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence>
                  {filteredMotifs?.map((motif, i) => (
                    <motion.div
                      key={motif.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link href={`/editor/${motif.id}`} className="group block h-full">
                        <div className="bg-white rounded-3xl p-4 md:p-6 border-2 border-border shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 h-full flex flex-col items-center text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-primary text-white rounded-full p-2 shadow-lg transform rotate-12">
                              <Palette className="w-4 h-4" />
                            </div>
                          </div>
                          
                          <div className="flex-1 w-full flex items-center justify-center p-2 mb-4">
                            <img
                              src={motif.imageUrl}
                              alt={motif.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-auto max-h-40 object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                            />
                          </div>
                          
                          <h3 className="font-display text-lg group-hover:text-primary transition-colors">
                            {motif.title}
                          </h3>
                          <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full mt-2">
                            {motif.category}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
