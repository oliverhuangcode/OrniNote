import express from "express";
import { Project } from "../../models/projects.js";
import { Image } from '../../models/images.js';
import { User } from '../../models/users.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';


const router = express.Router();
const s3 = new S3Client({ region: process.env.AWS_REGION });


// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Projects route is working!' });
});

// Get a specific project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('owner', 'username email')
      .populate('images')
      .populate('collaborators.user', 'username email')
      .populate("invites");

    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    res.json({
      project
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      error: 'Failed to fetch project',
      message: error.message
    });
  }
});

// Update collaborator role
router.patch("/:projectId/collaborators/:memberId", async (req, res) => {
    try {
        const { projectId, memberId } = req.params;
        const { role } = req.body;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const collaborator = project.collaborators.find(
            (c) => c.user.toString() === memberId
        );

        if (!collaborator) {
            return res.status(404).json({ success: false, message: "Collaborator not found" });
        }

        collaborator.role = role;
        await project.save();

        res.json({ success: true, message: "Role updated", project });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update role" });
    }
});

// Create a new project with image
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      description = '', 
      imageUrl, 
      imageFilename,
      imageWidth,
      imageHeight,
      ownerId
    } = req.body;

    // Validate required fields
    if (!name || !imageUrl || !ownerId) {
      return res.status(400).json({
        error: 'Name, image URL, and owner ID are required'
      });
    }

    // Verify owner exists
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        error: 'Owner not found'
      });
    }

    // Create the project
    const project = new Project({
      name,
      description,
      owner: ownerId,
      collaborators: [{
        user: ownerId,
        role: 'Owner'
      }]
    });

    const savedProject = await project.save();

    // Create the image record
    const image = new Image({
      projectId: savedProject._id,
      filename: imageFilename || 'uploaded-image.jpg',
      url: imageUrl,
      width: imageWidth || 800,
      height: imageHeight || 600
    });

    const savedImage = await image.save();

    // Add image reference to project
    savedProject.images.push(savedImage._id);
    await savedProject.save();

    // Populate the response
    const populatedProject = await Project.findById(savedProject._id)
      .populate('owner', 'username email')
      .populate('images')
      .populate('collaborators.user', 'username email');

    console.log('Project created successfully:', {
      id: savedProject._id,
      name: savedProject.name,
      imageCount: savedProject.images.length
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: error.message
    });
  }
});

// Get projects for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { includeDeleted } = req.query; // Optional query parameter

    let query = {
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ]
    };

    // Filter based on deletedAt status
    if (includeDeleted === 'true') {
      // Return only deleted projects (deletedAt is not null)
      query.deletedAt = { $ne: null };
    } else if (includeDeleted === 'all') {
      // Return all projects (no deletedAt filter)
      // Don't add any deletedAt filter
    } else {
      // Default: return only non-deleted projects (deletedAt is null)
      query.deletedAt = null;
    }

    const projects = await Project.find(query)
      .populate('owner', 'username email')
      .populate('images')
      .populate('collaborators.user', 'username email')
      .sort({ updatedAt: -1 });

    res.json({
      projects
    });

  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: error.message
    });
  }
});


// Update project
router.put('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Update fields
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    const updatedProject = await project.save();

    // Populate the response
    const populatedProject = await Project.findById(updatedProject._id)
      .populate('owner', 'username email')
      .populate('images')
      .populate('collaborators.user', 'username email');

    res.json({
      message: 'Project updated successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      error: 'Failed to update project',
      message: error.message
    });
  }
});

// Delete project (soft delete)
router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }
    
    project.deletedAt = new Date();
    await project.save();
    
    console.log('Project soft deleted successfully:', projectId);
    
    res.json({
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      error: 'Failed to delete project',
      message: error.message
    });
  }
});

// Restore project
router.put('/:projectId/restore', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }
    
    project.deletedAt = null;
    await project.save();
    
    console.log('Project restored successfully:', projectId);
    
    res.json({
      message: 'Project restored successfully',
      project: project
    });
  } catch (error) {
    console.error('Error restoring project:', error);
    res.status(500).json({
      error: 'Failed to restore project',
      message: error.message
    });
  }
});

// Permanent delete
router.delete('/:projectId/permanent', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch project with images
    const project = await Project.findById(projectId).populate('images');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if project is soft-deleted first
    // Only allow permanent delete if deletedAt is not null
    if (!project.deletedAt) {
      return res.status(400).json({ 
        error: 'Project must be soft-deleted first before permanent deletion' 
      });
    }

    // Delete images from S3
    const s3DeletePromises = project.images.map(async (image) => {
      try {
        // Extract the S3 key from the URL
        // Assuming URL format: https://bucket-name.s3.region.amazonaws.com/filename
        const filename = image.filename || image.url.split('/').pop();
        
        // Extract the S3 key from the URL
        let s3Key = image.filename;
        
        if (image.url) {
          // Handle CloudFront URLs
          if (image.url.includes('cloudfront.net/')) {
            s3Key = image.url.split('cloudfront.net/')[1];
          }
          // Handle S3 direct URLs
          else if (image.url.includes('.s3.') && image.url.includes('.amazonaws.com/')) {
            s3Key = image.url.split('.amazonaws.com/')[1];
          }
        }
        
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,  
          Key: s3Key,
        }));
        console.log(`Deleted ${filename} from S3`);
      } catch (err) {
        console.error(`Failed to delete ${image.filename} from S3:`, err);
        // Continue even if S3 delete fails
      }
    });

    // Wait for all S3 deletions to complete
    await Promise.all(s3DeletePromises);

    // Delete images from MongoDB
    await Image.deleteMany({ projectId });
    console.log(`Deleted ${project.images.length} images from MongoDB for project ${projectId}`);

    // Delete project itself from MongoDB
    await Project.findByIdAndDelete(projectId);
    console.log(`Permanently deleted project ${projectId} from MongoDB`);

    res.json({ 
      message: 'Project and associated images permanently deleted from MongoDB and S3',
      deletedImages: project.images.length
    });
  } catch (error) {
    console.error('Error permanently deleting project:', error);
    res.status(500).json({ 
      error: 'Failed to permanently delete project',
      message: error.message 
    });
  }
});

// Add image to existing project
router.post('/:projectId/images', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      imageUrl, 
      imageFilename,
      imageWidth,
      imageHeight
    } = req.body;

    // Validate required fields
    if (!imageUrl) {
      return res.status(400).json({
        error: 'Image URL is required'
      });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Create the image record
    const image = new Image({
      projectId: projectId,
      filename: imageFilename || 'uploaded-image.jpg',
      url: imageUrl,
      width: imageWidth || 800,
      height: imageHeight || 600
    });

    const savedImage = await image.save();

    // Add image reference to project
    project.images.push(savedImage._id);
    await project.save();

    // Populate the updated project
    const populatedProject = await Project.findById(projectId)
      .populate('owner', 'username email')
      .populate('images')
      .populate('collaborators.user', 'username email');

    console.log('Image added to project successfully:', {
      projectId: projectId,
      imageId: savedImage._id,
      filename: savedImage.filename
    });

    res.status(201).json({
      message: 'Image added to project successfully',
      image: savedImage,
      project: populatedProject
    });

  } catch (error) {
    console.error('Error adding image to project:', error);
    res.status(500).json({
      error: 'Failed to add image to project',
      message: error.message
    });
  }
});

// Batch add multiple images to existing project
router.post('/:projectId/images/batch', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { images } = req.body; // Array of image objects

    // Validate required fields
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        error: 'Images array is required and must not be empty'
      });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Create all image records
    const createdImages = [];
    for (const imageData of images) {
      const { imageUrl, imageFilename, imageWidth, imageHeight } = imageData;

      if (!imageUrl) {
        console.warn('Skipping image without URL:', imageFilename);
        continue;
      }

      const image = new Image({
        projectId: projectId,
        filename: imageFilename || 'uploaded-image.jpg',
        url: imageUrl,
        width: imageWidth || 1920,
        height: imageHeight || 1080
      });

      const savedImage = await image.save();
      createdImages.push(savedImage);
    }

    // Add all image IDs to project
    project.images.push(...createdImages.map(img => img._id));
    await project.save();

    // Populate and return updated project
    const updatedProject = await Project.findById(projectId)
      .populate('owner', 'username email')
      .populate('collaborators.user', 'username email')
      .populate('images');

    res.status(201).json({
      message: `Successfully added ${createdImages.length} images`,
      project: updatedProject,
      addedImages: createdImages
    });
  } catch (error) {
    console.error('Error batch adding images to project:', error);
    res.status(500).json({
      error: 'Failed to batch add images',
      message: error.message
    });
  }
});

export default router;