import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LiveblocksProvider,
  RoomProvider,
  useOthers,
  useMyPresence,
  useStorage,
  useMutation,
} from "@liveblocks/react";
import { LiveList } from "@liveblocks/client";
import { ActiveFile, Layer, ToolbarTool, ImageData } from "./types";
import {
  Move,
  Search,
  Maximize,
  Square,
  Minus,
  Brush,
  Type,
  Pipette,
  Wand2,
  Pen,
} from "lucide-react";
import { projectService } from "../../services/projectService";
import type { Annotation as AnnotationType } from "./types";
import ShareProject from "../../components/modals/ShareProjectModal/ShareProject";
import Export from "../../components/modals/ExportModal/Export";
import CreateProject from "../../components/modals/CreateProjectModal/CreateProject";
import OpenProject from "../../components/modals/OpenProjectModal/OpenProject";
import Help from "../../components/modals/HelpModal/Help";
import LeftToolbar from "./components/LeftToolbar";
import CanvasArea from "./components/CanvasArea";
import LabelPanel from "./components/LabelPanel";
import TopNav from "./components/TopNav";
import Cursor from "../../components/ui/cursor";
import "../../styles/globals.css";
import { s3UploadService } from "../../services/s3UploadService";
import { annotationService } from "../../services/annotationService";
import ManageLabels from "../../components/modals/ManageLabelsModal/ManageLabels";
import { labelService, Label } from "../../services/labelService";
import { getAnonymousName } from "../../utils/mockData";
import { useAuth } from "../../contexts/authContext";
import { imageService } from "../../services/imageService";

// Define the types for your presence data
type CursorPosition = {
  x: number;
  y: number;
};

type Presence = {
  cursor: CursorPosition | null;
  userInfo: {
    name: string;
    email: string;
  } | null;
};

// Update Liveblocks types to just store annotation IDs
declare global {
  interface Liveblocks {
    Presence: Presence;
    Storage: {
      annotationIds: LiveList<string>;
    };
    UserMeta: {};
    RoomEvent: {};
  }
}

const CURSOR_COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  // "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

interface ProjectData {
  name: string;
  width: number;
  height: number;
  imageUrl?: string;
  imageFilename?: string;
  teamMembers: string[];
}

interface Project {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  images: Array<{
    _id: string;
    filename: string;
    url: string;
    width: number;
    height: number;
    uploadedAt: string;
  }>;
  collaborators: Array<{
    user: {
      _id: string;
      username: string;
      email: string;
    };
    role: string;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function Annotation() {
  const { id: projectId } = useParams();
  const { user, signout } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const navigate = useNavigate();

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Project data state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active files based on project images
  const [activeFiles, setActiveFiles] = useState<ActiveFile[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [selectedTool, setSelectedTool] = useState("move");
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [annotations, setAnnotations] = useState<AnnotationType[]>([]);
  const [allAnnotations, setAllAnnotations] = useState<AnnotationType[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<
    string | null
  >(null);

  // Liveblocks storage for syncing annotation IDs
  const annotationIds = useStorage((root) => root.annotationIds);

  // Mutation to add annotation ID to Liveblocks
  const addAnnotationId = useMutation(({ storage }, id: string) => {
    const ids = storage.get("annotationIds");
    // Only add if not already present
    if (!ids.toArray().includes(id)) {
      ids.push(id);
    }
  }, []);

  // Color palette state
  const colorPalette = ["#3B3B3B", "#5CBF7D"];
  const [selectedColor, setSelectedColor] = useState<string>(colorPalette[0]);

  // State for current image and label
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);
  const [currentLabelId, setCurrentLabelId] = useState<string | null>(null);
  const [labels, setLabels] = useState<Label[]>([]);
  const [showManageLabelsModal, setShowManageLabelsModal] = useState(false);
  const [undoStack, setUndoStack] = useState<AnnotationType[][]>([]);
  const [redoStack, setRedoStack] = useState<AnnotationType[][]>([]);

  // Load project data on mount
  useEffect(() => {
    if (projectId) {
      loadProject();
      loadLabels();
      loadAnnotationsForProject(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    const activeFile = activeFiles.find((file) => file.isActive);
    if (activeFile && activeFile.id !== currentImageId) {
      setCurrentImageId(activeFile.id);
    }
  }, [activeFiles, currentImageId]);

  // Watch for changes in annotationIds and reload annotations
  useEffect(() => {
    if (annotationIds && currentImageId) {
      console.log("Annotation IDs changed, reloading annotations...");
      loadAnnotationsForImage(currentImageId);
    }
  }, [annotationIds?.length, currentImageId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!projectId) {
        throw new Error("Project ID is required");
      }

      console.log("Loading project with ID:", projectId);
      const projectData = await projectService.getProject(projectId);
      console.log("Project data loaded:", projectData);
      setProject(projectData);

      // Set up active files based on project images
      if (projectData.images && projectData.images.length > 0) {
        const files: ActiveFile[] = projectData.images.map((image, index) => ({
          id: image._id,
          name: image.filename,
          isActive: index === 0,
          imageUrl: image.url,
          width: image.width,
          height: image.height,
        }));
        setActiveFiles(files);
      } else {
        setActiveFiles([]);
      }

      // Set first image as current if images exist
      if (projectData.images && projectData.images.length > 0) {
        setCurrentImageId(projectData.images[0]._id);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

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

  // Load all annotations within a project
  const loadAnnotationsForProject = async (projectId: string) => {
    try {
      // Fetch all images in project
      const images = await imageService.getImagesByProject(projectId);
      console.log(`Found ${images.length} images in project.`);
      
      // Fetch all annotations for each image 
      const annotationPromises = images.map(async (image: any) => {
        const fetchedAnnotations = await annotationService.getAnnotationsForImage(image._id);

        // Convert annotation data to AnnotationsType format
        const converted = fetchedAnnotations.map(ann => {
          let properties: any = {
            style: {
              color: ann.labelId.colour,
              strokeWidth: 2
            }
          };

          if (ann.shapeData.type === 'rectangle') {
            properties.position = {
              x: ann.shapeData.coordinates.x,
              y: ann.shapeData.coordinates.y
            };
            properties.width = ann.shapeData.coordinates.width;
            properties.height = ann.shapeData.coordinates.height;
          } else if (ann.shapeData.type === 'polygon' || ann.shapeData.type === 'line' || ann.shapeData.type === 'path' || ann.shapeData.type === 'brush') {
            properties.points = ann.shapeData.coordinates.points.map((p: number[]) => ({
              x: p[0],
              y: p[1]
            }));
          } else if (ann.shapeData.type === 'point' || ann.shapeData.type === 'text') {
            properties.position = {
              x: ann.shapeData.coordinates.x,
              y: ann.shapeData.coordinates.y
            };
            if (ann.shapeData.type === 'text' && ann.shapeData.coordinates.text) {
              properties.text = ann.shapeData.coordinates.text;
            }
          } else if (ann.shapeData.type === 'skeleton') {
            properties.skeletonPoints = ann.shapeData.coordinates.points || [];
            properties.skeletonEdges = ann.shapeData.coordinates.edges || [];
          }

          return {
            id: ann._id,
            imageId: ann.imageId,
            type: ann.shapeData.type as any,
            properties: properties,
            labelId: ann.labelId._id,
            labelName: ann.labelId.name,
            createdBy: ann.createdBy._id
          } as AnnotationType;
        });

        console.log(`Loaded ${converted.length} annotations for image ${image._id}`);
        return converted;
      });

      // Complete all requests 
      const results = await Promise.all(annotationPromises);

      // Flatten results nested list
      const allAnnotations = results.flat();
      console.log(`Total annotations loaded: ${allAnnotations.length}`);
      
      setAllAnnotations(allAnnotations);
      
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  };
  
  // Load annotations from database
  const loadAnnotationsForImage = async (imageId: string) => {
    try {
      console.log("Loading annotations for image:", imageId);
      const fetchedAnnotations = await annotationService.getAnnotationsForImage(
        imageId
      );

      const convertedAnnotations: AnnotationType[] = fetchedAnnotations.map(
        (ann) => {
          let properties: any = {
            style: {
              color: ann.labelId.colour,
              strokeWidth: 2,
            },
          };

          if (ann.shapeData.type === "rectangle") {
            properties.position = {
              x: ann.shapeData.coordinates.x,
              y: ann.shapeData.coordinates.y,
            };
            properties.width = ann.shapeData.coordinates.width;
            properties.height = ann.shapeData.coordinates.height;
          } else if (
            ann.shapeData.type === "polygon" ||
            ann.shapeData.type === "line" ||
            ann.shapeData.type === "path" ||
            ann.shapeData.type === "brush"
          ) {
            properties.points = ann.shapeData.coordinates.points.map(
              (p: number[]) => ({
                x: p[0],
                y: p[1],
              })
            );
          } else if (
            ann.shapeData.type === "point" ||
            ann.shapeData.type === "text"
          ) {
            properties.position = {
              x: ann.shapeData.coordinates.x,
              y: ann.shapeData.coordinates.y,
            };
            if (
              ann.shapeData.type === "text" &&
              ann.shapeData.coordinates.text
            ) {
              properties.text = ann.shapeData.coordinates.text;
            }
          } else if (ann.shapeData.type === "skeleton") {
            properties.skeletonPoints = ann.shapeData.coordinates.points || [];
            properties.skeletonEdges = ann.shapeData.coordinates.edges || [];
          }

        return {
          id: ann._id,
          imageId: ann.imageId,
          type: ann.shapeData.type as any,
          properties: properties,
          labelId: ann.labelId._id,
          labelName: ann.labelId.name,
          createdBy: ann.createdBy._id
        } as AnnotationType;
      });
      
      setAnnotations(convertedAnnotations);
      console.log(`Loaded ${convertedAnnotations.length} annotations`);
    } catch (error) {
      console.error("Failed to load annotations:", error);
    }
  };

  // Load annotations when currentImageId changes
  useEffect(() => {
    if (currentImageId) {
      loadAnnotationsForImage(currentImageId);
    }
  }, [currentImageId]);

  // Save annotation to database
  const saveAnnotationToDatabase = async (annotation: AnnotationType) => {
    try {
      if (!currentImageId || !currentLabelId) {
        console.error("Cannot save: No image or label selected");
        alert(
          'Please select a label before creating annotations. Click "Manage Labels" to create labels first.'
        );
        setAnnotations((prev) =>
          prev.filter((ann) => ann.id !== annotation.id)
        );
        return;
      }

      if (!user) {
        console.error("Cannot save: No user logged in");
        alert("You must be logged in to create annotations");
        return;
      }

      let coordinates: any;

      if (annotation.type === "rectangle" && annotation.properties.position) {
        coordinates = {
          x: annotation.properties.position.x,
          y: annotation.properties.position.y,
          width: annotation.properties.width || 0,
          height: annotation.properties.height || 0,
        };
      } else if (
        annotation.type === "polygon" &&
        annotation.properties.points
      ) {
        coordinates = {
          points: annotation.properties.points.map((p: any) => [p.x, p.y]),
        };
      } else if (annotation.type === "line" && annotation.properties.points) {
        coordinates = {
          points: annotation.properties.points.map((p: any) => [p.x, p.y]),
        };
      } else if (
        (annotation.type === "path" || annotation.type === "brush") &&
        annotation.properties.points
      ) {
        coordinates = {
          points: annotation.properties.points.map((p: any) => [p.x, p.y]),
        };
      } else if (annotation.type === "text" && annotation.properties.position) {
        coordinates = {
          x: annotation.properties.position.x,
          y: annotation.properties.position.y,
          text: annotation.properties.text || "",
        };
      } else if (annotation.type === "skeleton") {
        coordinates = {
          points: annotation.properties.skeletonPoints || [],
          edges: annotation.properties.skeletonEdges || [],
        };
      } else {
        console.warn(
          "Unknown annotation type or missing properties:",
          annotation
        );
        return;
      }

      const shapeData = {
        type: annotation.type,
        coordinates: coordinates,
        isNormalised: false,
      };

      const savedAnnotation = await annotationService.createAnnotation({
        imageId: currentImageId,
        labelId: currentLabelId,
        createdBy: user._id,
        shapeData,
      });

      console.log("Annotation saved to database:", savedAnnotation);

      // Broadcast the new annotation ID to all users
      addAnnotationId(savedAnnotation._id);

      // Update local state
      updateAnnotations((prev) =>
        prev.map((ann) => {
          if (ann.id === annotation.id) {
            return {
              ...ann,
              id: savedAnnotation._id,
              labelId: savedAnnotation.labelId._id,
              labelName: savedAnnotation.labelId.name,
              createdBy: savedAnnotation.createdBy._id,
              properties: {
                ...ann.properties,
                style: {
                  ...ann.properties.style,
                  color: savedAnnotation.labelId.colour,
                },
              },
            };
          }
          return ann;
        })
      );
    } catch (error) {
      console.error("Failed to save annotation:", error);
    }
  };

  // Keep all your existing handler functions (handleAddImage, handleToolSelect, etc.)
  const handleCreateProject = async (projectData: ProjectData) => {
    try {
      if (!user) {
        throw new Error("User not logged in");
      }

      if (!projectData.imageUrl) {
        throw new Error("Image URL is required");
      }

      // Prepare data for backend
      const backendProjectData = {
        name: projectData.name,
        description: "",
        imageUrl: projectData.imageUrl,
        imageFilename: projectData.imageFilename || "uploaded-image.jpg",
        imageWidth: projectData.width,
        imageHeight: projectData.height,
        ownerId: user._id,
      };

      // Create project in backend
      const newProject = await projectService.createProject(backendProjectData);

      navigate(`/annotation/${newProject._id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  };

  const handleAddImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,application/zip,.zip";
    input.multiple = true;

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;

      if (!files || files.length === 0) return;

      try {
        setIsUploadingImage(true);

        const zipFiles: File[] = [];
        const imageFiles: File[] = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.name.toLowerCase().endsWith(".zip")) {
            zipFiles.push(file);
          } else {
            imageFiles.push(file);
          }
        }

        for (const zipFile of zipFiles) {
          console.log("Extracting images from zip:", zipFile.name);
          const extractedImages = await s3UploadService.extractImagesFromZip(
            zipFile
          );
          imageFiles.push(...extractedImages);
          console.log(
            `Extracted ${extractedImages.length} images from ${zipFile.name}`
          );
        }

        if (imageFiles.length === 0) {
          alert("No valid image files found");
          return;
        }

        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
        ];
        for (const file of imageFiles) {
          if (
            !file.type.startsWith("image/") &&
            !validTypes.includes(file.type)
          ) {
            alert(
              `Invalid file type: ${file.name} (${file.type}). Please upload only image files.`
            );
            return;
          }
        }

        console.log(`Uploading ${imageFiles.length} images...`);

        const uploadResults = await s3UploadService.uploadMultipleImages(
          imageFiles,
          (fileIndex, fileName, progress) => {
            console.log(
              `Uploading ${fileName} (${fileIndex + 1}/${
                imageFiles.length
              }): ${progress.toFixed(1)}%`
            );
          }
        );

        if (!uploadResults.success) {
          const failedUploads = uploadResults.results
            .filter((r) => !r.success)
            .map((r) => r.error)
            .join("\n");
          throw new Error(`Some uploads failed:\n${failedUploads}`);
        }

        console.log("All images uploaded to S3 successfully");

        const imagesData: ImageData[] = await Promise.all(
          imageFiles.map(async (file, index) => {
            const uploadResult = uploadResults.results[index];

            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = URL.createObjectURL(file);
            });

            return {
              imageUrl: uploadResult.imageUrl!,
              imageFilename: file.name,
              imageWidth: img.naturalWidth,
              imageHeight: img.naturalHeight,
            };
          })
        );

        console.log("Adding all images to project...");

        if (projectId) {
          const updatedProject = await projectService.batchAddImagesToProject(
            projectId,
            imagesData
          );

          setProject(updatedProject);

          const newImages = updatedProject.images.slice(-imagesData.length);
          const newActiveFiles: ActiveFile[] = newImages.map(
            (image, index) => ({
              id: image._id,
              name: image.filename,
              isActive: index === 0,
              imageUrl: image.url,
              width: image.width,
              height: image.height,
            })
          );

          setActiveFiles((prev) => [
            ...prev.map((file) => ({ ...file, isActive: false })),
            ...newActiveFiles,
          ]);

          console.log(`Successfully added ${imagesData.length} images!`);
        }
      } catch (err) {
        console.error("Error uploading images:", err);
        alert(err instanceof Error ? err.message : "Failed to upload images");
      } finally {
        setIsUploadingImage(false);
      }
    };

    input.click();
  };

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleCanvasZoom = (direction: "in" | "out" | "reset") => {
    setCanvasZoom((prev) => {
      if (direction === "in") return Math.min(prev + 25, 200);
      if (direction === "out") return Math.max(prev - 25, 25);
      return 100;
    });
  };

  const handleGrid = () => {
    setShowGrid((prev) => !prev);
  };

  // Handle mouse movement to update cursor position
  const handlePointerMove = (event: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    updateMyPresence({
      cursor: {
        x: Math.round(event.clientX - rect.left),
        y: Math.round(event.clientY - rect.top),
      },
    });
  };

  const handlePointerLeave = () => {
    updateMyPresence({
      cursor: null,
    });
  };

  // Save a new action for undo tracking
  const pushToUndoStack = (prevAnnotations: AnnotationType[]) => {
    setUndoStack((prev) => [...prev, prevAnnotations]);
    // Clear redo stack when a new action happens
    setRedoStack([]);
  };

  // Undo last change
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, annotations]);
    setAnnotations(lastState);
  };

  // Redo previously undone change
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, annotations]);
    setAnnotations(nextState);
  };

  // Full React-style setter with undo/redo tracking
const updateAnnotations: React.Dispatch<React.SetStateAction<AnnotationType[]>> = (value) => {
  console.log('[updateAnnotations] called', typeof value);
  if (typeof value === "function") {
    // callback form
    setAnnotations(prev => {
      const next = (value as (prev: AnnotationType[]) => AnnotationType[])(prev);
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setUndoStack((u) => [...u, prev]);
        setRedoStack([]);
      }
      return next;
    });
  } else {
    // direct array form
    setAnnotations(prev => {
      const next = value as AnnotationType[];
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setUndoStack((u) => [...u, prev]);
        setRedoStack([]);
      }
      return next;
    });
  }
};


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        modKey &&
        (e.key.toLowerCase() === "y" ||
          (e.shiftKey && e.key.toLowerCase() === "z"))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoStack, redoStack, annotations]);

  const toolbarTools: ToolbarTool[] = [
    {
      id: "move",
      isSelected: selectedTool === "move",
      icon: (
        <Move
          className={selectedTool === "move" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Move",
    },
    {
      id: "search",
      isSelected: selectedTool === "search",
      icon: (
        <Search
          className={selectedTool === "search" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Search",
    },
    {
      id: "marquee",
      isSelected: selectedTool === "marquee",
      icon: (
        <Maximize
          className={selectedTool === "marquee" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Marquee",
    },
    {
      id: "rectangle",
      isSelected: selectedTool === "rectangle",
      icon: (
        <Square
          className={selectedTool === "rectangle" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Rectangle",
    },
    {
      id: "line",
      isSelected: selectedTool === "line",
      icon: (
        <Minus
          className={selectedTool === "line" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Line",
    },
    {
      id: "brush",
      isSelected: selectedTool === "brush",
      icon: (
        <Brush
          className={selectedTool === "brush" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Brush",
    },
    {
      id: "skeleton",
      isSelected: selectedTool === "skeleton",
      icon: (
        <Wand2
          className={selectedTool === "skeleton" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Skeleton",
    },
    {
      id: "text",
      isSelected: selectedTool === "text",
      icon: (
        <Type
          className={selectedTool === "text" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Textbox",
    },
    {
      id: "eyedropper",
      isSelected: selectedTool === "eyedropper",
      icon: (
        <Pipette
          className={
            selectedTool === "eyedropper" ? "text-white" : "text-black"
          }
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Eyedropper",
    },
    {
      id: "pen",
      isSelected: selectedTool === "pen",
      icon: (
        <Pen
          className={selectedTool === "pen" ? "text-white" : "text-black"}
          strokeWidth={2.5}
          size={28}
        />
      ),
      label: "Pen",
    },
  ];

  const closeFile = (fileId: string) => {
    setActiveFiles((prev) => {
      const newFiles = prev.filter((file) => file.id !== fileId);
      if (newFiles.length > 0 && !newFiles.some((f) => f.isActive)) {
        newFiles[0].isActive = true;
      }
      return newFiles;
    });
  };

  const switchFile = (fileId: string) => {
    setActiveFiles((prev) =>
      prev.map((file) => ({ ...file, isActive: file.id === fileId }))
    );
  };

  const activeFile = activeFiles.find((file) => file.isActive);

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">
            Loading Project...
          </div>
          <div className="text-gray-500">
            Please wait while we load your annotation project.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Project
          </div>
          <div className="text-gray-500 mb-4">{error}</div>
          <button
            onClick={loadProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-900 mb-2">
            Project Not Found
          </div>
          <div className="text-gray-500">
            The requested project could not be found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen bg-white flex flex-col "
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <TopNav
        projectName={project.name}
        activeFiles={activeFiles}
        onSwitchFile={switchFile}
        onCloseFile={closeFile}
        onShowShareModal={() => setShowShareModal(true)}
        onShowExportModal={() => setShowExportModal(true)}
        onShowCreateModal={() => setShowCreateModal(true)}
        onShowOpenModal={() => setShowOpenModal(true)}
        onShowHelpModal={() => setShowHelpModal(true)}
        onCanvasZoom={handleCanvasZoom}
        onShowGrid={handleGrid}
        showGrid={showGrid}
        onAddImage={handleAddImage}
        tools={toolbarTools}
        onSelectTool={(toolId) => setSelectedTool(toolId)}
        others={others}
        cursorColors={CURSOR_COLORS}
        currentUser={
          user ? { username: user.username, email: user.email } : undefined
        }
        onSignOut={signout}
        onUndo={handleUndo} 
        onRedo={handleRedo} 
        canUndo={undoStack.length > 0}
  canRedo={redoStack.length > 0}
      />

      <div className="flex flex-1 relative" ref={containerRef}>
        <LeftToolbar
          tools={toolbarTools}
          selectedColor={selectedColor}
          onSelectColor={handleColorSelect}
          onSelectTool={handleToolSelect}
        />
        <CanvasArea
          zoomPercent={canvasZoom}
          onZoom={handleCanvasZoom}
          selectedTool={selectedTool}
          selectedColor={selectedColor}
          annotations={annotations}
          setAnnotations={updateAnnotations}
          currentAnnotation={currentAnnotation}
          setCurrentAnnotation={setCurrentAnnotation}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          selectedAnnotationId={selectedAnnotationId}
          setSelectedAnnotationId={setSelectedAnnotationId}
          projectImage={activeFile}
          onAnnotationCreated={saveAnnotationToDatabase}
          showGrid={showGrid}
          currentLabelId={currentLabelId}
          currentLabelName={labels.find(l => l._id === currentLabelId)?.name}
          labels={labels}
          onLabelAdvance={advanceToNextLabel}
        />
        <LabelPanel
          labels={labels}
          selectedLabelId={currentLabelId}
          onSelectLabel={handleLabelSelect}
          onManageLabels={() => setShowManageLabelsModal(true)}
        />

        {/* Other users' cursors */}
        {others.map(({ connectionId, presence }) => {
          if (!presence?.cursor) return null;

          const username = presence.userInfo?.name || "Anonymous User";
          const cursorColor =
            CURSOR_COLORS[connectionId % CURSOR_COLORS.length];

          return (
            <div
              key={`cursor-${connectionId}`}
              className="absolute pointer-events-none z-50"
            >
              <Cursor
                color={cursorColor}
                x={presence.cursor.x}
                y={presence.cursor.y}
              />
              {/* Figma-style name label */}
              <div
                className="absolute text-white text-xs px-2 py-1 rounded whitespace-nowrap font-medium"
                style={{
                  left: presence.cursor.x,
                  top: presence.cursor.y + 20,
                  backgroundColor: cursorColor,
                }}
              >
                {username}
              </div>
            </div>
          );
        })}
      </div>

      <ShareProject
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={project._id}
        projectName={project.name}
      />
      <Export
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectData={{
          id: project._id,
          name: project.name,
          annotations: allAnnotations
        }}
      />
      <CreateProject
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateProject={handleCreateProject}
      />
      <OpenProject
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        currentUserId={user?._id ?? ""}
      />
      <ManageLabels
        isOpen={showManageLabelsModal}
        onClose={() => setShowManageLabelsModal(false)}
        projectId={project._id}
        onLabelsChanged={handleLabelsChanged}
      />
      <Help
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Upload Loading Indicator */}
      {isUploadingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-gray-900 font-medium">
                Uploading image...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnnotationCanvas() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const roomId = projectId ? `annotation-${projectId}` : "annotation-default";

  if (!user) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-highlight mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-900">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        const token = localStorage.getItem("auth_token");

        console.log("Token from localStorage:", token);
        console.log("Room:", room);

        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again."
          );
        }

        const response = await fetch("/api/liveblocks/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ room }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Auth failed:", errorText);
          throw new Error("Failed to authenticate with Liveblocks");
        }

        return await response.json();
      }}
    >
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          userInfo: {
            name: user.username,
            email: user.email,
          },
        }}
        initialStorage={{
          annotationIds: new LiveList<string>([]),
        }}
      >
        <Annotation />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
