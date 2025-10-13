import express from "express";
import { Image } from "../../models/images.js";


const router = express.Router();

// Get a specific image
router.get('/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await Image.findById(imageId)

    if (!image) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    res.json({
      image
    });

  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({
      error: 'Failed to fetch image',
      message: error.message
    });
  }
});

export default router;