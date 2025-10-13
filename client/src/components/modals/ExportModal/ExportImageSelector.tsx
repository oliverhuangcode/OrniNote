import { useEffect, useState } from "react";
import { imageService, Image } from "../../../services/imageService";

interface ExportImageSelectorProps {
  projectId: string;
  selectedImageIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export default function ExportImageSelector({
  projectId,
  selectedImageIds,
  onSelectionChange,
}: ExportImageSelectorProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [projectId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const data = await imageService.getImagesByProject(projectId);
      setImages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  const allSelected = images.length > 0 && selectedImageIds.length === images.length; 

  const handleToggleAll = () => {
    if (allSelected) {
        onSelectionChange([]); // Deselect all
        } else {
        onSelectionChange(images.map(image => image._id)); // Select all
        }
    };

  const handleToggleImage = (imageId: string) => {
    if (selectedImageIds.includes(imageId)) {
      onSelectionChange(selectedImageIds.filter((id) => id !== imageId));
    } else {
      onSelectionChange([...selectedImageIds, imageId]);
    }
  };

  if (loading) return <p>Loading images...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h3 className="font-inter font-bold text-base text-gray-800 mb-3">
        Select images to export
      </h3>

      <div className="space-y-2">
        {/* Select all */}
        <label className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleToggleAll}
            className="h-4 w-4"
          />
          <span className="font-small">Select All</span>
        </label>

        {/* Images list */}
        {images.map(image => (
          <label
            key={image._id}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedImageIds.includes(image._id)}
              onChange={() => handleToggleImage(image._id)}
              className="w-4 h-4"
            />
            <span>{image.filename || "Image"}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
