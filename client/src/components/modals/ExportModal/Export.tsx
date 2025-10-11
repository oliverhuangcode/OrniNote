import { useState } from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import ExportLabelSelector from "./ExportLabelSelector";

interface ExportProps {
  isOpen: boolean;
  onClose: () => void;
  projectData?: {
    id: string;
    name: string;
    image?: string;
    annotations: any[];
  };
}

type ExportFormat = "JSON" | "XML" | "TXT";
type ExportPages = "all" | "custom";

const formatOptions: ExportFormat[] = ["JSON", "XML", "TXT"];

export default function Export({ isOpen, onClose, projectData }: ExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("JSON");
  const [selectedLabels, setselectedLabels] = useState<ExportPages>("all");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  // Map annotationSchema to exportable format
  const mapAnnotationForExport = (ann: any) => ({
    labelId: ann.labelId,
    label: ann.labelName,
    type: ann.type, 
    shapeData: ann.properties
  });

  // Filter annotations based on labels 
  const getFilteredAnnotations = () => {
    if (!projectData) return [];

    return projectData.annotations
      .filter((a) => selectedLabelIds.includes(a.labelId))
      .map(mapAnnotationForExport);
};

  // Generate export data 
  const generateExportData = () => {
    if (!projectData) return "";

    const exportData = {
      image: projectData.image || `${projectData.name || "untitled"}`,
      annotations: getFilteredAnnotations(),
    };

    switch (selectedFormat) {
      case "JSON":
        return JSON.stringify(exportData, (key, value) => {
            if (key === "labelId") return undefined; // remove labelId
            return value;
          }, 2);
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

    const renderStyle = (style: any, level = 2) => {
      if (!style) return '';
      const attrs = Object.entries(style)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      return indent(level, `<style ${attrs} />`);
    };

    const renderPoints = (points: any[], level = 2) => {
      if (!points || !Array.isArray(points)) return '';
      return indent(level, `<points>\n`) +
        points.map(p => indent(level + 1, `<point x="${p.x}" y="${p.y}" />`)).join('\n') +
        '\n' + indent(level, `</points>`);
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

    const renderAnnotation = (ann: any) => {
      const lines = [];
      lines.push(indent(2, `<annotation label="${ann.label}" type="${ann.type}">`));

      switch (ann.type) {
        case 'rectangle':
          lines.push(renderPosition(ann.shapeData.position, 3));
          lines.push(renderSize(ann.shapeData.width, ann.shapeData.height, 3));
          break;
        case 'line':
        case 'path':
          lines.push(renderPoints(ann.shapeData.points, 3));
          break;
        case 'text':
          lines.push(renderPosition(ann.shapeData.position, 3));
          lines.push(renderText(ann.shapeData.text, 3));
          break;
        default:
          // fallback: attempt points or position
          if (ann.shapeData.points) lines.push(renderPoints(ann.shapeData.points, 3));
          if (ann.shapeData.position) lines.push(renderPosition(ann.shapeData.position, 3));
          if (ann.shapeData.text) lines.push(renderText(ann.shapeData.text, 3));
      }

      lines.push(renderStyle(ann.shapeData.style, 3));
      lines.push(indent(2, `</annotation>`));
      return lines.join('\n');
    };

  return `<?xml version="1.0" encoding="UTF-8"?>
<annotation>
  <image>${data.image}</image>
  <annotations>
${data.annotations.map(renderAnnotation).join('\n')}
  </annotations>
</annotation>`;
};

const generateTXT = (data: any) => {
  let output = `Image: ${data.image}\n\nAnnotations:`;

  data.annotations.forEach((ann: any, index: number) => {
    output += `\nAnnotation ${index + 1}:\n`;
    output += `Label: ${ann.label}\n`;
    output += `Type: ${ann.type}\n`;

    // Shape-specific details
    if (ann.type === "rectangle") {
      output += `Position: x=${ann.shapeData.position.x}, y=${ann.shapeData.position.y}\n`;
      output += `Size: width=${ann.shapeData.width}, height=${ann.shapeData.height}\n`;
    } else if (ann.type === "line" || ann.type === "path") {
      output += "Points:\n";
      ann.shapeData.points.forEach((p: any, i: number) => {
        output += `  ${i + 1}: x=${p.x}, y=${p.y}\n`;
      });
    } else if (ann.type === "text") {
      output += `Position: x=${ann.shapeData.position.x}, y=${ann.shapeData.position.y}\n`;
      output += `Text: ${ann.shapeData.text}\n`;
    }

    // Style
    if (ann.shapeData.style) {
      output += `Style: color=${ann.shapeData.style.color}, strokeWidth=${ann.shapeData.style.strokeWidth}\n`;
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl relative shadow-xl flex">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-black rounded p-1 hover:bg-gray-200 transition"
        >
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
            <path
              d="M19.5 6.5L6.5 19.5M6.5 6.5L19.5 19.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Left Side - Preview */}
        <div className="flex-1 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                <path
                  d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-inter font-semibold text-xl text-black">Export</h2>
          </div>

          <div className="w-96 bg-gray-900 rounded-lg max-h-[60vh] overflow-auto">
            <pre className="text-xs text-green-400 font-mono leading-relaxed">
              {generateExportData()}
            </pre>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-300"></div>

        {/* Right Side */}
        <div className="w-80 p-8 mt-5">
          <h3 className="font-inter text-base text-gray-600 mb-3">
            {projectData?.name || "Project Export"}
          </h3>
          <div className="w-full h-36 bg-gray-200 rounded border-2 border-gray-300 overflow-hidden mb-6">
            {projectData?.image ? (
              <img src={projectData.image} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No preview</div>
            )}
          </div>

          {/* Format Menu */}
          <div className="mb-4">
            <h3 className="font-inter font-bold text-base text-gray-800 mb-4">Format</h3>
            <Menu as="div" className="relative">
              <MenuButton className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg font-inter text-gray-600 hover:border-gray-400">
                {selectedFormat}
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                  <path d="M1.13623 1.51208L5.79532 6.20066L10.4544 1.51208" stroke="black" strokeWidth="1.4" />
                </svg>
              </MenuButton>
              <MenuItems className="relative mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg focus:outline-none">
                {formatOptions.map((format) => (
                  <MenuItem key={format}>
                    <button
                      onClick={() => setSelectedFormat(format)}
                      className="w-full text-left px-4 py-2 font-inter text-sm"
                      >
                        {format}
                      </button>
                  </MenuItem>
                ))}
              </MenuItems>
            </Menu>
          </div>

          {/* Labels Menu */}
          <ExportLabelSelector
            projectId={projectData?.id || ""}
            selectedLabelIds={selectedLabelIds}
            onSelectionChange={setSelectedLabelIds}
            />

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="mt-6 px-10 py-2 bg-ml-green text-white font-inter rounded-lg hover:bg-opacity-90"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
