import React from "react";
import { Layer } from "../types";

interface LayersPanelProps {
  search: string;
  onSearchChange: (value: string) => void;
  layers: Layer[];
}

export default function LayersPanel({ search, onSearchChange, layers }: LayersPanelProps) {
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
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <path d="M17.9667 19.25L12.1917 13.475C11.7333 13.8417 11.2063 14.1319 10.6104 14.3458C10.0146 14.5597 9.38056 14.6667 8.70833 14.6667C7.04306 14.6667 5.63368 14.0899 4.48021 12.9365C3.32674 11.783 2.75 10.3736 2.75 8.70833C2.75 7.04306 3.32674 5.63368 4.48021 4.48021C5.63368 3.32674 7.04306 2.75 8.70833 2.75C10.3736 2.75 11.783 3.32674 12.9365 4.48021C14.0899 5.63368 14.6667 7.04306 14.6667 8.70833C14.6667 9.38056 14.5597 10.0146 14.3458 10.6104C14.1319 11.2063 13.8417 11.7333 13.475 12.1917L19.25 17.9667L17.9667 19.25ZM8.70833 12.8333C9.85417 12.8333 10.8281 12.4323 11.6302 11.6302C12.4323 10.8281 12.8333 9.85417 12.8333 8.70833C12.8333 7.5625 12.4323 6.58854 11.6302 5.78646C10.8281 4.98438 9.85417 4.58333 8.70833 4.58333C7.5625 4.58333 6.58854 4.98438 5.78646 5.78646C4.98438 6.58854 4.58333 7.5625 4.58333 8.70833C4.58333 9.85417 4.98438 10.8281 5.78646 11.6302C6.58854 12.4323 7.5625 12.8333 8.70833 12.8333Z" fill="#79747E"/>
          </svg>
        </div>
      </div>

      <div className="bg-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <path d="M5 8H19L12 19L5 8Z" fill="#828282"/>
          </svg>
          <span className="font-inter text-base font-semibold text-gray-600">Layers</span>
        </div>
      </div>

      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-inter text-sm text-black">Duck</span>
          <svg width="16" height="16" viewBox="0 0 18 17" fill="none">
            <path d="M1.6665 8.50002C1.6665 8.50002 4.33317 3.16669 8.99984 3.16669C13.6665 3.16669 16.3332 8.50002 16.3332 8.50002C16.3332 8.50002 13.6665 13.8334 8.99984 13.8334C4.33317 13.8334 1.6665 8.50002 1.6665 8.50002Z" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.99984 10.5C10.1044 10.5 10.9998 9.60459 10.9998 8.50002C10.9998 7.39545 10.1044 6.50002 8.99984 6.50002C7.89527 6.50002 6.99984 7.39545 6.99984 8.50002C6.99984 9.60459 7.89527 10.5 8.99984 10.5Z" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {layers.map((layer) => (
          <div key={layer.id} className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className={`font-inter text-sm ${layer.color ? "text-highlight" : "text-black"}`}>
                {layer.name}
              </span>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 18 17" fill="none" className={layer.color ? "text-highlight" : "text-black"}>
                  <path d="M1.6665 8.49999C1.6665 8.49999 4.33317 3.16666 8.99984 3.16666C13.6665 3.16666 16.3332 8.49999 16.3332 8.49999C16.3332 8.49999 13.6665 13.8333 8.99984 13.8333C4.33317 13.8333 1.6665 8.49999 1.6665 8.49999Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.99984 10.5C10.1044 10.5 10.9998 9.60456 10.9998 8.49999C10.9998 7.39542 10.1044 6.49999 8.99984 6.49999C7.89527 6.49999 6.99984 7.39542 6.99984 8.49999C6.99984 9.60456 7.89527 10.5 8.99984 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <svg width="14" height="15" viewBox="0 0 14 15" fill="none" className={layer.color ? "text-highlight" : "text-black"}>
                  <g clipPath="url(#clip0_93_92)">
                    <path d="M4.08383 5.16797H9.91628V4.58473C9.91672 2.97416 8.61144 1.66814 7.00086 1.6677C5.93968 1.6674 4.96209 2.24359 4.44835 3.17212C4.29197 3.4538 3.93683 3.5554 3.65515 3.39901C3.37347 3.24263 3.27188 2.88749 3.42826 2.60581C4.52045 0.633173 7.00499 -0.0805829 8.97766 1.01161C10.2771 1.73105 11.0833 3.09945 11.0828 4.58476V5.41531C12.1443 5.87858 12.831 6.92607 12.8325 8.08424V11.5837C12.8306 13.1935 11.5261 14.498 9.91628 14.4999H4.08383C2.47405 14.498 1.16954 13.1935 1.1676 11.5837V8.08424C1.16954 6.4744 2.47405 5.16989 4.08383 5.16797ZM6.41681 10.4172C6.41681 10.7393 6.67793 11.0004 7.00004 11.0004C7.32216 11.0004 7.58328 10.7393 7.58328 10.4172V9.25068C7.58328 8.92857 7.32216 8.66744 7.00004 8.66744C6.67793 8.66744 6.41681 8.92857 6.41681 9.25068V10.4172Z" fill="currentColor"/>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



