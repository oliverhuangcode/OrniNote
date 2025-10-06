import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectToDB from '../config/db.js';
import { User } from '../models/users.js';

// Import route handlers
import uploadRoutes from './routes/upload.js';
import projectRoutes from './routes/project.js';
import inviteRoutes from './routes/invite.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Requested-With'
  ],
}));

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is connected!',
    timestamp: new Date().toISOString()
  });
});

// Test user creation endpoint
app.post('/api/test-user', async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      username: "testingglobalorninoteaccount"
    });

    if (existingUser) {
      return res.json({
        message: 'Test user already exists',
        user: existingUser
      });
    }

    const user1 = new User({
      username: "testingglobalorninoteaccount2",
      password: "orninote2",
      email: "orninote2@gmail.com"
    });

    const savedUser = await user1.save();
    console.log('User created:', savedUser);

    res.json({
      message: 'Test user created successfully',
      user: savedUser
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({
      error: 'Failed to create test user',
      message: error.message
    });
  }
});

// API Routes (BEFORE error handlers)
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invite', inviteRoutes);

// Error handling middleware (AFTER all routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 404 handler (LAST)
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

async function testUserCreation() {
  try {
    console.log('\n📝 Testing user creation...');

    // Check if user already exists first
    const existingUser = await User.findOne({
      username: "checkingcombined"
    });

    if (existingUser) {
      console.log('ℹ️  Test user already exists:', existingUser.username);
      return;
    }

    const user1 = new User({
      username: "checkingcombined",
      password: "combined",
      email: "comb@gmail.com"
    });

    const savedUser = await user1.save();
    console.log('✅ User created:', {
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      createdAt: savedUser.createdAt
    });
  } catch (error) {
    console.error('❌ User creation failed:', error.message);
  }
}

// Start server with database connection
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectToDB();
    console.log('✓ Database connected successfully');

    // Then start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
      console.log(`Projects API: http://localhost:${PORT}/api/projects`);
      console.log(`Test user creation: http://localhost:${PORT}/api/test-user (POST)`);
      console.log('AWS Configuration:');
      console.log(` Region: ${process.env.AWS_REGION || 'ap-southeast-2'}`);
      console.log(` Bucket: ${process.env.S3_BUCKET_NAME || 'orninote'}`);
      console.log(` Access Key: ${process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing'}`);
      console.log(` Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
