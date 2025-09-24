// server/src/routes/upload.js
import express from 'express';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
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

    if (!fileName || !fileType) {
      return res.status(400).json({
        error: 'fileName and fileType are required',
      });
    }

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

    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueKey = `projects/${uuidv4()}-${Date.now()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueKey,
      ContentType: fileType,
    });

    console.log('Creating presigned URL with params:', {
      bucket: BUCKET_NAME,
      key: uniqueKey,
      contentType: fileType,
      region: process.env.AWS_REGION || 'ap-southeast-2'
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    const imageUrl = CLOUDFRONT_DOMAIN
      ? `${CLOUDFRONT_DOMAIN}/${uniqueKey}`
      : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-southeast-2'}.amazonaws.com/${uniqueKey}`;

    console.log('Generated presigned URL for:', fileName);

    res.json({
      uploadUrl,
      imageUrl,
      key: uniqueKey,
    });

  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({
      error: 'Failed to generate upload URL',
      details: error.message
    });
  }
});

// GET /api/upload/test
router.get('/test', async (req, res) => {
  try {
    const testKey = `test/${Date.now()}.txt`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testKey,
      ContentType: 'text/plain',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    res.json({
      success: true,
      message: 'S3 connection successful!',
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION || 'ap-southeast-2',
    });

  } catch (error) {
    console.error('S3 test failed:', error);
    res.status(500).json({
      success: false,
      error: 'S3 connection failed',
      details: error.message
    });
  }
});

export default router;