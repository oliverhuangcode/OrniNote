import { useState } from "react";

interface ExportProps {
  isOpen: boolean;
  onClose: () => void;
  projectData?: {
    name: string;
    image?: string;
    annotations: any[]; // annotationSchema objects
  };
}

type ExportFormat = "JSON" | "XML" | "TXT";
type ExportPages = "all" | "custom";

const formatOptions: ExportFormat[] = ["JSON", "XML", "TXT"];
const pageOptions = [
  { value: "all", label: "All pages" },
  { value: "custom", label: "Customised" },
];

export default function Export({ isOpen, onClose, projectData }: ExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("JSON");
  const [selectedPages, setSelectedPages] = useState<ExportPages>("all");
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [customPages, setCustomPages] = useState("");

  // Map annotationSchema to exportable format
  const mapAnnotationForExport = (ann: any) => ({
    id: ann._id || ann.id,
    labelId: ann.labelId,
    createdBy: ann.createdBy,
    type: ann.shapeData.type,
    coordinates: ann.shapeData.coordinates,
    page: ann.page ?? 1 // optional page field for custom page export
  });

  // Filter annotations based on page selection
  const getFilteredAnnotations = () => {
    if (!projectData) return [];

    if (selectedPages === "all") return projectData.annotations.map(mapAnnotationForExport);

    if (selectedPages === "custom" && customPages) {
      // parse pages like "1,3,5-7"
      const pagesSet = new Set<number>();
      customPages.split(",").forEach(part => {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map(Number);
          for (let i = start; i <= end; i++) pagesSet.add(i);
        } else {
          pagesSet.add(Number(part));
        }
      });
      return projectData.annotations
        .map(mapAnnotationForExport)
        .filter(a => pagesSet.has(a.page));
    }

    return projectData.annotations.map(mapAnnotationForExport);
  };

  // Generate export data
  const generateExportData = () => {
    if (!projectData) return "";

    const exportData = {
      image_id: projectData.image || `${projectData.name || "untitled"}.jpg`,
      annotations: getFilteredAnnotations(),
    };

    switch (selectedFormat) {
      case "JSON":
        return JSON.stringify(exportData, null, 2);
      case "XML":
        return generateXML(exportData);
      case "TXT":
        return generateTXT(exportData);
      default:
        return JSON.stringify(exportData, null, 2);
    }
  };

  // Generate XML format
  const generateXML = (data: any) => `
<?xml version="1.0" encoding="UTF-8"?>
<annotation>
  <image_id>${data.image_id}</image_id>
  <annotations>
    ${data.annotations
      .map(
        (ann: any) => `
      <annotation id="${ann.id}" page="${ann.page}">
        <labelId>${ann.labelId}</labelId>
        <createdBy>${ann.createdBy}</createdBy>
        <shape type="${ann.type}">
          ${
            Array.isArray(ann.coordinates[0])
              ? ann.coordinates.map((c: number[]) => `<point>${c.join(",")}</point>`).join("")
              : `<point>${ann.coordinates.join(",")}</point>`
          }
        </shape>
      </annotation>`
      )
      .join("")}
  </annotations>
</annotation>`;

// Generate TXT format 
  const generateTXT = (data: any) => `
Image: ${data.image_id}

Annotations:
${data.annotations
  .map(
    (ann: any) => `
ID: ${ann.id}
LabelId: ${ann.labelId}
Created By: ${ann.createdBy}
Type: ${ann.type}
Coordinates: ${
      Array.isArray(ann.coordinates[0])
        ? ann.coordinates.map((c: number[]) => `[${c.join(",")}]`).join(" ")
        : `[${ann.coordinates.join(",")}]`
    }
Page: ${ann.page}`
  )
  .join("\n")}
`;

  const handleExport = () => {
    const exportContent = generateExportData();
    const blob = new Blob([exportContent], {
      type:
        selectedFormat === "JSON"
          ? "application/json"
          : selectedFormat === "XML"
          ? "application/xml"
          : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectData?.name || "export"}.${selectedFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onClose();
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl relative shadow-xl flex">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-black rounded p-1 bg-transparent hover:bg-gray-200 transition-colors"
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

          {/* Code Preview */}
          <div className="w-96 bg-gray-900 rounded-lg max-h-[60vh] overflow-auto">
            <pre className="text-xs text-green-400 font-mono leading-relaxed">
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
              {projectData?.name || "Jinling White Duck"}
            </h3>
            <div className="w-full h-36 bg-gray-200 rounded border-2 border-gray-300 overflow-hidden">
              {projectData?.image ? (
                <img 
                  src={projectData.image} 
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

          {/* Pages Selection */}
          <div className="mb-5">
            <h3 className="font-inter font-bold text-base text-gray-800 mb-4">Pages</h3>
            <div className="relative">
              <button
                onClick={() => setShowPagesDropdown(!showPagesDropdown)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg font-inter text-gray-600 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-green"
              >
                <span>{pageOptions.find(opt => opt.value === selectedPages)?.label || "Select pages"}</span>
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

          {/* Custom Page Input */}
          {selectedPages === "custom" && (
            <div className="-mt-3">
              <input
                type="text"
                value={customPages} 
                onChange={(e) => setCustomPages(e.target.value)}
                placeholder="e.g. 1, 3, 5-7"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ml-green"
              />
            </div>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="mt-4 px-10 py-2 bg-ml-green text-white font-inter rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
