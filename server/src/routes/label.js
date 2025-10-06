import express from 'express';
import { Label } from '../../models/labels.js';
import { Project } from '../../models/projects.js';

const router = express.Router();

// Create label for project
router.post('/', async (req, res) => {
  try {
    const { projectId, name, colour } = req.body;

    // Validate required fields
    if (!projectId || !name || !colour) {
      return res.status(400).json({
        error: 'projectId, name, and colour are required'
      });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        error: 'Project not found'
      });
    }

    // Check if label with same name already exists for this project
    const existingLabel = await Label.findOne({ projectId, name });
    if (existingLabel) {
      return res.status(400).json({
        error: 'A label with this name already exists in this project'
      });
    }

    // Create label
    const label = new Label({
      projectId,
      name,
      colour
    });

    const savedLabel = await label.save();

    console.log('Label created successfully:', {
      id: savedLabel._id,
      name: savedLabel.name,
      projectId: savedLabel.projectId
    });

    res.status(201).json({
      message: 'Label created successfully',
      label: savedLabel
    });

  } catch (error) {
    console.error('Error creating label:', error);
    res.status(500).json({
      error: 'Failed to create label',
      message: error.message
    });
  }
});

// Get all labels for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const labels = await Label.find({ projectId }).sort({ createdAt: 1 });

    res.json({
      count: labels.length,
      labels
    });

  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({
      error: 'Failed to fetch labels',
      message: error.message
    });
  }
});

// Get single label by ID
router.get('/:labelId', async (req, res) => {
  try {
    const { labelId } = req.params;

    const label = await Label.findById(labelId);

    if (!label) {
      return res.status(404).json({
        error: 'Label not found'
      });
    }

    res.json({
      label
    });

  } catch (error) {
    console.error('Error fetching label:', error);
    res.status(500).json({
      error: 'Failed to fetch label',
      message: error.message
    });
  }
});

// Update label
router.put('/:labelId', async (req, res) => {
  try {
    const { labelId } = req.params;
    const { name, colour } = req.body;

    const label = await Label.findById(labelId);
    if (!label) {
      return res.status(404).json({
        error: 'Label not found'
      });
    }

    // Check for duplicate name in same project (if name is being changed)
    if (name && name !== label.name) {
      const existingLabel = await Label.findOne({ 
        projectId: label.projectId, 
        name,
        _id: { $ne: labelId }
      });
      if (existingLabel) {
        return res.status(400).json({
          error: 'A label with this name already exists in this project'
        });
      }
    }

    // Update fields
    if (name !== undefined) label.name = name;
    if (colour !== undefined) label.colour = colour;

    const updatedLabel = await label.save();

    res.json({
      message: 'Label updated successfully',
      label: updatedLabel
    });

  } catch (error) {
    console.error('Error updating label:', error);
    res.status(500).json({
      error: 'Failed to update label',
      message: error.message
    });
  }
});

// Delete label
router.delete('/:labelId', async (req, res) => {
  try {
    const { labelId } = req.params;

    const label = await Label.findByIdAndDelete(labelId);
    
    if (!label) {
      return res.status(404).json({
        error: 'Label not found'
      });
    }

    console.log('Label deleted successfully:', labelId);

    res.json({
      message: 'Label deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting label:', error);
    res.status(500).json({
      error: 'Failed to delete label',
      message: error.message
    });
  }
});

export default router;