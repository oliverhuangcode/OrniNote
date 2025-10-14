import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { projectService } from "../../../services/projectService";
import { imageService } from "../../../services/imageService";
import { s3UploadService } from "../../../services/s3UploadService";
import { ActiveFile, ImageData } from "../types";
import type { Project } from "../types";

export const useProject = () => {
  const { id: projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFiles, setActiveFiles] = useState<ActiveFile[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

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
        setCurrentImageId(projectData.images[0]._id);
      } else {
        setActiveFiles([]);
        setCurrentImageId(null);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml,application/zip,.zip";
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
          const extractedImages = await s3UploadService.extractImagesFromZip(zipFile);
          imageFiles.push(...extractedImages);
          console.log(`Extracted ${extractedImages.length} images from ${zipFile.name}`);
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
          if (!file.type.startsWith("image/") && !validTypes.includes(file.type)) {
            alert(`Invalid file type: ${file.name} (${file.type}). Please upload only image files.`);
            return;
          }
        }

        console.log(`Uploading ${imageFiles.length} images...`);

        const uploadResults = await s3UploadService.uploadMultipleImages(
          imageFiles,
          (fileIndex, fileName, progress) => {
            console.log(`Uploading ${fileName} (${fileIndex + 1}/${imageFiles.length}): ${progress.toFixed(1)}%`);
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
          const updatedProject = await projectService.batchAddImagesToProject(projectId, imagesData);
          setProject(updatedProject);

          const newImages = updatedProject.images.slice(-imagesData.length);
          const newActiveFiles: ActiveFile[] = newImages.map((image, index) => ({
            id: image._id,
            name: image.filename,
            isActive: index === 0,
            imageUrl: image.url,
            width: image.width,
            height: image.height,
          }));

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

  const closeFile = (fileId: string) => {
    setActiveFiles((prev) => {
      const newFiles = prev.filter((file) => file.id !== fileId);
      if (newFiles.length > 0 && !newFiles.some((f) => f.isActive)) {
        newFiles[0].isActive = true;
        setCurrentImageId(newFiles[0].id);
      }
      return newFiles;
    });
  };

  const switchFile = (fileId: string) => {
    setActiveFiles((prev) =>
      prev.map((file) => {
        if (file.id === fileId) {
          setCurrentImageId(fileId);
          return { ...file, isActive: true };
        }
        return { ...file, isActive: false };
      })
    );
  };

  const activeFile = activeFiles.find((file) => file.isActive);

  // Update currentImageId when active files change
  useEffect(() => {
    const activeFile = activeFiles.find((file) => file.isActive);
    if (activeFile && activeFile.id !== currentImageId) {
      setCurrentImageId(activeFile.id);
    }
  }, [activeFiles]);

  return {
    project,
    loading,
    error,
    activeFiles,
    isUploadingImage,
    currentImageId,
    loadProject,
    handleAddImage,
    closeFile,
    switchFile,
    activeFile,
  };
};