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
  "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#9400D3",
  "#FF1493", "#00FFFF", "#8B4513", "#000000", "#FFFFFF"
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
      className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-50 bg-white/95 backdrop-blur shadow-2xl md:rounded-2xl p-2 border-t md:border border-border/50 flex flex-col md:flex-row items-center gap-2 md:gap-3 safe-area-bottom"
    >
      {/* Top Row on Mobile: Tools + Actions */}
      <div className="flex items-center justify-between w-full md:w-auto gap-2">
        {/* Tools Group */}
        <div className="flex items-center gap-1">
          <ToolButton 
            active={currentTool === 'brush'} 
            onClick={() => setTool('brush')} 
            icon={<Brush className="w-5 h-5" />} 
            color={currentTool === 'brush' ? color : undefined}
            label="Pensel"
          />
          <ToolButton 
            active={currentTool === 'fill'} 
            onClick={() => setTool('fill')} 
            icon={<PaintBucket className="w-5 h-5" />}
            color={currentTool === 'fill' ? color : undefined}
            label="Fyld"
          />
          <ToolButton 
            active={currentTool === 'eraser'} 
            onClick={() => setTool('eraser')} 
            icon={<Eraser className="w-5 h-5" />} 
            label="Viskelæder"
          />
          <ToolButton 
            active={currentTool === 'picker'} 
            onClick={() => setTool('picker')} 
            icon={<Pipette className="w-5 h-5" />} 
            label="Farvevælger"
          />
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-1">
          <ActionButton onClick={onUndo} disabled={!canUndo} icon={<Undo className="w-4 h-4" />} label="Fortryd" />
          <ActionButton onClick={onRedo} disabled={!canRedo} icon={<Redo className="w-4 h-4" />} label="Gentag" />
          <ActionButton onClick={onClear} icon={<RotateCcw className="w-4 h-4 text-red-500" />} label="Ryd" />
          <ActionButton onClick={onSave} icon={<Save className="w-4 h-4 text-green-600" />} label="Gem" />
          <ActionButton onClick={onDownload} icon={<Download className="w-4 h-4 text-blue-600" />} label="Hent" />
        </div>
      </div>

      {/* Bottom Row on Mobile: Colors */}
      <div className="flex items-center gap-1 w-full md:w-auto justify-center flex-wrap md:flex-nowrap md:border-l md:pl-3 md:border-gray-200">
        {PRESET_COLORS.map(c => (
          <button
            key={c}
            data-testid={`color-${c.replace('#', '')}`}
            className={cn(
              "w-7 h-7 md:w-6 md:h-6 rounded-full border-2 transition-all hover:scale-110 active:scale-95 flex-shrink-0",
              color === c ? "border-primary ring-2 ring-primary/30 scale-110" : "border-white shadow-sm"
            )}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
        <Popover>
          <PopoverTrigger asChild>
            <button 
              data-testid="button-custom-color"
              className="w-7 h-7 md:w-6 md:h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 flex-shrink-0"
              title="Vælg selv farve"
            >
              <div className="w-4 h-4 md:w-3.5 md:h-3.5 rounded-full bg-gradient-to-tr from-red-500 via-green-500 to-blue-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4 rounded-2xl">
            <HexColorPicker color={color} onChange={setColor} />
          </PopoverContent>
        </Popover>
        
        {/* Brush Size - hidden on mobile */}
        <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-gray-200">
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="accent-primary h-1.5 w-16 bg-gray-200 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-[10px] text-muted-foreground font-bold w-6">{brushSize}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ToolButton({ active, onClick, icon, color, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, color?: string, label: string }) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        data-testid={`tool-${label.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')}`}
        className={cn(
          "p-2 md:p-2.5 rounded-xl transition-all duration-200 shadow-sm border-2",
          active 
            ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md" 
            : "bg-white text-muted-foreground border-transparent hover:bg-gray-100 hover:border-gray-200"
        )}
        style={color ? { color: active ? 'white' : color } : {}}
      >
        {icon}
      </button>
      <span className="hidden md:block text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
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
      data-testid={`action-${label.toLowerCase()}`}
      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors relative group"
    >
      {icon}
      <span className="hidden md:block text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
        {label}
      </span>
    </button>
  );
}
