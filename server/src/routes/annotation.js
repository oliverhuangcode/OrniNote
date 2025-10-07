import express from 'express';
import { Annotation } from '../../models/annotations.js';
import { Image } from '../../models/images.js';
import { Label } from '../../models/labels.js';

const router = express.Router();

// Create new annotation
router.post('/', async (req, res) => {
  try {
    const { imageId, labelId, createdBy, shapeData } = req.body;

    // Validate required fields
    if (!imageId || !labelId || !createdBy || !shapeData) {
      return res.status(400).json({
        error: 'imageId, labelId, createdBy, and shapeData are required'
      });
    }

    // Verify image exists
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    // Verify label exists
    const label = await Label.findById(labelId);
    if (!label) {
      return res.status(404).json({
        error: 'Label not found'
      });
    }

    // Create annotation
    const annotation = new Annotation({
      imageId,
      labelId,
      createdBy,
      shapeData
    });

    const savedAnnotation = await annotation.save();

    // Populate references
    const populatedAnnotation = await Annotation.findById(savedAnnotation._id)
      .populate('labelId', 'name colour')
      .populate('createdBy', 'username email');

    console.log('Annotation created successfully:', {
      id: savedAnnotation._id,
      type: shapeData.type,
      area: savedAnnotation.area
    });

    res.status(201).json({
      message: 'Annotation created successfully',
      annotation: populatedAnnotation
    });

  } catch (error) {
    console.error('Error creating annotation:', error);
    res.status(500).json({
      error: 'Failed to create annotation',
      message: error.message
    });
  }
});

// Get all annotations for an image
router.get('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const annotations = await Annotation.find({ imageId })
      .populate('labelId', 'name colour')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      count: annotations.length,
      annotations
    });

  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({
      error: 'Failed to fetch annotations',
      message: error.message
    });
  }
});

// Get all annotations by label
router.get('/label/:labelId', async (req, res) => {
  try {
    const { labelId } = req.params;

    const annotations = await Annotation.find({ labelId })
      .populate('imageId', 'filename url')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      count: annotations.length,
      annotations
    });

  } catch (error) {
    console.error('Error fetching annotations by label:', error);
    res.status(500).json({
      error: 'Failed to fetch annotations',
      message: error.message
    });
  }
});

// Get all annotations by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const annotations = await Annotation.find({ createdBy: userId })
      .populate('imageId', 'filename url')
      .populate('labelId', 'name colour')
      .sort({ createdAt: -1 });

    res.json({
      count: annotations.length,
      annotations
    });

  } catch (error) {
    console.error('Error fetching user annotations:', error);
    res.status(500).json({
      error: 'Failed to fetch annotations',
      message: error.message
    });
  }
});

// Get single annotation by ID
router.get('/:annotationId', async (req, res) => {
  try {
    const { annotationId } = req.params;

    const annotation = await Annotation.findById(annotationId)
      .populate('imageId', 'filename url width height')
      .populate('labelId', 'name colour')
      .populate('createdBy', 'username email');

    if (!annotation) {
      return res.status(404).json({
        error: 'Annotation not found'
      });
    }

    res.json({
      annotation
    });

  } catch (error) {
    console.error('Error fetching annotation:', error);
    res.status(500).json({
      error: 'Failed to fetch annotation',
      message: error.message
    });
  }
});

// Update annotation
router.put('/:annotationId', async (req, res) => {
  try {
    const { annotationId } = req.params;
    const { shapeData, labelId } = req.body;

    const annotation = await Annotation.findById(annotationId);
    if (!annotation) {
      return res.status(404).json({
        error: 'Annotation not found'
      });
    }

    // Update fields
    if (shapeData !== undefined) {
      annotation.shapeData = shapeData;
    }
    if (labelId !== undefined) {
      // Verify new label exists
      const label = await Label.findById(labelId);
      if (!label) {
        return res.status(404).json({
          error: 'Label not found'
        });
      }
      annotation.labelId = labelId;
    }

    const updatedAnnotation = await annotation.save();

    // Populate the response
    const populatedAnnotation = await Annotation.findById(updatedAnnotation._id)
      .populate('labelId', 'name colour')
      .populate('createdBy', 'username email');

    res.json({
      message: 'Annotation updated successfully',
      annotation: populatedAnnotation
    });

  } catch (error) {
    console.error('Error updating annotation:', error);
    res.status(500).json({
      error: 'Failed to update annotation',
      message: error.message
    });
  }
});

// Delete annotation
router.delete('/:annotationId', async (req, res) => {
  try {
    const { annotationId } = req.params;

    const annotation = await Annotation.findByIdAndDelete(annotationId);
    
    if (!annotation) {
      return res.status(404).json({
        error: 'Annotation not found'
      });
    }

    console.log('Annotation deleted successfully:', annotationId);

    res.json({
      message: 'Annotation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({
      error: 'Failed to delete annotation',
      message: error.message
    });
  }
});

// Delete all annotations for an image
router.delete('/image/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const result = await Annotation.deleteMany({ imageId });

    console.log(`Deleted ${result.deletedCount} annotations for image:`, imageId);

    res.json({
      message: `Deleted ${result.deletedCount} annotations successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting annotations:', error);
    res.status(500).json({
      error: 'Failed to delete annotations',
      message: error.message
    });
  }
});

export default router;