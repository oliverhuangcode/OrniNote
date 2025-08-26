import React from "react";
import { ToolbarTool } from "../types";

interface LeftToolbarProps {
  tools: ToolbarTool[];
  colorPalette: string[];
  onSelectTool: (toolId: string) => void;
}

export default function LeftToolbar({ tools, colorPalette, onSelectTool }: LeftToolbarProps) {
  return (
    <div className="w-24 bg-white border-r border-gray-300 flex flex-col items-center py-4 gap-5">
      {tools.map((tool) => (
        <div
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:opacity-80 ${
            tool.isSelected ? "bg-ml-green" : tool.isActive ? "bg-ml-green" : "bg-gray-200"
          }`}
          title={tool.id.charAt(0).toUpperCase() + tool.id.slice(1)}
        >
          {tool.icon}
        </div>
      ))}

      <div className="mt-auto space-y-2">
        {colorPalette.map((color, index) => (
          <div
            key={index}
            className="w-11 h-11 rounded border-2 border-gray-300 cursor-pointer"
            style={{ backgroundColor: color }}
          ></div>
        ))}
      </div>
    </div>
  );
}



