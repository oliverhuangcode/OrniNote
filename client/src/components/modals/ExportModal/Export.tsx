import { useEffect, useState } from "react";
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

  const renderStyle = (style: any, level = 2) => {
    if (!style) return '';
    const attrs = Object.entries(style)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    return indent(level, `<style ${attrs} />`);
  };

  const renderPoints = (points: any[], level = 2) => {
    if (!points || !Array.isArray(points)) return '';
    return (
      indent(level, `<points>`) +
      '\n' +
      points.map(p => indent(level + 1, `<point x="${p.x}" y="${p.y}" />`)).join('\n') +
      '\n' +
      indent(level, `</points>`)
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

  const renderAnnotation = (ann: any, level = 3) => {
    const lines = [];
    lines.push(indent(level, `<annotation label="${ann.label}" type="${ann.type}">`));

    switch (ann.type) {
      case 'rectangle':
        lines.push(renderPosition(ann.shapeData.position, level + 1));
        lines.push(renderSize(ann.shapeData.width, ann.shapeData.height, level + 1));
        break;
      case 'line':
      case 'path':
        lines.push(renderPoints(ann.shapeData.points, level + 1));
        break;
      case 'text':
        lines.push(renderPosition(ann.shapeData.position, level + 1));
        lines.push(renderText(ann.shapeData.text, level + 1));
        break;
      default:
        if (ann.shapeData.points) lines.push(renderPoints(ann.shapeData.points, level + 1));
        if (ann.shapeData.position) lines.push(renderPosition(ann.shapeData.position, level + 1));
        if (ann.shapeData.text) lines.push(renderText(ann.shapeData.text, level + 1));
    }

    lines.push(renderStyle(ann.shapeData.style, level + 1));
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

      if (ann.type === "rectangle") {
        output += `    Position: x=${ann.shapeData.position.x}, y=${ann.shapeData.position.y}\n`;
        output += `    Size: width=${ann.shapeData.width}, height=${ann.shapeData.height}\n`;
      } else if (ann.type === "line" || ann.type === "path") {
        output += "    Points:\n";
        ann.shapeData.points.forEach((p: any, i: number) => {
          output += `      ${i + 1}: x=${p.x}, y=${p.y}\n`;
        });
      } else if (ann.type === "text") {
        output += `    Position: x=${ann.shapeData.position.x}, y=${ann.shapeData.position.y}\n`;
        output += `    Text: ${ann.shapeData.text}\n`;
      }

      if (ann.shapeData.style) {
        output += `    Style: color=${ann.shapeData.style.color}, strokeWidth=${ann.shapeData.style.strokeWidth}\n`;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-h-[80vh] overflow-y-auto w-full max-w-3xl relative flex">
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
            {projectData?.name ? (
              <img src={projectData.name} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No preview</div>
            )}
          </div>

          {/* Format Menu */}
          <div className="mb-6">
            <h3 className="font-inter font-bold text-base text-gray-800 mb-3">Format</h3>
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

          {/* Images Menu */}
          <div className="mb-6">
            <ExportImageSelector
              projectId={projectData?.id || ""}
              selectedImageIds={selectedImageIds}
              onSelectionChange={setSelectedImageIds}
            />
          </div>
          
          {/* Labels Menu */}
          {selectedImageIds.length > 0 && (
            <ExportLabelSelector
              projectId={projectData?.id || ""}
              selectedImageIds={selectedImageIds}
              selectedLabelIds={selectedLabelIds}
              onSelectionChange={setSelectedLabelIds}
            />
          )}

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
