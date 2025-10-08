import express from 'express';
import { Liveblocks } from '@liveblocks/node';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

router.post('/auth', authenticate, async (req, res) => {
  try {
    const { room } = req.body;
    const user = req.user;
    
    console.log('Auth request - User:', user._id, 'Room:', room);
    
    // Prepare session
    const session = liveblocks.prepareSession(
      user._id.toString(),
      {
        userInfo: {
          name: user.username,
          email: user.email,
        },
      }
    );
    
    // Grant access - try both the specific room AND a wildcard pattern
    if (room) {
      // Allow access to the specific room requested
      session.allow(room, session.FULL_ACCESS);
    }
    
    // Also allow wildcard access to all annotation rooms for this user
    session.allow(`annotation-*`, session.FULL_ACCESS);
    
    // Authorize
    const { status, body } = await session.authorize();
    
    console.log('Liveblocks authorization successful, status:', status);
    
    res.status(status).send(body);
    
  } catch (error) {
    console.error('Liveblocks auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authorize Liveblocks session',
      details: error.message
    });
  }
});

export default router;