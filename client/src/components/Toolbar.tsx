import React from 'react';
import { motion } from 'framer-motion';
import { Brush, Eraser, PaintBucket, Pipette, Undo, Redo, RotateCcw, Save, Download } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ToolType = 'brush' | 'eraser' | 'fill' | 'picker';

interface ToolbarProps {
  currentTool: ToolType;
  setTool: (t: ToolType) => void;
  color: string;
  setColor: (c: string) => void;
  brushSize: number;
  setBrushSize: (s: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onSave: () => void;
  onDownload: () => void;
}

const PRESET_COLORS = [
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#9400D3", // Rainbow
  "#FF1493", "#00FFFF", "#FFD700", "#8B4513", "#000000", "#808080", "#FFFFFF", // Others
  "#FF69B4", "#7FFFD4"
];

export function Toolbar({
  currentTool, setTool,
  color, setColor,
  brushSize, setBrushSize,
  onUndo, onRedo, canUndo, canRedo,
  onClear, onSave, onDownload
}: ToolbarProps) {

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur shadow-2xl rounded-3xl p-3 border border-border/50 flex items-center gap-2 md:gap-4 max-w-[95vw] overflow-x-auto"
    >
      {/* Tools Group */}
      <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
        <ToolButton 
          active={currentTool === 'brush'} 
          onClick={() => setTool('brush')} 
          icon={<Brush className="w-6 h-6" />} 
          color={currentTool === 'brush' ? color : undefined}
          label="Pensel"
        />
        <ToolButton 
          active={currentTool === 'fill'} 
          onClick={() => setTool('fill')} 
          icon={<PaintBucket className="w-6 h-6" />}
          color={currentTool === 'fill' ? color : undefined}
          label="Fyld"
        />
        <ToolButton 
          active={currentTool === 'eraser'} 
          onClick={() => setTool('eraser')} 
          icon={<Eraser className="w-6 h-6" />} 
          label="Viskelæder"
        />
        <ToolButton 
          active={currentTool === 'picker'} 
          onClick={() => setTool('picker')} 
          icon={<Pipette className="w-6 h-6" />} 
          label="Farvevælger"
        />
      </div>

      {/* Direct Color Picker Group */}
      <div className="flex items-center gap-2 md:gap-3 pr-4 border-r border-gray-200 overflow-x-auto max-w-[30vw] md:max-w-none no-scrollbar">
        <div className="flex items-center gap-1.5 md:gap-2">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shrink-0",
                color === c ? "border-primary ring-2 ring-primary/20 scale-110" : "border-white shadow-sm"
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 shrink-0"
                title="Vælg selv farve"
              >
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 rounded-2xl">
              <HexColorPicker color={color} onChange={setColor} />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Simple Size Slider */}
        <div className="hidden lg:flex flex-col gap-1 w-24 ml-2">
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="accent-primary h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-[10px] text-center text-muted-foreground font-bold">Størrelse: {brushSize}</span>
        </div>
      </div>

      {/* Actions Group */}
      <div className="flex items-center gap-2">
        <ActionButton onClick={onUndo} disabled={!canUndo} icon={<Undo className="w-5 h-5" />} label="Fortryd" />
        <ActionButton onClick={onRedo} disabled={!canRedo} icon={<Redo className="w-5 h-5" />} label="Gentag" />
        <div className="w-px h-8 bg-gray-200 mx-1" />
        <ActionButton onClick={onClear} icon={<RotateCcw className="w-5 h-5 text-red-500" />} label="Ryd" />
        <ActionButton onClick={onSave} icon={<Save className="w-5 h-5 text-green-600" />} label="Gem" />
        <ActionButton onClick={onDownload} icon={<Download className="w-5 h-5 text-blue-600" />} label="Hent" />
      </div>
    </motion.div>
  );
}

function ToolButton({ active, onClick, icon, color, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, color?: string, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 group">
      <button
        onClick={onClick}
        className={cn(
          "p-3 rounded-2xl transition-all duration-200 shadow-sm border-2",
          active 
            ? "bg-primary text-primary-foreground border-primary scale-110 shadow-md" 
            : "bg-white text-muted-foreground border-transparent hover:bg-gray-100 hover:border-gray-200"
        )}
        style={color ? { color: active ? 'white' : color } : {}}
      >
        {icon}
      </button>
      <span className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-black/80 text-white px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function ActionButton({ onClick, disabled, icon, label }: { onClick: () => void, disabled?: boolean, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2.5 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors relative group"
    >
      {icon}
      <span className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}
