// server/src/routes/project.js
import express from 'express';
import { Project } from '../../models/projects.js';
import { Image } from '../../models/images.js';
import { User } from '../../models/users.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
const s3 = new S3Client({ region: process.env.AWS_REGION });

const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Projects route is working!' });
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

    // If includeDeleted is not explicitly set to true, exclude deleted projects
    if (includeDeleted !== 'true') {
      query.deletedAt = { $exists: false };
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

// Get a specific project
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('owner', 'username email')
      .populate('images')
      .populate('collaborators.user', 'username email');

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

    // Delete images from S3
    for (const image of project.images) {
      try {
        await s3.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: image.filename,
        }));
        console.log(`Deleted ${image.filename} from S3`);
      } catch (err) {
        console.error(`Failed to delete ${image.filename} from S3`, err);
      }
    }

    // Delete images from DB
    await Image.deleteMany({ projectId });

    // Delete project itself
    await Project.findByIdAndDelete(projectId);

    res.json({ message: 'Project permanently deleted from DB and S3' });
  } catch (error) {
    console.error('Error permanently deleting project:', error);
    res.status(500).json({ error: 'Failed to permanently delete project' });
  }
});

export default router;