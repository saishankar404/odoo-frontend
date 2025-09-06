// Example backend handler for receiving Clerk tokens
// This is just an example - adapt it to your backend framework

const express = require('express');
const app = express();

app.use(express.json());

// Example endpoint to receive and verify Clerk tokens
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { token, userData, timestamp } = req.body;
    
    // Verify the token with Clerk
    // You can use Clerk's backend SDK to verify the token
    const clerkResponse = await fetch('https://api.clerk.com/v1/sessions/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (clerkResponse.ok) {
      const clerkData = await clerkResponse.json();
      
      // Here you can:
      // 1. Store user data in your database
      // 2. Create a session
      // 3. Return custom user data
      
      res.json({
        success: true,
        message: 'Token verified successfully',
        user: {
          id: userData.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          imageUrl: userData.imageUrl,
        },
        clerkData,
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Example endpoint to get user data using the token
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify token with Clerk
    const clerkResponse = await fetch('https://api.clerk.com/v1/sessions/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (clerkResponse.ok) {
      const clerkData = await clerkResponse.json();
      
      // Return user profile data
      res.json({
        success: true,
        user: clerkData,
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
