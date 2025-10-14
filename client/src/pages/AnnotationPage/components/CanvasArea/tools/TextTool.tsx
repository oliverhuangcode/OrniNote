import React, { useCallback, useState } from "react";
import type { Annotation } from "../../../types";

// Add color as a required argument
export function useTextTool(
  pixelScale: number,
  onCreate: (annotation: Annotation) => void,
  imageId: string,
  color: string
) {
  const [textInput, setTextInput] = useState("");
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);

  const onClick = useCallback((x: number, y: number) => {
    setTextInput("");
    setTextInputPos({ x, y });
  }, []);

  const commit = useCallback(() => {
    if (!textInputPos) return;
    const trimmed = textInput.trim();
    if (!trimmed) {
      setTextInputPos(null);
      setTextInput("");
      return;
    }
    const a: Annotation = {
      id: crypto.randomUUID(),
      imageId,
      type: "text",
      labelId: "",
      properties: {
        position: { x: textInputPos.x, y: textInputPos.y },
        text: trimmed,
        style: { color: color, fontSize: 16, fontFamily: "Inter, system-ui, sans-serif" },
      },
    };
    onCreate(a);
    setTextInputPos(null);
    setTextInput("");
  }, [onCreate, textInput, textInputPos, color]);

  const overlay = textInputPos ? (
    <input
      autoFocus
      value={textInput}
      onChange={e => setTextInput(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          setTextInput("");
          setTextInputPos(null);
        }
      }}
      className="absolute bg-transparent border border-gray-400 rounded px-1 py-0.5 text-gray-900 outline-none"
      style={{ left: (textInputPos.x * pixelScale), top: (textInputPos.y * pixelScale), transform: "translateY(-0.2em)" }}
      placeholder="Type..."
    />
  ) : null;

  return { onClick, overlay };
}

export default useTextTool;


