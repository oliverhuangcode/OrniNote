import React, { useRef } from "react";
import type { ToolbarTool } from "../types";

interface LeftToolbarProps {
  tools: ToolbarTool[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
  onSelectTool: (toolId: string) => void;
}

export default function LeftToolbar({
  tools,
  selectedColor,
  onSelectColor,
  onSelectTool,
}: LeftToolbarProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Handler for clicking the color swatch
  const handleColorSwatchClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center py-3 px-2 bg-white border-r border-gray-200 shadow-sm">
      {/* Tool buttons */}
      <div className="flex flex-col gap-1.5">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`p-2 rounded-lg transition-all duration-200 relative group ${
              tool.isSelected 
                ? "bg-green-600 shadow-md" 
                : "hover:bg-gray-100 active:bg-gray-200"
            }`}
            onClick={() => onSelectTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
            
            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
              {tool.label}
            </div>
          </button>
        ))}
      </div>
      
      {/* Divider */}
      <div className="w-8 h-px bg-gray-200 my-3"></div>
      
      {/* Color Picker */}
      <div className="relative group">
        <button
          className="w-9 h-9 rounded-lg border-2 border-gray-300 shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200 relative overflow-hidden"
          style={{ backgroundColor: selectedColor }}
          onClick={handleColorSwatchClick}
          aria-label="Pick color"
        >
          {/* Checkered background for transparency */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%) 
                50% / 8px 8px
              `
            }}
          />
        </button>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
          Color Picker
        </div>
        
        <input
          ref={colorInputRef}
          type="color"
          value={selectedColor}
          onChange={e => onSelectColor(e.target.value)}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}