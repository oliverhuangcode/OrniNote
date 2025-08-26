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
    <div className="flex flex-col items-center p-2 bg-gray-100">
      {/* Tool buttons */}
      <div className="flex flex-col gap-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`p-1 rounded ${tool.isSelected ? "bg-highlight" : ""}`}
            onClick={() => onSelectTool(tool.id)}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      {/* Single color swatch */}
      <div className="mt-4">
        <button
          className="w-7 h-7 rounded border-2 border-gray-400"
          style={{ backgroundColor: selectedColor }}
          onClick={handleColorSwatchClick}
          aria-label="Pick color"
        />
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


