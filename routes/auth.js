const express = require('express');
const fs = require('fs').promises; // For file operations
const path = require('path'); // For path manipulation

const router = express.Router();

const USERS_FILE = path.join(__dirname, 'users.txt');

// Helper to read users from file
async function readUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return data.split('\n').filter(Boolean).map(line => {
      const [email, password, role] = line.split(':');
      return { email, password, role };
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File does not exist, return empty array
      return [];
    }
    throw error;
  }
}

// Helper to write a new user to file
async function writeUser(email, password, role) {
  const userEntry = `${email}:${password}:${role}\n`;
  await fs.appendFile(USERS_FILE, userEntry, 'utf8');
}

// @route   POST /api/auth/register
// @desc    Register a new user (file-based)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password, and role are required.' });
    }

    const users = await readUsers();
    if (users.some(user => user.email === email)) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    await writeUser(email, password, role);

    res.status(201).json({ success: true, message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user (file-based)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ success: false, message: 'Email, password, and user type are required.' });
    }

    const users = await readUsers();
    const user = users.find(u => u.email === email && u.password === password && u.role === userType);

    if (user) {
      // For basic file-based login, we'll return a simplified user object
      // and a dummy token. In a real app, this would be a proper JWT.
      const dummyToken = `dummy-token-${user.email}`;
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: { email: user.email, role: user.role, firstName: user.email.split('@')[0], lastName: '' }, // Simplified user data
          token: dummyToken
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials or user type.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (no-op for file-based)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logout successful (no-op for basic auth).' });
});

// @route   GET /api/auth/me
// @desc    Get current user profile (dummy for file-based)
// @access  Private (requires token, but token is dummy)
router.get('/me', (req, res) => {
  // In a real app, this would validate the token and return user data.
  // For this basic implementation, we'll assume a valid token and return a generic user.
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    const email = token.replace('dummy-token-', '');
    // This is a very basic way to get user info from a dummy token
    // In a real app, you'd decode a JWT or query a database
    const role = email.includes('practitioner') ? 'practitioner' : 'patient'; // Infer role
    res.json({
      success: true,
      data: {
        user: { email, role, firstName: email.split('@')[0], lastName: '' },
        profile: {} // No detailed profile for basic setup
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized: No token provided.' });
  }
});

module.exports = router;
