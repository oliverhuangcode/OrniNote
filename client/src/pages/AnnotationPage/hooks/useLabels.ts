import { useState, useEffect } from "react";
import { labelService, Label } from "../../../services/labelService";

export const useLabels = (projectId: string | undefined) => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [currentLabelId, setCurrentLabelId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("#3B3B3B");

  const loadLabels = async () => {
    if (!projectId) return;

    try {
      const fetchedLabels = await labelService.getLabelsForProject(projectId);
      setLabels(fetchedLabels);

      if (fetchedLabels.length > 0 && !currentLabelId) {
        setCurrentLabelId(fetchedLabels[0]._id);
        setSelectedColor(fetchedLabels[0].colour);
        console.log("Auto-selected first label:", fetchedLabels[0].name);
      } else if (fetchedLabels.length === 0) {
        console.warn("No labels found. Create labels before annotating.");
      }
    } catch (err) {
      console.error("Failed to load labels:", err);
    }
  };

  const handleLabelSelect = (labelId: string) => {
    setCurrentLabelId(labelId);
    console.log("Selected label:", labelId);

    const selectedLabel = labels.find((l) => l._id === labelId);
    if (selectedLabel) {
      setSelectedColor(selectedLabel.colour);
      console.log("Updated color to match label:", selectedLabel.colour);
    }
  };

  const handleLabelsChanged = async () => {
    await loadLabels();

    if (currentLabelId) {
      const selectedLabel = labels.find((l) => l._id === currentLabelId);
      if (selectedLabel) {
        setSelectedColor(selectedLabel.colour);
      }
    }
  };

  const advanceToNextLabel = () => {
    if (!currentLabelId || labels.length === 0) return;
    
    const currentIndex = labels.findIndex((l) => l._id === currentLabelId);
    if (currentIndex === -1) return;
    
    // Move to next label, or wrap to first if at end
    const nextIndex = (currentIndex + 1) % labels.length;
    const nextLabel = labels[nextIndex];
    
    setCurrentLabelId(nextLabel._id);
    setSelectedColor(nextLabel.colour);
    console.log("Auto-advanced to label:", nextLabel.name);
  };

  // Load labels when projectId changes
  useEffect(() => {
    if (projectId) {
      loadLabels();
    }
  }, [projectId]);

  return {
    labels,
    currentLabelId,
    selectedColor,
    setSelectedColor,
    handleLabelSelect,
    handleLabelsChanged,
    advanceToNextLabel,
    loadLabels,
  };
};