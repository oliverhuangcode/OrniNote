import { useState, useCallback } from "react";
import { Annotation } from "../types";

export const useUndoRedo = (externalAnnotations: Annotation[], externalSetAnnotations: (annotations: Annotation[] | ((prev: Annotation[]) => Annotation[])) => void) => {
  const [undoStack, setUndoStack] = useState<Annotation[][]>([]);
  const [redoStack, setRedoStack] = useState<Annotation[][]>([]);

  // Full React-style setter with undo/redo tracking
  const updateAnnotations = useCallback((
    value: Annotation[] | ((prev: Annotation[]) => Annotation[])
  ) => {
    console.log('[updateAnnotations] called', typeof value);
    
    // Save current state to undo stack before applying changes
    setUndoStack((u) => [...u, externalAnnotations]);
    setRedoStack([]);
    
    // Apply the actual update
    externalSetAnnotations(value);
  }, [externalAnnotations, externalSetAnnotations]);

  // Undo last change
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const lastState = undoStack[undoStack.length - 1];
    const currentState = externalAnnotations;
    
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, currentState]);
    externalSetAnnotations(lastState);
  }, [undoStack, externalAnnotations, externalSetAnnotations]);

  // Redo previously undone change
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    const currentState = externalAnnotations;
    
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, currentState]);
    externalSetAnnotations(nextState);
  }, [redoStack, externalAnnotations, externalSetAnnotations]);

  return {
    updateAnnotations,
    handleUndo,
    handleRedo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
};