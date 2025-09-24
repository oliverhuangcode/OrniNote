import React from "react";
import { FiEye, FiLock, FiUnlock } from "react-icons/fi";
import { Layer } from "../types";

interface LayerItemProps {
  name: string;
  visible?: boolean;
  locked?: boolean;
}

const LayerItem: React.FC<LayerItemProps> = ({ name, visible = true, locked = false }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
    <span className="font-inter text-sm text-black">{name}</span>
    <div className="flex items-center gap-2">
      {FiEye({ className: `text-lg ${visible ? "text-highlight" : "text-gray-400"}` })}
      {locked
        ? FiLock({ className: "text-lg text-gray-400" })
        : FiUnlock({ className: "text-lg text-highlight" })}
    </div>
  </div>
);

export interface LayersPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  layers: Layer[];
}

export default function LayersPanel({ search, onSearchChange }: LayersPanelProps) {
  return (
    <div className="w-72 bg-white border-l border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Classes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-200 rounded-lg px-3 py-2 pr-10 font-inter text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-highlight"
          />
        </div>
      </div>

      <div className="bg-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="font-inter text-base font-semibold text-gray-600">Layers</span>
        </div>
      </div>

      {/* No layers yet. Example usage for future: */}
      {/* <LayerItem name="Example Layer" visible locked={false} /> */}
    </div>
  );
}



