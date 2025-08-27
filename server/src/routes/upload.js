// server/src/routes/upload.js
const express = require('express');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2', // Make sure this matches your bucket region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

// POST /api/upload/presigned-url
router.post('/presigned-url', async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    // Validate input
    if (!fileName || !fileType) {
      return res.status(400).json({
        error: 'fileName and fileType are required',
      });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        error: 'Invalid file type. Only images are allowed.',
      });
    }

    // Generate unique key
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueKey = `projects/${uuidv4()}-${Date.now()}.${fileExtension}`;

    // Create the put object command - REMOVED ACL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueKey,
      ContentType: fileType,
      // ACL: 'public-read', // REMOVED - This causes 403 errors if bucket doesn't allow ACLs
    });

    console.log('Creating presigned URL with params:', {
      bucket: BUCKET_NAME,
      key: uniqueKey,
      contentType: fileType,
      region: process.env.AWS_REGION || 'ap-southeast-2'
    });

    // Generate pre-signed URL
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Generate the final image URL
    const imageUrl = CLOUDFRONT_DOMAIN
      ? `${CLOUDFRONT_DOMAIN}/${uniqueKey}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${uniqueKey}`;

    console.log('✅ Generated presigned URL for:', fileName);
    console.log('📍 Upload URL domain:', uploadUrl.split('?')[0]);
    console.log('🖼️  Final image URL:', imageUrl);

    res.json({
      uploadUrl,
      imageUrl,
      key: uniqueKey,
    });

  } catch (error) {
    console.error('❌ Error generating pre-signed URL:', error);
    res.status(500).json({
      error: 'Failed to generate upload URL',
      details: error.message
    });
  }
});

// DELETE /api/upload/image/:key - Fixed to use DeleteObjectCommand
router.delete('/image/:key(*)', async (req, res) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({
        error: 'Image key is required',
      });
    }

    // Use DeleteObjectCommand instead of PutObjectCommand
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log('✅ Deleted image:', key);

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });

  } catch (error) {
    console.error('❌ Error deleting image:', error);
    res.status(500).json({
      error: 'Failed to delete image',
      details: error.message
    });
  }
});

// GET /api/upload/test - Test route to verify S3 connection
router.get('/test', async (req, res) => {
  try {
    // Try to create a presigned URL to test connection
    const testKey = `test/${Date.now()}.txt`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      ContentType: 'text/plain',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    res.json({
      success: true,
      message: 'S3 connection successful! ✅',
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION || 'ap-southeast-2',
      testPresignedUrl: url.split('?')[0] + '?[PARAMS_HIDDEN]' // Hide params for security
    });

  } catch (error) {
    console.error('❌ S3 test failed:', error);
    res.status(500).json({
      success: false,
      error: 'S3 connection failed',
      details: error.message
    });
  }
});

// GET /api/upload/debug - Debug route to check configuration
router.get('/debug', (req, res) => {
  res.json({
    bucket: BUCKET_NAME || 'NOT_SET',
    region: process.env.AWS_REGION || 'ap-southeast-2',
    cloudfront: CLOUDFRONT_DOMAIN || 'NOT_SET',
    accessKeySet: !!process.env.AWS_ACCESS_KEY_ID,
    secretKeySet: !!process.env.AWS_SECRET_ACCESS_KEY,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;