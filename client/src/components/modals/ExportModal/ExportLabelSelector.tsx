import { useEffect, useRef, useState } from "react";
import { annotationService } from "../../../services/annotationService";

interface ExportLabelSelectorProps {
  projectId: string;
  selectedImageIds: string[];
  selectedLabelIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

interface Label {
  _id: string;
  name: string;
  colour: string;
}

interface Annotation {
  _id: string;
  imageId: string;
  labelId: Label;
  shapeData: any;
}

export default function ExportLabelSelector({
  projectId,
  selectedImageIds,
  selectedLabelIds,
  onSelectionChange,
}: ExportLabelSelectorProps) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

// Cache annotations per image
  const annotationsCache = useRef<Map<string, Annotation[]>>(new Map());

  useEffect(() => {
    if (!projectId || selectedImageIds.length === 0) {
      setLabels([]);
      return;
    }

    const loadLabelsForSelectedImages = async () => {
      try {
        setLoading(true);
        setError(null);

        const allAnnotations: Annotation[] = [];

        for (const imageId of selectedImageIds) {
          let imageAnnotations = annotationsCache.current.get(imageId);
          if (!imageAnnotations) {
            imageAnnotations = await annotationService.getAnnotationsForImage(imageId);
            annotationsCache.current.set(imageId, imageAnnotations);
          }
          allAnnotations.push(...imageAnnotations);
        }

        // Extract unique labels
        const labelMap = new Map<string, Label>();
        allAnnotations.forEach(ann => {
          if (ann.labelId && !labelMap.has(ann.labelId._id)) {
            labelMap.set(ann.labelId._id, ann.labelId);
          }
        });

        setLabels(Array.from(labelMap.values()));
      } catch (err: any) {
        console.error("Failed to load labels:", err);
        setError(err.message || "Failed to load labels");
      } finally {
        setLoading(false);
      }
    };

    loadLabelsForSelectedImages();
  }, [projectId, selectedImageIds]);

  const allSelected = labels.length > 0 && selectedLabelIds.length === labels.length;

  const handleToggleAll = () => {
    if (allSelected) {
        onSelectionChange([]); // Deselect all
        } else {
        onSelectionChange(labels.map(label => label._id)); // Select all
        }
    };

  const handleToggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      onSelectionChange(selectedLabelIds.filter((id) => id !== labelId));
    } else {
      onSelectionChange([...selectedLabelIds, labelId]);
    }
  };

  if (loading) return <p>Loading labels...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (labels.length === 0) return <p>No labels found for the selected image</p>;

  return (
    <div>
      <h3 className="font-inter font-bold text-base text-gray-800 mb-3">
        Select labels to export
      </h3>
      <div className="space-y-2">
        {/* Select all */}
        <label className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input type="checkbox" 
                checked={allSelected} 
                onChange={handleToggleAll} 
                className="h-4 w-4" 
            />
            <span className="font-small">Select All</span>
        </label>

        {/* Label list */}
        {labels.map((label) => (
          <label
            key={label._id}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedLabelIds.includes(label._id)}
              onChange={() => handleToggleLabel(label._id)}
              className="w-4 h-4"
            />
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: label.colour }}
              ></span>
              {label.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
