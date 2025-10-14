import { useState, useEffect } from "react";
import { useStorage, useMutation } from "@liveblocks/react";
import { annotationService } from "../../../services/annotationService";
import { imageService } from "../../../services/imageService";
import { Annotation as AnnotationType } from "../types";
import { ShapeData } from "../../../services/annotationService";

export const useAnnotations = (projectId: string | undefined, currentImageId: string | null, user: any) => {
  const [annotations, setAnnotations] = useState<AnnotationType[]>([]);
  const [allAnnotations, setAllAnnotations] = useState<AnnotationType[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<AnnotationType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);

  // Liveblocks storage for syncing annotation IDs
  const annotationIds = useStorage((root) => root.annotationIds);

  // Mutation to add annotation ID to Liveblocks
  const addAnnotationId = useMutation(({ storage }, id: string) => {
    const ids = storage.get("annotationIds");
    if (!ids.toArray().includes(id)) {
      ids.push(id);
    }
  }, []);

  // Load all annotations within a project
  const loadAnnotationsForProject = async (projectId: string) => {
    try {
      const images = await imageService.getImagesByProject(projectId);
      console.log(`Found ${images.length} images in project.`);
      
      const annotationPromises = images.map(async (image: any) => {
        const fetchedAnnotations = await annotationService.getAnnotationsForImage(image._id);

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

      const results = await Promise.all(annotationPromises);
      const allAnnotations = results.flat();
      console.log(`Total annotations loaded: ${allAnnotations.length}`);
      
      setAllAnnotations(allAnnotations);
      
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  };

  // Load annotations from database for current image
  const loadAnnotationsForImage = async (imageId: string) => {
    try {
      console.log("Loading annotations for image:", imageId);
      const fetchedAnnotations = await annotationService.getAnnotationsForImage(imageId);

      const convertedAnnotations: AnnotationType[] = fetchedAnnotations.map((ann) => {
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
          properties.points = ann.shapeData.coordinates.points.map((p: number[]) => ({
            x: p[0],
            y: p[1],
          }));
        } else if (ann.shapeData.type === "text") {
          properties.position = {
            x: ann.shapeData.coordinates.x,
            y: ann.shapeData.coordinates.y,
          };
          if (ann.shapeData.coordinates.text) {
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
          labelId: ann.labelId._id, // Set at root level
          labelName: ann.labelId.name, // Set at root level
          createdBy: ann.createdBy._id, // Set at root level
          properties: properties,
        } as AnnotationType;
      });
      
      setAnnotations(convertedAnnotations);
      console.log(`Loaded ${convertedAnnotations.length} annotations`);
    } catch (error) {
      console.error("Failed to load annotations:", error);
    }
  };

  // Extract coordinate extraction logic
  const extractCoordinates = (annotation: AnnotationType) => {
    let coordinates: any;

    if (annotation.type === "rectangle" && annotation.properties.position) {
      coordinates = {
        x: annotation.properties.position.x,
        y: annotation.properties.position.y,
        width: annotation.properties.width || 0,
        height: annotation.properties.height || 0,
      };
    } else if (annotation.type === "polygon" && annotation.properties.points) {
      coordinates = {
        points: annotation.properties.points.map((p: any) => [p.x, p.y]),
      };
    } else if (annotation.type === "line" && annotation.properties.points) {
      coordinates = {
        points: annotation.properties.points.map((p: any) => [p.x, p.y]),
      };
    } else if ((annotation.type === "path" || annotation.type === "brush") && annotation.properties.points) {
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
        points: (annotation.properties.skeletonPoints || []).map((p: any) => ({
          x: p.x,
          y: p.y,
          labelId: p.labelId,
          labelName: p.labelName,
          color: p.color
        })),
        edges: (annotation.properties.skeletonEdges || []).map((e: any) => ({
          from: e.from,
          to: e.to,
          labelId: e.labelId,
          labelName: e.labelName,
          color: e.color
        }))
      };
    } else {
      throw new Error(`Unknown annotation type or missing properties: ${annotation.type}`);
    }

    return coordinates;
  };

  // Extract validation logic
  const validateAnnotationCreation = (currentImageId: string, currentLabelId: string | null, user: any) => {
    if (!currentImageId || !currentLabelId) {
      throw new Error('Please select a label before creating annotations. Click "Manage Labels" to create labels first.');
    }

    if (!user) {
      throw new Error("You must be logged in to create annotations");
    }
  };

  // Extract update logic
  const updateExistingAnnotation = async (annotation: AnnotationType) => {
    const coordinates = extractCoordinates(annotation);
    
    const shapeData = {
      type: annotation.type,
      coordinates,
      isNormalised: false,
    };

    const updateData: { shapeData?: ShapeData; labelId?: string } = { shapeData };
    
    if (annotation.labelId) {
      updateData.labelId = annotation.labelId;
    }

    await annotationService.updateAnnotation(annotation.id, updateData);
    console.log("Annotation updated in database:", annotation.id);
  };

  // Extract creation logic
  const createNewAnnotation = async (
    annotation: AnnotationType, 
    currentImageId: string, 
    currentLabelId: string, 
    user: any
  ) => {
    const coordinates = extractCoordinates(annotation);
    
    const shapeData = {
      type: annotation.type,
      coordinates,
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

    // Update local state - replace the temporary UUID with the real MongoDB ID
    setAnnotations((prev) =>
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
  };

  // Main function - now much cleaner!
  const saveAnnotationToDatabase = async (
    annotation: AnnotationType, 
    currentImageId: string, 
    currentLabelId: string | null, 
    user: any
  ) => {
    try {
      const isExistingAnnotation = annotation.id && /^[0-9a-fA-F]{24}$/.test(annotation.id);
      
      if (isExistingAnnotation) {
        console.log("Updating existing annotation:", annotation.id);
        await updateExistingAnnotation(annotation);
      } else {
        console.log("Creating new annotation with temporary ID:", annotation.id);
        validateAnnotationCreation(currentImageId, currentLabelId, user);
        await createNewAnnotation(annotation, currentImageId, currentLabelId!, user);
      }
    } catch (error) {
      console.error("Failed to save annotation:", error);
      
      // Handle errors appropriately
      if (error instanceof Error) {
        if (error.message.includes("select a label") || error.message.includes("logged in")) {
          alert(error.message);
          setAnnotations((prev) => prev.filter((ann) => ann.id !== annotation.id));
        }
      }
    }
  };

  const updateAnnotationInDatabase = async (annotation: AnnotationType) => {
  try {
    if (!user) {
      console.error("Cannot update: No user logged in");
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
    } else if (annotation.type === "polygon" && annotation.properties.points) {
      // Convert {x, y} objects to [x, y] arrays
      coordinates = {
        points: annotation.properties.points.map((p: any) => [p.x, p.y]),
      };
    } else if (annotation.type === "line" && annotation.properties.points) {
      // Convert {x, y} objects to [x, y] arrays
      coordinates = {
        points: annotation.properties.points.map((p: any) => [p.x, p.y]),
      };
    } else if ((annotation.type === "path" || annotation.type === "brush") && annotation.properties.points) {
      // Convert {x, y} objects to [x, y] arrays
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
      // Convert skeleton points format
      coordinates = {
        points: (annotation.properties.skeletonPoints || []).map((p: any) => ({
          x: p.x,
          y: p.y,
          labelId: p.labelId,
          labelName: p.labelName,
          color: p.color
        })),
        edges: (annotation.properties.skeletonEdges || []).map((e: any) => ({
          from: e.from,
          to: e.to,
          labelId: e.labelId,
          labelName: e.labelName,
          color: e.color
        }))
      };
    } else {
      console.warn("Unknown annotation type or missing properties:", annotation);
      return;
    }

    const shapeData = {
      type: annotation.type,
      coordinates: coordinates,
      isNormalised: false,
    };

    // Use the correct API signature
    const updateData: { shapeData?: ShapeData; labelId?: string } = {
      shapeData,
    };

    // Only include labelId if it exists
    if (annotation.labelId) {
      updateData.labelId = annotation.labelId;
    }

    await annotationService.updateAnnotation(annotation.id, updateData);

    console.log("Annotation updated in database:", annotation.id);
  } catch (error) {
    console.error("Failed to update annotation:", error);
  }
};

  // Watch for changes in annotationIds and reload annotations
  useEffect(() => {
    if (annotationIds && currentImageId) {
      console.log("Annotation IDs changed, reloading annotations...");
      loadAnnotationsForImage(currentImageId);
    }
  }, [annotationIds?.length, currentImageId]);

  // Load annotations when currentImageId changes
  useEffect(() => {
    if (currentImageId) {
      loadAnnotationsForImage(currentImageId);
    }
  }, [currentImageId]);

  // Load project annotations when projectId changes
  useEffect(() => {
    if (projectId) {
      loadAnnotationsForProject(projectId);
    }
  }, [projectId]);

  return {
    annotations,
    setAnnotations,
    allAnnotations,
    currentAnnotation,
    setCurrentAnnotation,
    isDrawing,
    setIsDrawing,
    selectedAnnotationId,
    setSelectedAnnotationId,
    saveAnnotationToDatabase,
    loadAnnotationsForImage,
    loadAnnotationsForProject,
    updateAnnotationInDatabase,
  };
};