import { useState } from "react";
import { AnnotationExportService, MongoAnnotation, MongoLabel } from "../../../services/annotationExportService";

interface ExportProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: {
    name: string;
    annotations: MongoAnnotation[]; // Updated to use MongoAnnotation type
    labels: MongoLabel[]; // Added labels prop
    image?: {
      url: string;
      width: number;
      height: number;
    };
  };
}

type ExportFormat = "JSON" | "COCO" | "CSV" | "YOLO" | "Pascal VOC";
type ExportPages = "all" | "custom";

const formatOptions: ExportFormat[] = ["JSON", "COCO", "CSV", "YOLO", "Pascal VOC"];
const pageOptions = [
  { value: "all", label: "All annotations" },
  { value: "custom", label: "Customised" },
];

export default function Export({ isOpen, onClose, projectData }: ExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("JSON");
  const [selectedPages, setSelectedPages] = useState<ExportPages>("all");
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [customPages, setCustomPages] = useState("");
  
  const exportService = new AnnotationExportService();

  // Filter annotations based on selection
  const getFilteredAnnotations = (): MongoAnnotation[] => {
    if (selectedPages === "all") {
      return projectData.annotations;
    }
    
    // Parse custom page/annotation selection (e.g., "1, 3, 5-7")
    const selectedIndices = new Set<number>();
    const parts = customPages.split(',').map(p => p.trim()).filter(p => p);
    
    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n) - 1);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            selectedIndices.add(i);
          }
        }
      } else {
        const index = parseInt(part) - 1;
        if (!isNaN(index)) {
          selectedIndices.add(index);
        }
      }
    });
    
    return projectData.annotations.filter((_, idx) => selectedIndices.has(idx));
  };

  const generateExportData = (): string => {
    const annotations = getFilteredAnnotations();
    const imageWidth = projectData.image?.width || 800;
    const imageHeight = projectData.image?.height || 600;
    const labels = projectData.labels;

    switch (selectedFormat) {
      case "JSON":
        return exportService.exportJSON(annotations, labels, {
          format: 'json',
          imageName: projectData.name,
          imageWidth,
          imageHeight
        });
      
      case "COCO":
        return exportService.exportCOCO(annotations, labels, {
          id: 1,
          filename: `${projectData.name}.jpg`,
          width: imageWidth,
          height: imageHeight
        });
      
      case "CSV":
        return exportService.exportCSV(annotations, labels, {
          format: 'csv',
          imageName: projectData.name,
          imageWidth,
          imageHeight
        });
      
      case "YOLO":
        return exportService.exportYOLO(annotations, labels, {
          format: 'yolo',
          imageName: projectData.name,
          imageWidth,
          imageHeight
        });
      
      case "Pascal VOC":
        return exportService.exportPascalVOC(annotations, labels, {
          format: 'pascal-voc',
          imageName: projectData.name,
          imageWidth,
          imageHeight
        });
      
      default:
        return exportService.exportJSON(annotations, labels, {
          format: 'json',
          imageName: projectData.name,
          imageWidth,
          imageHeight
        });
    }
  };

  const getFileExtension = (): string => {
    return exportService.getFileExtension(selectedFormat);
  };

  const getMimeType = (): string => {
    return exportService.getMimeType(selectedFormat);
  };

  const handleExport = () => {
    try {
      const exportContent = generateExportData();
      const blob = new Blob([exportContent], { type: getMimeType() });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectData.name}_annotations.${getFileExtension()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export annotations. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl relative shadow-xl flex">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-black rounded p-1 bg-transparent hover:bg-gray-200 transition-colors z-10"
        >
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
            <path d="M19.5 6.5L6.5 19.5M6.5 6.5L19.5 19.5" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Left Side - Preview */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-inter font-semibold text-xl text-black">Export</h2>
          </div>

          {/* Stats */}
          <div className="mb-3 text-sm text-gray-600">
            <p>Total annotations: {projectData.annotations.length}</p>
            <p>Labels: {projectData.labels.length}</p>
            {selectedPages === "custom" && customPages && (
              <p>Selected: {getFilteredAnnotations().length}</p>
            )}
          </div>

          {/* Code Preview */}
          <div className="bg-gray-900 rounded-lg max-h-[60vh] overflow-auto p-4">
            <pre className="text-xs text-green-400 font-mono leading-relaxed whitespace-pre-wrap">
              {generateExportData()}
            </pre>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-300"></div>

        {/* Right Side - Options */}
        <div className="w-80 p-8 mt-5">
          {/* Project Preview */}
          <div className="mb-4">
            <h3 className="font-inter text-base text-gray-600 mb-3">
              {projectData.name}
            </h3>
            <div className="w-full h-36 bg-gray-200 rounded border-2 border-gray-300 overflow-hidden">
              {projectData.image?.url ? (
                <img 
                  src={projectData.image.url} 
                  alt="Project preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500">
                  No preview
                </div>
              )}
            </div>
          </div>

          {/* Format Selection */}
          <div className="mb-4">
            <h3 className="font-inter font-bold text-base text-gray-800 mb-4">Format</h3>
            <div className="relative">
              <button
                onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg font-inter text-gray-600 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-green"
              >
                <span>{selectedFormat || "Select format"}</span>
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className={`transform transition-transform ${showFormatDropdown ? 'rotate-180' : ''}`}>
                  <path d="M1.13623 1.51208L5.79532 6.20066L10.4544 1.51208" stroke="black" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showFormatDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {formatOptions.map((format) => (
                    <button
                      key={format}
                      onClick={() => {
                        setSelectedFormat(format);
                        setShowFormatDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left font-inter text-gray-800 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Annotation Selection */}
          <div className="mb-5">
            <h3 className="font-inter font-bold text-base text-gray-800 mb-4">Annotations</h3>
            <div className="relative">
              <button
                onClick={() => setShowPagesDropdown(!showPagesDropdown)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg font-inter text-gray-600 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-green"
              >
                <span>{pageOptions.find(opt => opt.value === selectedPages)?.label || "Select annotations"}</span>
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className={`transform transition-transform ${showPagesDropdown ? 'rotate-180' : ''}`}>
                  <path d="M1.13623 1.12451L5.79532 5.77849L10.4544 1.12451" 
                  stroke="black" 
                  strokeWidth="1.4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  />
                </svg>
              </button>
              {showPagesDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  {pageOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedPages(option.value as ExportPages);
                        setShowPagesDropdown(false);
                      }}
                      className="w-full px-2 py-2 text-left font-inter text-gray-800 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Annotation Input */}
          {selectedPages === "custom" && (
            <div className="-mt-3 mb-4">
              <input
                type="text"
                value={customPages} 
                onChange={(e) => setCustomPages(e.target.value)}
                placeholder="e.g. 1, 3, 5-7"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ml-green text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter annotation numbers (1-{projectData.annotations.length})
              </p>
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={projectData.annotations.length === 0}
            className="mt-4 w-full py-2 bg-ml-green text-white font-inter rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Export {selectedPages === "custom" && customPages ? `(${getFilteredAnnotations().length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}