const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// Registration Route
router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please provide a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log('Request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {  name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error during registration:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

      // Create a JWT payload and sign the token
      // const payload = {
      //   user: {
      //     id: user.id,
      //   },
      // };

//       jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
//         if (err) throw err;
//         res.json({ token });
//       });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).json({ message: 'Server error' });
//     }
//   }
// );

// @route   POST /api/auth/login
// @desc    Login a user and get token
// @access  Public
router.post(
  '/login',
  [
    
    body('email', 'Please provide a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create a JWT payload and sign the token
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get the logged-in user's data
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (optional for session-based auth)
// @access  Private
router.post('/logout', authMiddleware, (req, res) => {
  // For JWT-based systems, client simply needs to delete the token on logout.
  // No real server-side action required.
  res.json({ message: 'User logged out successfully' });
});

module.exports = router;
