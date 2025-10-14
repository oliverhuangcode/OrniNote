import { useEffect, useState, useRef } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import ExportLabelSelector from "./ExportLabelSelector";
import ExportImageSelector from "./ExportImageSelector";
import { imageService } from "../../../services/imageService";

interface ExportProps {
  isOpen: boolean;
  onClose: () => void;
  projectData?: {
    id: string;
    name: string;
    annotations: any[];
  };
}

type ExportFormat = "JSON" | "XML" | "TXT";

const formatOptions: ExportFormat[] = ["JSON", "XML", "TXT"];

export default function Export({ isOpen, onClose, projectData }: ExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("JSON");
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (projectData?.id) {
      imageService.getImagesByProject(projectData.id).then(setImages);
    }
  }, [projectData?.id]);

  // Lookup map for image properties 
  const imageMap = Object.fromEntries(images.map(img => [img._id, {filename: img.filename, url: img.url}]));

  // Map annotationSchema to exportable format
  const mapAnnotationForExport = (ann: any) => ({
    label: ann.labelName,
    type: ann.type, 
    shapeData: ann.properties
  });

  // Filter annotations by images and labels 
  const getFilteredAnnotations = () => {
    if (!projectData) return [];

    // Filter based on selected images and labels 
    const filteredData = projectData.annotations
      .filter((a) => selectedImageIds.includes(a.imageId))
      .filter((a) => selectedLabelIds.includes(a.labelId));

    // Group by image 
    const grouped: Record<string, any[]> = {};
    filteredData.forEach(a => {
        if (!grouped[a.imageId]) grouped[a.imageId] = [];
        grouped[a.imageId].push(mapAnnotationForExport(a));
      });

    // Convert to array 
    return Object.entries(grouped).map(([imageId, annotations]) => ({
    imageName: imageMap[imageId].filename,
    imageUrl: imageMap[imageId].url,
    annotations
  }));
};

  // Generate export data 
  const generateExportData = () => {
    if (!projectData) return "";

    const exportData = {
      project: `${projectData.name || "untitled"}`,
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

const generateXML = (data: any) => {
  const indent = (level: number, text: string) => '  '.repeat(level) + text;

  // Helper renderers 
  const renderStyle = (style: any, level = 2) => {
    if (!style) return '';
    const attrs = Object.entries(style)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    return indent(level, `<style ${attrs} />`);
  };

  const renderPoints = (points: any[], level = 2) => {
    if (!points || points.length === 0) return '';
    return (
      indent(level, `<points>`) +
      '\n' +
      points.map(p => {
        const attrs = `x="${p.x}" y="${p.y}"` +
          (p.labelName ? ` labelName="${p.labelName}"` : '') +
          (p.color ? ` color="${p.color}"` : '');
        return indent(level + 1, `<point ${attrs} />`);
      }).join('\n') +
      '\n' +
      indent(level, `</points>`)
    );
  };

  const renderEdges = (edges: any[], level = 2) => {
    if (!edges || edges.length === 0) return '';
    return (
      indent(level, `<edges>`) +
      '\n' +
      edges.map(e =>
        indent(level + 1, `<edge from="${e.from}" to="${e.to}" labelName="${e.labelName}" color="${e.color}" />`)
      ).join('\n') +
      '\n' +
      indent(level, `</edges>`)
    );
  };

  const renderPosition = (position: any, level = 2) => {
    if (!position) return '';
    return indent(level, `<position x="${position.x}" y="${position.y}" />`);
  };

  const renderSize = (width: number, height: number, level = 2) => {
    if (width == null || height == null) return '';
    return indent(level, `<size width="${width}" height="${height}" />`);
  };

  const renderText = (text: string, level = 2) => {
    if (!text) return '';
    return indent(level, `<text>${text}</text>`);
  };

  // Annotation renderer
  const renderAnnotation = (ann: any, level = 3) => {
    const lines = [indent(level, `<annotation label="${ann.label}" type="${ann.type}">`)];
    const sd = ann.shapeData || {};

    switch (ann.type) {
      case 'rectangle':
        lines.push(renderPosition(sd.position, level + 1));
        lines.push(renderSize(sd.width, sd.height, level + 1));
        break;

      case 'text':
        lines.push(renderPosition(sd.position, level + 1));
        lines.push(renderText(sd.text, level + 1));
        break;

      case 'skeleton':
        lines.push(renderPoints(sd.skeletonPoints, level + 1));
        lines.push(renderEdges(sd.skeletonEdges, level + 1));
        break;

      default: // line, path, polygon, etc.
        if (sd.points) lines.push(renderPoints(sd.points, level + 1));
    }

    lines.push(renderStyle(sd.style, level + 1));
    lines.push(indent(level, `</annotation>`));
    return lines.join('\n');
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<annotation>
  <project>${data.project}</project>
  <images>
${data.annotations.map((img: any) => `    <image>
      <filename>${img.imageName}</filename>
      <url>${img.imageUrl}</url>
      <annotations>
${img.annotations.map((ann: any) => renderAnnotation(ann, 4)).join('\n')}
      </annotations>
    </image>`).join('\n\n')}
  </images>
</annotation>`;
};

const generateTXT = (data: any) => {
  let output = `Project: ${data.project}\n\n`;

  data.annotations.forEach((img: any) => {
    output += `Image: ${img.imageName}\n`;
    output += `URL: ${img.imageUrl}\n`;
    output += `Annotations:\n`;

    img.annotations.forEach((ann: any, index: number) => {
      output += `  Annotation ${index + 1}:\n`;
      output += `    Label: ${ann.label}\n`;
      output += `    Type: ${ann.type}\n`;

      const sd = ann.shapeData || {};

      switch (ann.type) {
        case "rectangle":
          if (sd.position) {
            output += `    Position: x=${sd.position.x}, y=${sd.position.y}\n`;
          }
          output += `    Size: width=${sd.width}, height=${sd.height}\n`;
          break;

        case "text":
          if (sd.position) {
            output += `    Position: x=${sd.position.x}, y=${sd.position.y}\n`;
          }
          output += `    Text: ${sd.text}\n`;
          break;

        case "line":
        case "path":
        case "polygon":
          if (sd.points && sd.points.length > 0) {
            output += `    Points:\n`;
            sd.points.forEach((p: any, i: number) => {
              output += `      ${i + 1}: x=${p.x}, y=${p.y}`;
              if (p.labelName) output += `, labelName=${p.labelName}`;
              if (p.color) output += `, color=${p.color}`;
              output += `\n`;
            });
          }
          break;

        case "skeleton":
          if (sd.skeletonPoints && sd.skeletonPoints.length > 0) {
            output += `    Skeleton Points:\n`;
            sd.skeletonPoints.forEach((p: any, i: number) => {
              output += `      ${i + 1}: x=${p.x}, y=${p.y}, labelName=${p.labelName}, color=${p.color}\n`;
            });
          }
          if (sd.skeletonEdges && sd.skeletonEdges.length > 0) {
            output += `    Skeleton Edges:\n`;
            sd.skeletonEdges.forEach((e: any, i: number) => {
              output += `      ${i + 1}: from=${e.from}, to=${e.to}, labelName=${e.labelName}, color=${e.color}\n`;
            });
          }
          break;

        default:
          // fallback for any other type
          if (sd.points && sd.points.length > 0) {
            output += `    Points:\n`;
            sd.points.forEach((p: any, i: number) => {
              output += `      ${i + 1}: x=${p.x}, y=${p.y}\n`;
            });
          }
      }

      // Style (common for all)
      if (sd.style) {
        output += `    Style: color=${sd.style.color}, strokeWidth=${sd.style.strokeWidth}\n`;
      }

      output += `\n`;
    });
  });

  return output;
};

  // Main export handler 
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl max-h-[85vh] w-full max-w-5xl relative flex shadow-2xl animate-scale-in overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 rounded-lg p-1.5 hover:bg-gray-100 transition-all duration-200 z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Left Side - Preview */}
        <div className="flex-1 p-8 bg-gray-50 border-r border-gray-200 overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-inter font-semibold text-xl text-gray-900">Export Annotations</h2>
          </div>

          <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
            <pre className="text-xs text-green-400 font-mono leading-relaxed p-4 h-full overflow-auto">
              {generateExportData()}
            </pre>
          </div>
        </div>

        {/* Right Side - Controls */}
        <div className="w-80 p-6 overflow-y-auto">
          <div className="mt-8">
            <h3 className="font-inter font-semibold text-lg text-gray-900 mb-1">
              {projectData?.name || "Project"}
            </h3>
            <p className="text-sm text-gray-500 font-inter mb-6">
              Configure your export settings
            </p>

            {selectedImageIds.length === 1 && imageMap[selectedImageIds[0]] && (
              <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden mb-6">
                  <img 
                  src={imageMap[selectedImageIds[0]].url} 
                  alt="preview" 
                  className="w-full h-full object-cover" />
              </div>
            )}

            {/* Format Menu */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                Export Format
              </label>
              <Menu as="div" className="relative">
                <MenuButton className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg font-inter text-sm text-gray-700 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                  {selectedFormat}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </MenuButton>
                <MenuItems className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg focus:outline-none z-10">
                  {formatOptions.map((format) => (
                    <MenuItem key={format}>
                      <button
                        onClick={() => setSelectedFormat(format)}
                        className="w-full text-left px-3.5 py-2.5 font-inter text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {format}
                        </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>

            {/* Images Selector */}
            <div className="mb-6">
              <ExportImageSelector
                projectId={projectData?.id || ""}
                selectedImageIds={selectedImageIds}
                onSelectionChange={setSelectedImageIds}
              />
            </div>
            
            {/* Labels Selector */}
            {selectedImageIds.length > 0 && (
              <div className="mb-6">
                <ExportLabelSelector
                  projectId={projectData?.id || ""}
                  selectedImageIds={selectedImageIds}
                  selectedLabelIds={selectedLabelIds}
                  onSelectionChange={setSelectedLabelIds}
                />
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={selectedImageIds.length === 0 || selectedLabelIds.length === 0}
              className="w-full py-2.5 bg-green-600 text-white font-inter font-medium text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export {selectedFormat}
            </button>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}