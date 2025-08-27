// server/src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Add this to load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const uploadRoutes = require('./routes/upload');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'], // Your React app URL
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images if needed
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/upload', uploadRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is connected!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test upload: http://localhost:${PORT}/api/upload/test`);
  
  // Log AWS configuration (without secrets)
  console.log('📡 AWS Configuration:');
  console.log(`  Region: ${process.env.AWS_REGION || 'ap-southeast-2'}`);
  console.log(`  Bucket: ${process.env.S3_BUCKET_NAME || 'orninote'}`);
  console.log(`  Access Key: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`  Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
});